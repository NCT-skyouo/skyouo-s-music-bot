/*
MIT License

Copyright (c) 2020 Androz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Discord = require('discord.js')
const { demuxProbe, createAudioResource, AudioResource } = require('@discordjs/voice')
const Queue = require('./Queue')

const { spawn } = require('child_process');

const LocalTools = require('./LocalTools')
const { Readable } = require('stream')

// yt-dlp <url> -q -o - -f bestaudio - | ffmpeg -i - -acodec libopus -f opus -ac 2 -ar 48000 -
// pipe yt-dlp's stdout to ffmpeg's stdin, get ffmpeg's stdout as a ReadableStream
function FFmpegOpus(stream, seekTime=0, filterArg=0) {
  var seek = seekTime ? ["-ss", LocalTools.ms2mmss(seekTime)] : []
  let encoderArgs = [
    "-i",
    "-",
    ...seek,
    "-reconnect", 
    "1",
    "-reconnect_at_eof", 
    "1",
    "-reconnect_streamed", 
    "1",
    "-reconnect_delay_max", 
    "5",
    "-analyzeduration", 
    "0",
    "-loglevel", 
    "0",
    "-acodec",
    "libopus",
    "-f", 
    "opus",
    "-ar", 
    "48000",
    "-ac", 
    "2",
    "-b:a",
    "168k",
    ...filterArg,
    "-"
  ];

  //const ffmpeg = new prism.FFmpeg({ shell: false, args: encoderArgs });
  //ffmpeg.on('error', console.error)
  //ffmpeg.once('close', ffmpeg.destroy)

  const ffmpeg = spawn(require('ffmpeg-static'), encoderArgs, {
    stdio: ['pipe', 'pipe', 'ignore']
  })

  /*ffmpeg.on('exit', () => {
    ffmpeg.stdin.destroy()
    ffmpeg.stdout.destroy()
  })*/

  stream.pipe(ffmpeg.stdin)

  ffmpeg.stdout.on("error", () => {
    if (!ffmpeg.killed) ffmpeg.kill();
    ffmpeg.stdout .resume();
  });

  return ffmpeg.stdout 
}

function FFmpegSeek(stream, seekTime) {
  let encoderArgs = [
    "-i",
    "-",
    "-ss",
    LocalTools.ms2mmss(seekTime),
    "-reconnect", 
    "1",
    "-reconnect_at_eof", 
    "1",
    "-reconnect_streamed", 
    "1",
    "-reconnect_delay_max", 
    "5",
    "-analyzeduration", 
    "0",
    "-loglevel", 
    "0",
    "-acodec",
    "libopus",
    "-f", 
    "opus",
    "-ar", 
    "48000",
    "-ac", 
    "2",
    "-b:a",
    "168k",
    "-"
  ];

  const ffmpeg = spawn(require('ffmpeg-static'), encoderArgs, {
    stdio: ['pipe', 'pipe', 'ignore']
  })

  console.log(LocalTools.ms2mmss(seekTime))

  ffmpeg.on('exit', () => {
    ffmpeg.stdout.resume();
  })

  ffmpeg.stdout.on("error", () => {
    if (!ffmpeg.killed) ffmpeg.kill();
    ffmpeg.stdout.resume();
  });

  stream.pipe(ffmpeg.stdin)

  return ffmpeg.stdout 
}

/**
 * Represents a track.
 */
class Track {
  /**
     * @param {Object} videoData The video data for this track
     * @param {Discord.User?} user The user who requested the track
     * @param {Queue?} queue The queue in which is the track is
     */
  constructor(videoData, user, queue) {

    // console.log(videoData)
    /**
         * The track name
         * @type {string}
         */
    this.name = videoData.title
    /**
         * The Youtube URL of the track
         * @type {string}
         */
    this.url = videoData.url
    /**
         * The video duration (formatted).
         * @type {string}
         */
    this.duration = videoData.duration ? LocalTools.ms2mmss(LocalTools.hmmss2ms(videoData.duration)) : "00:00"
    /**
         * The video description
         * @type {string}
         */
    this.description = videoData.description
    /**
         * The video thumbnail
         * @type {string?}
         */
    this.thumbnail = videoData.bestThumbnail ? videoData.bestThumbnail.url : null
    /**
         * The video views
         * @type {?number}
         */
    this.views = videoData.views
    /**
         * The video channel
         * @type {string}
         */
    this.author = videoData.author?.name
    /**
         * The user who requested the track
         * @type {Discord.User?}
         */
    this.requestedBy = user
    /**
         * Whether the track was added from a playlist
         * @type {boolean}
         */
    this.fromPlaylist = videoData.fromPlaylist || false
    /**
     * The queue in which the track is
     * @type {Queue}
    */
    this.queue = queue
    /**
     * The channel that should send some earn notice
     * @type {Discord.Channel?}
    */
    this.channel = null
    /**
     * whether this video is from Youtube or Not, If not, v6 won't recommend new videos.
     * @type {boolean?}
    */
    this.fromYoutube = videoData.fromYoutube === false ? false : true

    this.ms = () => {
      const args = this.duration.split(':')
      if (args.length === 3) {
        return parseInt(args[0]) * 60 * 60 * 1000 +
          parseInt(args[1]) * 60 * 1000 +
          parseInt(args[2]) * 1000
      } else if (args.length === 2) {
        return parseInt(args[0]) * 60 * 1000 +
          parseInt(args[1]) * 1000
      } else {
        return parseInt(args[0]) * 1000
      }
    }
  }

  /**
   * @returns {Promise<AudioResource>}
   */
  createAudioResource(seekTime, encoderArgs, player) {
    return new Promise(async (resolve, reject) => {

      var newStream = player.extractor.extractTrack(this, { encoderArgs, seekTime });
      
      newStream = newStream instanceof Readable ? newStream : newStream instanceof Promise ? (await newStream)?.stream : newStream.stdout;
      
      if (encoderArgs.length) newStream = FFmpegOpus(newStream, seekTime, encoderArgs);

      demuxProbe(newStream)
        .then((probe) => {
          var afterStream = (encoderArgs.length || !seekTime) ? probe.stream : FFmpegSeek(probe.stream, seekTime)
          resolve(createAudioResource(afterStream, { metadata: this, inputType: probe.type, inlineVolume: true }))
        }) // make inline volume true = use ffmpeg
        .catch(reject);
    })
  }

  /**
     * The track duration
     * @type {number}
     */
  get durationMS() {
    const args = this.duration.split(':')
    if (args.length === 3) {
      return parseInt(args[0]) * 60 * 60 * 1000 +
        parseInt(args[1]) * 60 * 1000 +
        parseInt(args[2]) * 1000
    } else if (args.length === 2) {
      return parseInt(args[0]) * 60 * 1000 +
        parseInt(args[1]) * 1000
    } else {
      return parseInt(args[0]) * 1000
    }
  }

  getAllInfo() {
    return {
      name: this.name,
      url: this.url,
      duration: this.duration,
      description: this.description,
      thumbnail: this.thumbnail,
      views: this.views,
      author: this.author,
      requestedBy: this.requestedBy,
      fromPlaylist: this.fromPlaylist,
      queue: this.queue,
      channel: this.channel,
      fromYoutube: this.fromYoutube
    }
  }

  getAllInfoForList() {
    return {
      name: this.name,
      url: this.url,
      duration: this.duration,
      description: this.description,
      thumbnail: this.thumbnail,
      views: this.views,
      author: this.author,
      fromPlaylist: this.fromPlaylist,
      channel: this.channel,
      fromYoutube: this.fromYoutube
    }
  }

  static listInfoToTrack(info) {
    return new Track({
      title: info.name,
      url: info.url,
      duration: info.duration,
      description: info.description,
      bestThumbnail: { url: info.thumbnail },
      views: info.views,
      author: info.author,
      fromPlaylist: info.fromPlaylist,
      channel: info.channel,
      fromYoutube: info.fromYoutube
    }, null, null)
  }
}

module.exports = Track
