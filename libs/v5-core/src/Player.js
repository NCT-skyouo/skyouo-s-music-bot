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

const ytdl = require('discord-ytdl-core')
const Discord = require('discord.js')
const ytsr = require('ytsr')
const ytpl = require('ytpl')
const YouTube = require('simple-youtube-api')
const spotify = require('spotify-url-info')
const YTDL = require("youtube-dl")
const Queue = require('./Queue')
const Track = require('./Track')
const Tools = require('./LocalTools')

/**
 * @typedef Filters
 * @property {boolean} [bassboost=false] Whether the bassboost filter is enabled.
 * @property {boolean} [8D=false] Whether the 8D filter is enabled.
 * @property {boolean} [vaporwave=false] Whether the vaporwave filter is enabled.
 * @property {boolean} [nightcore=false] Whether the nightcore filter is enabled.
 * @property {boolean} [phaser=false] Whether the phaser filter is enabled.
 * @property {boolean} [tremolo=false] Whether the tremolo filter is enabled.
 * @property {boolean} [vibrato=false] Whether the vibrato filter is enabled.
 * @property {boolean} [reverse=false] Whether the reverse filter is enabled.
 * @property {boolean} [treble=false] Whether the treble filter is enabled.
 * @property {boolean} [normalizer=false] Whether the normalizer filter is enabled.
 * @property {boolean} [surrounding=false] Whether the surrounding filter is enabled.
 * @property {boolean} [pulsator=false] Whether the pulsator filter is enabled.
 * @property {boolean} [subboost=false] Whether the subboost filter is enabled.
 * @property {boolean} [karaoke=false] Whether the karaoke filter is enabled.
 * @property {boolean} [flanger=false] Whether the flanger filter is enabled.
 * @property {boolean} [gate=false] Whether the gate filter is enabled.
 * @property {boolean} [haas=false] Whether the haas filter is enabled.
 * @property {boolean} [mcompand=false] Whether the mcompand filter is enabled.
 */

const filters = {
  bassboost: 'bass=g=25,dynaudnorm=f=200',
  '8D': 'apulsator=hz=0.08',
  vaporwave: 'aresample=48000,asetrate=48000*0.8',
  nightcore: 'aresample=48000,asetrate=48000*1.25',
  phaser: 'aphaser=in_gain=0.4',
  tremolo: 'tremolo',
  vibrato: 'vibrato=f=6.5',
  reverse: 'areverse',
  treble: 'treble=g=5',
  normalizer: 'dynaudnorm=f=200',
  surrounding: 'surround',
  pulsator: 'apulsator=hz=1',
  subboost: 'asubboost',
  karaoke: 'stereotools=mlev=0.015625,stereotools=mode=lr>rr',
  flanger: 'flanger',
  gate: 'agate',
  haas: 'haas',
  mcompand: 'mcompand',
  ok: 'pan=stereo|c0=c0|c1=-1*c1',
  echo: 'aecho=0.8:0.88:220:0.4',
  shadow: 'aecho=0.8:0.88:110:0.4',
  mountain: "aecho=0.85:0.95:560:0.6"
}

/**
 * @typedef PlayerOptions
 * @property {boolean} [leaveOnEnd=true] Whether the bot should leave the current voice channel when the queue ends.
 * @property {boolean} [leaveOnStop=true] Whether the bot should leave the current voice channel when the stop() function is used.
 * @property {boolean} [leaveOnEmpty=true] Whether the bot should leave the voice channel if there is no more member in it.
 */

/**
 * Default options for the player
 * @ignore
 * @type {PlayerOptions}
 */
const defaultPlayerOptions = {
  leaveOnEnd: true,
  leaveOnStop: true,
  leaveOnEmpty: true
}

class Player {
  /**
     * @param {Discord.Client} client Discord.js client
     * @param {PlayerOptions} options Player options
     */
  constructor(client, options = {}) {
    if (!client) throw new SyntaxError('Invalid Discord client')

    /**
         * Discord.js client instance
         * @type {Discord.Client}
         */
    this.client = client
    /**
         * Player queues
         * @type {Queue[]}
         */
    this.queues = []
    /**
         * Player options
         * @type {PlayerOptions}
         */
    this.options = defaultPlayerOptions
    for (const prop in options) {
      this.options[prop] = options[prop]
    }
    /**
         * Default filters for the queues created with this player.
         * @type {Filters}
         */
    this.filters = filters

    /**
         * Whether Use API or Not
         * @type {boolean}
         */
    this.useAPI = options.useAPI || false

    if (options.useAPI) {
      if (!options.apiKEYs) throw new Error('No API Keys Found!')
      this.apiKEYs = options.apiKEYs
    }

    // Listener to check if the channel is empty
    client.on('voiceStateUpdate', (oldState, newState) => this._handleVoiceStateUpdate(oldState, newState))
  }

  /**
     * Set the filters enabled for the guild. [Full list of the filters](https://discord-player.js.org/global.html#Filters)
     * @param {Discord.Snowflake} guildID
     * @param {Filters} newFilters
     *
     * @example
     * client.on('message', async (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'bassboost'){
     *          const bassboostEnabled = client.player.getQueue(message.guild.id).filters.bassboost;
     *          if(!bassboostEnabled){
     *              client.player.setFilters(message.guild.id, {
     *                  bassboost: true
     *              });
     *              message.channel.send("Bassboost effect has been enabled!");
     *          } else {
     *              client.player.setFilters(message.guild.id, {
     *                  bassboost: false
     *              });
     *              message.channel.send("Bassboost effect has been disabled!");
     *          }
     *      }
     *
     * });
     */
  setFilters(guildID, newFilters) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      Object.keys(newFilters).forEach((filterName) => {
        queue.filters[filterName] = newFilters[filterName]
      })
      this._playYTDLStream(queue, true, false)
    })
  }

  /**
     * Resolve an array of tracks objects from a query string
     * @param {string} query The query
     * @param {boolean} allResults Whether all the results should be returned, or only the first one
     * @returns {Promise<Track[]>}
     *
     * @example
     * client.on('message', async (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'play'){
     *          // Search for tracks
     *          let tracks = await client.player.searchTracks(args[0]);
     *          // Sends an embed with the 10 first songs
     *          if(tracks.length > 10) tracks = tracks.slice(0, 10);
     *          const embed = new Discord.MessageEmbed()
     *          .setDescription(tracks.map((t, i) => `**${i+1} -** ${t.name}`).join("\n"))
     *          .setFooter("Send the number of the track you want to play!");
     *          message.channel.send(embed);
     *          // Wait for user answer
     *          await message.channel.awaitMessages((m) => m.content > 0 && m.content < 11, { max: 1, time: 20000, errors: ["time"] }).then(async (answers) => {
     *              let index = parseInt(answers.first().content, 10);
     *              track = track[index-1];
     *              // Then play the song
     *              client.player.play(message.member.voice.channel, track);
     *          });
     *      }
     *
     * });
     */
  searchTracks(query, allResults = false) {
    return new Promise(async (resolve, reject) => {
      let youtube
      if (this.useAPI) youtube = new YouTube(this.apiKEYs[Math.floor(Math.random() * this.apiKEYs.length)])
      if (ytpl.validateID(query)) {
        const playlistID = await ytpl.getPlaylistID(query).catch(() => { })
        if (playlistID) {
          if (!this.useAPI) {
            const playlist = await ytpl(playlistID).catch(() => { })
            if (playlist) {
              return resolve(playlist.items.map((i) => new Track({
                title: i.title,
                duration: i.duration,
                thumbnail: i.thumbnail,
                author: i.author,
                url: i.url,
                startAT: Date.now(),
                fromPlaylist: true
              }, null, null)))
            }
          } else {
            const playlist = await youtube.getPlaylistByID(playlistID).catch(() => { })
            if (playlist) {
              const videos = await playlist.getVideos()
              Promise.all(videos.map(async (v) => {
                const a = await v.fetch()
                const b = []
                for (const _ in a.duration) {
                  if (a.duration[_] == '0') continue
                  if (a.duration[_].length < 2) a.duration[_] = '0' + a.duration[_]
                  b.push(a.duration[_])
                }
                v.duration = b.join(':')
                return v
              })).then((result) => {
                return resolve(result.map((i) => new Track({
                  title: i.title,
                  duration: i.duration,
                  thumbnail: i.maxRes.url,
                  author: { name: i.channel.title },
                  url: i.url,
                  startAT: Date.now(),
                  fromPlaylist: true
                }, null, null)))
              })
            }
          }
        }
      }
      const matchSpotifyURL = query.match(/https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/)
      if (matchSpotifyURL) {
        const spotifyData = await spotify.getPreview(query).catch(e => resolve([]))
        query = `${spotifyData.artist} - ${spotifyData.track}`
      }
      // eslint-disable-next-line no-useless-escape
      const matchYoutubeURL = query.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
      if (matchYoutubeURL) {
        query = matchYoutubeURL[1]
      }
      if (!this.useAPI) {
        ytsr(query).then((results) => {
          if (results.items.length < 1) return resolve([])
          const resultsVideo = results.items.filter((i) => i.type === 'video').map(r => {
            r.startAT = Date.now()
            return r
          })
          resolve(allResults ? resultsVideo.map((r) => new Track(r, null, null)) : [new Track(resultsVideo[0], null, null)])
        }).catch(() => {
          return resolve([])
        })
      } else {
        youtube.searchVideos(query, 15, { part: 'snippet' })
          .then(async (res) => {
            if (res.length < 1) return resolve([])
            const resultsVideo = res.map(r => {
              r.startAT = Date.now()
              r.title = r.title
              r.bestThumbnail = r.maxRes
              r.author = { name: r.channel.title }
              return r
            })
            Promise.all(resultsVideo.map(async (v) => {
              const a = await v.fetch()
              const b = []
              for (const _ in a.duration) {
                if (a.duration[_] == '0') continue
                if (a.duration[_].length < 2) a.duration[_] = '0' + a.duration[_]
                b.push(a.duration[_])
              }
              v.duration = b.join(':')
              return v
            })).then((result) => {
              resolve(allResults ? result.map((r) => new Track(r, null, null)) : [new Track(result[0], null, null)])
            })
          })
          .catch((e) => {
            console.log(e)
            return resolve([])
          })
      }
    })
  }

  /**
   * @description Download Youtube Video As ReadableStream
   * @returns {Stream.ReadableStream} Readable Stream
   * @param {string} url
   * @param {Discord.User|Discord.GuildMember} requester
   * @param {Object} options
   * @example
   * var stream = music.downloadAsStream(msg.guild, args[0], msg.author, { useFFmpeg: true, bitrate: 64 })
   */
  /*downloadAsStream(url, options={}) {
    if (!url) throw new Error("Missing Args.")
    if (!options.useFFmpeg) {
      return this.ytdlwrapper.execStream([url, "-f" ,"bestaudio", "--extract-audio", "--audio-quality", `${options.bitrate}K`])
    } else {
      return this.ytdlwrapper.execStream([url, "-f" ,"bestaudio", "--extract-audio", "--audio-quality", `${options.bitrate}K`, "--prefer-ffmpeg", "--ffmpeg-location", require("ffmpeg-static")])
    }
  }*/

  /**
     * Whether a guild is currently playing something
     * @param {Discord.Snowflake} guildID The guild ID to check
     * @returns {boolean} Whether the guild is currently playing tracks
     */
  isPlaying(guildID) {
    return this.queues.some((g) => g.guildID === guildID)
  }

  /**
     * Play a track in a voice channel
     * @param {Discord.VoiceChannel} voiceChannel The voice channel in which the track will be played
     * @param {Track|string} track The name of the track to play
     * @param {Discord.User?} user The user who requested the track
     * @returns {any} The played content
     *
     * @example
     * client.on('message', async (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      // !play Despacito
     *      // will play "Despacito" in the member voice channel
     *
     *      if(command === 'play'){
     *          const result = await client.player.play(message.member.voice.channel, args.join(" "));
     *          if(result.type === 'playlist'){
     *              message.channel.send(`${result.tracks.length} songs added to the queue!\nCurrently playing **${result.tracks[0].name}**...`);
     *          } else {
     *              message.channel.send(`Currently playing ${result.name}...`);
     *          }
     *      }
     *
     * });
     */
  play(voiceChannel, track, user) {
    this.queues = this.queues.filter((g) => g.guildID !== voiceChannel.id)
    return new Promise(async (resolve, reject) => {
      if (!voiceChannel || typeof voiceChannel !== 'object') {
        return reject(new Error(`voiceChannel must be type of VoiceChannel. value=${voiceChannel}`))
      }
      const connection = voiceChannel.client.voice.connections.find((c) => c.channel.id === voiceChannel.id) || await voiceChannel.join()
      // Create a new guild with data
      const queue = new Queue(voiceChannel.guild.id)
      queue.voiceConnection = connection
      queue.filters = {}
      Object.keys(this.filters).forEach((f) => {
        queue.filters[f] = false
      })
      let result = null
      if (typeof track === 'object') {
        track.requestedBy = user
        result = track
        // Add the track to the queue
        queue.tracks.push(track)
      } else if (typeof track === 'string') {
        const results = await this.searchTracks(track).catch(() => {
          return reject(new Error('Not found'))
        })
        if (!results) return
        if (results.length > 1) {
          result = {
            type: 'playlist',
            tracks: results
          }
        } else if (results[0]) {
          result = results[0]
        } else {
          return reject(new Error('Not found'))
        }
        results.forEach((i) => {
          i.requestedBy = user
          queue.tracks.push(i)
        })
      }
      // Add the queue to the list
      this.queues.push(queue)
      // Play the track
      this._playTrack(queue.guildID, true)
      // Resolve the track
      resolve(result)
    })
  }

  /**
     * Pause the current track
     * @param {Discord.Snowflake} guildID The ID of the guild where the current track should be paused
     * @returns {Promise<Track>} The paused track
     *
     * @example
     * client.on('message', async (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'pause'){
     *          const track = await client.player.pause(message.guild.id);
     *          message.channel.send(`${track.name} paused!`);
     *      }
     *
     * });
     */
  pause(guildID) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Pause the dispatcher
      queue.voiceConnection.dispatcher.pause()
      queue.paused = true
      // Resolve the guild queue
      resolve(queue.playing)
    })
  }

  /**
     * Resume the current track
     * @param {Discord.Snowflake} guildID The ID of the guild where the current track should be resumed
     * @returns {Promise<Track>} The resumed track
     *
     * @example
     * client.on('message', async (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'resume'){
     *          const track = await client.player.resume(message.guild.id);
     *          message.channel.send(`${track.name} resumed!`);
     *      }
     *
     * });
     */
  resume(guildID) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Pause the dispatcher
      queue.voiceConnection.dispatcher.resume()
      queue.paused = false
      // Resolve the guild queue
      resolve(queue.playing)
    })
  }

  /**
     * Stop the music in the guild
     * @param {Discord.Snowflake} guildID The ID of the guild where the music should be stopped
     * @returns {Promise<void>}
     *
     * @example
     * client.on('message', (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'stop'){
     *          client.player.stop(message.guild.id);
     *          message.channel.send('Music stopped!');
     *      }
     *
     * });
     */
  stop(guildID) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Stop the dispatcher
      queue.stopped = true
      queue.tracks = []
      if (queue.stream) queue.stream.destroy()
      queue.voiceConnection.dispatcher.end()
      // Resolve
      resolve()
    })
  }

  /**
     * Update the volume
     * @param {Discord.Snowflake} guildID The ID of the guild where the music should be modified
     * @param {number} percent The new volume (0-100)
     * @returns {Promise<void>}
     *
     * @example
     * client.on('message', (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'set-volume'){
     *          client.player.setVolume(message.guild.id, parseInt(args[0]));
     *          message.channel.send(`Volume set to ${args[0]} !`);
     *      }
     *
     * });
     */
  setVolume(guildID, percent) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Update volume
      queue.volume = percent
      queue.voiceConnection.dispatcher.setVolumeLogarithmic(queue.calculatedVolume / 200)
      // Resolve guild queue
      resolve()
    })
  }

  /**
     * Get a guild queue
     * @param {Discord.Snowflake} guildID
     * @returns {?Queue}
     *
     * @example
     * client.on('message', (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'queue'){
     *          const queue = await client.player.getQueue(message.guild.id);
     *          message.channel.send('Server queue:\n'+(queue.tracks.map((track, i) => {
     *              return `${i === 0 ? 'Current' : `#${i+1}`} - ${track.name} | ${track.author}`;
     *          }).join('\n')));
     *      }
     *
     *      // Output:
     *
     *      // Server queue:
     *      // Current - Despacito | Luis Fonsi
     *      // #2 - Memories | Maroon 5
     *      // #3 - Dance Monkey | Tones And I
     *      // #4 - Circles | Post Malone
     * });
     */
  getQueue(guildID) {
    // Gets guild queue
    const queue = this.queues.find((g) => g.guildID === guildID)
    return queue
  }

  /**
     * Add a track to the guild queue
     * @param {Discord.Snowflake} guildID The ID of the guild where the track should be added
     * @param {Track|string} trackName The name of the track to add to the queue
     * @param {Discord.User?} user The user who requested the track
     * @returns {any} The content added to the queue
     *
     * @example
     * client.on('message', async (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'play'){
     *          let trackPlaying = client.player.isPlaying(message.guild.id);
     *          // If there's already a track being played
     *          if(trackPlaying){
     *              const result = await client.player.addToQueue(message.guild.id, args.join(" "));
     *              if(result.type === 'playlist'){
     *                  message.channel.send(`${result.tracks.length} songs added to the queue!`);
     *              } else {
     *                  message.channel.send(`${result.name} added to the queue!`);
     *              }
     *          } else {
     *              // Else, play the track
     *              const result = await client.player.addToQueue(message.member.voice.channel, args[0]);
     *              if(result.type === 'playlist'){
     *                  message.channel.send(`${result.tracks.length} songs added to the queue\nCurrently playing **${result.tracks[0].name}**!`);
     *              } else {
     *                  message.channel.send(`Currently playing ${result.name}`);
     *              }
     *          }
     *      }
     *
     * });
     */
  addToQueue(guildID, track, user) {
    return new Promise(async (resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Search the track
      let result = null
      if (typeof track === 'object') {
        track.requestedBy = user
        result = track
        // Add the track to the queue
        queue.tracks.push(track)
      } else if (typeof track === 'string') {
        const results = await this.searchTracks(track).catch(() => {
          return reject(new Error('Not found'))
        })
        if (!results) return
        if (results.length > 1) {
          result = {
            type: 'playlist',
            tracks: results
          }
        } else if (results[0]) {
          result = results[0]
        } else {
          return reject(new Error('Not found'))
        }
        results.forEach((i) => {
          i.requestedBy = user
          queue.tracks.push(i)
        })
      }
      // Resolve the result
      resolve(result)
    })
  }

  /**
     * Clear the guild queue, except the current track
     * @param {Discord.Snowflake} guildID The ID of the guild where the queue should be cleared
     * @returns {Promise<Queue>} The updated queue
     *
     * @example
     * client.on('message', (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'clear-queue'){
     *          client.player.clearQueue(message.guild.id);
     *          message.channel.send('Queue cleared!');
     *      }
     *
     * });
     */
  clearQueue(guildID) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Clear queue
      queue.tracks = []
      // Resolve guild queue
      resolve(queue)
    })
  }

  /**
     * Skip a track
     * @param {Discord.Snowflake} guildID The ID of the guild where the track should be skipped
     * @returns {Promise<Track>}
     *
     * @example
     * client.on('message', async (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'skip'){
     *          const track = await client.player.skip(message.guild.id);
     *          message.channel.send(`${track.name} skipped!`);
     *      }
     *
     * });
     */
  skip(guildID) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      const currentTrack = queue.playing
      // End the dispatcher
      queue.voiceConnection.dispatcher.end()
      queue.lastSkipped = true
      // Resolve the current track
      resolve(currentTrack)
    })
  }

  /**
     * Get the currently playing track
     * @param {Discord.Snowflake} guildID
     * @returns {Promise<Track>} The track which is currently played
     *
     * @example
     * client.on('message', async (message) => {
     *
     *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *      const command = args.shift().toLowerCase();
     *
     *      if(command === 'now-playing'){
     *          let track = await client.player.nowPlaying(message.guild.id);
     *          message.channel.send(`Currently playing ${track.name}...`);
     *      }
     *
     * });
     */
  nowPlaying(guildID) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      const currentTrack = queue.playing
      // Resolve the current track
      resolve(currentTrack)
    })
  }

  /**
     * Enable or disable the repeat mode
     * @param {Discord.Snowflake} guildID
     * @param {Boolean} enabled Whether the repeat mode should be enabled
     * @returns {Promise<Void>}
     *
     * @example
     * client.on('message', async (message) => {
     *
     *     const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *     const command = args.shift().toLowerCase();
     *
     *     if(command === 'repeat-mode'){
     *         const repeatModeEnabled = client.player.getQueue(message.guild.id).repeatMode;
     *         if(repeatModeEnabled){
     *              // if the repeat mode is currently enabled, disable it
     *              client.player.setRepeatMode(message.guild.id, false);
     *              message.channel.send("Repeat mode disabled! The current song will no longer be played again and again...");
     *         } else {
     *              // if the repeat mode is currently disabled, enable it
     *              client.player.setRepeatMode(message.guild.id, true);
     *              message.channel.send("Repeat mode enabled! The current song will be played again and again until you run the command again!");
     *         }
     *     }
     *
     * });
     */
  setRepeatMode(guildID, enabled) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Enable/Disable repeat mode
      queue.repeatMode = enabled
      // Resolve
      resolve()
    })
  }

  /**
     * Enable or disable the queue repeat mode
     * @param {Discord.Snowflake} guildID
     * @param {Boolean} enabled Whether the repeat mode should be enabled
     * @returns {Promise<Void>}
    */
  setQueueRepeatMode(guildID, enabled) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Enable/Disable repeat mode
      queue.queueLoopMode = enabled
      // Save current queue tracks
      queue.tracksCache = Array.from([queue.playing]).concat(queue.tracks)
      // Resolve
      resolve()
    })
  }

  /**
     * Shuffle the guild queue (except the first track)
     * @param {Discord.Snowflake} guildID The ID of the guild where the queue should be shuffled
     * @returns {Promise<Queue>} The updated queue
     *
     * @example
     * client.on('message', async (message) => {
     *
     *     const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *     const command = args.shift().toLowerCase();
     *
     *     if(command === 'shuffle'){
     *         // Shuffle the server queue
     *         client.player.shuffle(message.guild.id).then(() => {
     *              message.channel.send('Queue shuffled!');
     *         });
     *      }
     *
     * });
     */
  shuffle(guildID) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Shuffle the queue (except the first track)
      const currentTrack = queue.tracks.shift()
      queue.tracks = queue.tracks.sort(() => Math.random() - 0.5)
      queue.tracks.unshift(currentTrack)
      // Resolve
      resolve(queue)
    })
  }

  /**
     * Remove a track from the queue
     * @param {Discord.Snowflake} guildID The ID of the guild where the track should be removed
     * @param {number|Track} track The index of the track to remove or the track to remove object
     * @returns {Promise<Track|null>}
     *
     * @example
     * client.on('message', async (message) => {
     *
     *     const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *     const command = args.shift().toLowerCase();
     *
     *     if(command === 'remove'){
     *         // Remove a track from the queue
     *         client.player.remove(message.guild.id, args[0]).then(() => {
     *              message.channel.send('Removed track!');
     *         });
     *      }
     *
     * });
     */
  remove(guildID, track) {
    return new Promise((resolve, reject) => {
      // Gets guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Remove the track from the queue
      let trackFound = null
      if (typeof track === 'number') {
        trackFound = queue.tracks[track]
        if (trackFound) {
          queue.tracks = queue.tracks.filter((t) => t !== trackFound)
        }
      } else {
        trackFound = queue.tracks.filter((s) => s.name.includes(track))
        if (trackFound[0]) {
          queue.tracks = queue.tracks.filter((t) => t !== trackFound)
        }
      }
      // Resolve
      resolve(trackFound)
    })
  }

  /**
     * Creates progress bar of the current song
     * @param {Discord.Snowflake} guildID
     * @returns {String}
     *
     * @example
     * client.on('message', async (message) => {
     *
     *     const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
     *     const command = args.shift().toLowerCase();
     *
     *     if(command === 'now-playing'){
     *         client.player.nowPlaying(message.guild.id).then((song) => {
     *              message.channel.send('Currently playing ' + song.name + '\n\n'+ client.player.createProgressBar(message.guild.id));
     *         });
     *      }
     *
     * });
     */
  createProgressBar(guildID) {
    // Gets guild queue
    const queue = this.queues.find((g) => g.guildID === guildID)
    if (!queue) return
    // Stream time of the dispatcher
    const currentStreamTime = queue.voiceConnection.dispatcher
      ? queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime
      : 0
    // Total stream time
    const totalTime = queue.playing.ms()
    // Stream progress
    const index = Math.round((currentStreamTime / totalTime) * 15)
    // conditions
    if ((index >= 1) && (index <= 15)) {
      const bar = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬'.split('')
      bar.splice(index, 0, '🔘')
      return bar.join('')
    } else {
      return '🔘▬▬▬▬▬▬▬▬▬▬▬▬▬▬'
    }
  }

  /*
    * seek to the specify time
    * @param {Discord.Snowflake} guildID
    * @param {Date.string} timeFormated
    */
  seek(guildID, timeFormated) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) reject('Not Playing')
      try {
        const time = timeFormated.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0)
        if (!time || time > (queue.playing.ms() / 1000)) reject('Cannot seek')
        this._playYTDLStream(queue, false, time * 1000).then(resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
     * Speed up the video
     * @param {Discord.Snowflake} guildID
     * @param {Number} speed
     */
  speedUp(guildID, speed) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      if (isNaN(speed) || speed > 100) reject("Bad speed. The speed is not a integer or it's above than 100.")
      queue.speed = speed
      this._playYTDLStream(queue, true, false).then(resolve)
    })
  }
  /**
     * Adjust the pitch of the video
     * @param {Discord.Snowflake} guildID
     * @param {Number} pitch
     */
  pitchUp(guildID, pitch) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      if (isNaN(pitch) || pitch > 100) reject("Bad pitch. The pitch is not a integer or it's above than 100.")
      queue.pitch = pitch
      this._playYTDLStream(queue, true, false).then(resolve)
    })
  }
  /**
   * Jump to the specified tracks number
   * @param {Discord.Snowflake} guildID
   * @param {Number} number
   */
  jump(guildID, number) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) reject('Not Playing')
      try {
        if (!((number - 1) < queue.tracks.length)) reject(new Error("只訂數字大於"))
        queue.tracks.slice(0, (queue.tracks.length - number))
        this._playYTDLStream(queue, false).then(resolve)
      } catch (e) {
        reject(e)
      }
    })
  }
  /**
   * Play previous track in the queue
   * @param {Discord.Snowflake} guildID
   */
  previous(guildID) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) reject('Not Playing')
      try {
        if (!queue.previousTrack.length) reject(new Error("找不到上個播放的歌曲"))
        queue.tracks = Array.from([queue.playing]).concat(queue.tracks)
        queue.playing = queue.previousTrack[queue.previousTrack.length - 1]
        queue.previousTrack = queue.previousTrack.slice(0, -1)
        this._playYTDLStream(queue, false).then(resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  forward(guildID, time) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) reject('Not Playing')
      try {
        this._playYTDLStream(queue, false, (queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime) + time * 1000)
        .then(resolve)
        .catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  rewind(guildID, time) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) reject('Not Playing')
      try {
        this._playYTDLStream(queue, false, (queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime) - time * 1000)
        .then(resolve)
        .catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
     * Handle the voice state update event
     * @ignore
     * @private
     * @param {Discord.VoiceState} oldState
     * @param {Discord.VoiceState} newState
     */
  _handleVoiceStateUpdate(oldState, newState) {
    if (!this.options.leaveOnEmpty) return
    // If the member leaves a voice channel
    if (!oldState.channelID || newState.channelID) return
    // Search for a queue for this channel
    const queue = this.queues.find((g) => g.voiceConnection.channel.id === oldState.channelID)
    if (queue) {
      // If the channel is not empty
      if (queue.voiceConnection.channel.members.size > 1) return
      // Disconnect from the voice channel
      queue.voiceConnection.channel.leave()
      // Delete the queue
      this.queues = this.queues.filter((g) => g.guildID !== queue.guildID)
      // Emit end event
      queue.emit('channelEmpty')
    }
  }

  /**
     * Play a stream in a channel
     * @ignore
     * @private
     * @param {Queue} queue The queue to play
     * @returns {Promise<string>}
     */
  _download(queue) {
    return new Promise((res, rej) => {
      const encoderArgsFilters = []
      Object.keys(queue.filters).forEach((filterName) => {
        if (queue.filters[filterName]) {
          encoderArgsFilters.push(filters[filterName])
        }
      })
      let encoderArgs
      if (encoderArgsFilters.length < 1) {
        encoderArgs = []
      } else {
        encoderArgs = ['-af', encoderArgsFilters.join(',')]
      }

      const path = require('path').resolve(this.local, queue.playing.url + (encoderArgsFilters.length ? '-' : '') + encoderArgsFilters.join('-') + '.mp3')

      if (require('fs').existsSync(path)) {
        res(path)
      }

      const newStream = ytdl(queue.playing.url, {
        filter: 'audioonly',
        opusEncoded: true,
        encoderArgs,
        highWaterMark: 1 << 25
      })

      newStream.pipe(require('fs').createWriteStream(path))
      newStream.on('error', rej)
      newStream.on('end', () => {
        res(path)
      })
    })
  }

  /**
     * Play a stream in a channel
     * @ignore
     * @private
     * @param {Queue} queue The queue to play
     * @param {Boolean} updateFilter Whether this method is called to update some ffmpeg filters
     * @returns {Promise<void>}
     */
  _playYTDLStream(queue, updateFilter, seek, options={}) {
    return new Promise((resolve, reject) => {
      options.retry = options.retry || 0
      const seekTime = updateFilter ? parseInt((queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime) * queue.speed) : seek || undefined
      const encoderArgsFilters = []
      Object.keys(queue.filters).forEach((filterName) => {
        if (queue.filters[filterName]) {
          encoderArgsFilters.push(filters[filterName])
        }
      })
      let encoderArgs
      const speedArgs = []
      const pitchArgs = []
      if (queue.speed != 1.0) {
        speedArgs.push('atempo=' + parseFloat(queue.speed).toFixed(1))
      }

      if (queue.pitch != 1.0) {
        pitchArgs.push('asetrate=44100*' + parseFloat(queue.pitch).toFixed(2))
        pitchArgs.push('aresample=44100')
      }

      if (encoderArgsFilters.length < 1 && queue.speed === 1.0 && queue.pitch === 1.0) {
        encoderArgs = []
      } else if (queue.speed !== 1.0 || queue.pitch !== 0) {
        encoderArgs = ['-af', ((encoderArgsFilters.concat(speedArgs)).concat(pitchArgs)).join(',')]
      } else {
        encoderArgs = ['-af', (encoderArgsFilters).join(',')]
      }
      const newStream = ytdl(queue.playing.url, {
        filter: 'audioonly',
        opusEncoded: true,
        encoderArgs,
        seek: seekTime / 1000,
        highWaterMark: 1 << 25
      })
      newStream.on('error', console.error)
      setTimeout(() => {
        try {
          if (queue.stream) queue.stream.destroy()
        } catch (e) { reject(e) }
        queue.stream = newStream
        queue.voiceConnection.play(newStream, {
          type: 'opus',
          bitrate: 'auto'
        })
        queue.voiceConnection.dispatcher.on('error', (err) => {
          if (options.retry === 4) {
            reject("發生三次以上錯誤, 已終止.")
          }
          else {
            this._playYTDLStream(queue, updateFilter, seek, { retry: ++options.retry });
          }
          console.log(err);
        })
        if (seekTime) {
          queue.additionalStreamTime = seekTime
        }
        queue.voiceConnection.dispatcher.setVolumeLogarithmic(queue.calculatedVolume / 200)
        // When the track starts
        queue.voiceConnection.dispatcher.on('start', () => {
          resolve()
        })
        // When the track ends
        queue.voiceConnection.dispatcher.on('finish', () => {
          // Reset streamTime
          queue.additionalStreamTime = 0
          // Play the next track
          return this._playTrack(queue.guildID, false)
        })
        queue.voiceConnection.dispatcher.on('error', console.error)
      }, 1000)
    })
  }

  /**
     * Start playing a track in a guild
     * @ignore
     * @private
     * @param {Discord.Snowflake} guildID
     * @param {Boolean} firstPlay Whether the function was called from the play() one
     */
  async _playTrack(guildID, firstPlay) {
    // Get guild queue
    const queue = this.queues.find((g) => g.guildID === guildID)
    // If there isn't any music in the queue
    if (queue.tracks.length < 1 && !firstPlay && !queue.repeatMode) {
      if (queue.queueLoopMode) {
        queue.playing = queue.tracksCache[0]
        queue.tracksCache.slice(1)
        queue.tracks = queue.tracksCache
        console.log(queue.tracksCache)
        if (queue.voiceConnection.dispatcher) queue.voiceConnection.dispatcher.destroy()
        this._playYTDLStream(queue, false).then(() => {
          // Emit trackChanged event
          if (!firstPlay) {
            queue.emit('trackChanged', queue.playing, queue.tracks[0], false, true)
          }
        })
        return;
      }
      // Leave the voice channel
      if (this.options.leaveOnEnd && !queue.stopped) queue.voiceConnection.channel.leave()
      // Remove the guild from the guilds list
      this.queues = this.queues.filter((g) => g.guildID !== guildID)
      // Emit stop event
      if (queue.stopped) {
        if (this.options.leaveOnStop) queue.voiceConnection.channel.leave()
        return queue.emit('stop')
      }
      // Emit end event
      return queue.emit('end')
    }
    const wasPlaying = queue.playing
    queue.previousTrack.push(queue.playing)
    const nowPlaying = queue.playing = queue.repeatMode ? wasPlaying : queue.tracks.shift()
    // Reset lastSkipped state
    queue.lastSkipped = false
    this._playYTDLStream(queue, false).then(() => {
      // Emit trackChanged event
      if (!firstPlay) {
        queue.emit('trackChanged', wasPlaying, nowPlaying, queue.lastSkipped, queue.repeatMode)
      }
    })
  }
};

module.exports = Player
