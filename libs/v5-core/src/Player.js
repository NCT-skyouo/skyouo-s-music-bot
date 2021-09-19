const { EventEmitter } = require("events")

const Discord = require('discord.js')
const { entersState, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice')
const Queue = require('./Queue')
const Track = require('./Track')
const Tools = require('./LocalTools')
const Util = require('./Util')
const Cache = require('../../cache/cache')

const Extractor = require('./extractor/Extractors')

function getFirefoxUserAgent() {
  let date = new Date()
  let version = ((date.getFullYear() - 2018) * 4 + Math.floor(date.getMonth() / 4) + 58) + ".0"
  return `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version} Gecko/20100101 Firefox/${version}`
}

const reqOpt = {
  'Accept-Language': "zh-TW, zh;q=0.9, zh-MO;q=0.8, zh-CN;q=0.7",
  'User-Agent': getFirefoxUserAgent()
}

const noop = () => { } // actually, it's a function which do nothing

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
 *
*/

const filters = {
  bassboost: 'bass=g=12,dynaudnorm=f=250',
  // bassboost: 'bass=g=5',
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
  echo: 'aecho=0.8:0.88:220:0.4',
  shadow: 'aecho=0.8:0.88:110:0.4',
  mountain: "aecho=0.85:0.95:560:0.6",
  metal: "aecho=0.8:0.88:8:0.8",
  fadein: 'afade=t=in:ss=0:d=10',
  compressor: 'compand=points=-80/-105|-62/-80|-15.4/-15.4|0/-12|20/-7.6',
  expander: 'compand=attacks=0:points=-80/-169|-54/-80|-49.5/-64.6|-41.1/-41.1|-25.8/-15|-10.8/-4.5|0/0|20/8.3',
  softlimiter: 'compand=attacks=0:points=-80/-80|-12.4/-12.4|-6/-8|0/-6.8|20/-2.8'
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
  leaveOnEnd: false,
  leaveOnStop: true,
  leaveOnEmpty: true
}

class Player extends EventEmitter {
  /**
     * @param {Discord.Client} client Discord.js client
     * @param {PlayerOptions} options Player options
     */
  constructor(client, options = {}) {
    if (!client) throw new SyntaxError('Invalid Discord client')

    super()

    /**
         * Utilities
         * @type {Util}
         */
    this.util = Util

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

    //this.oldQueue = new Discord.Collection()

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

    this.apiKEYs = options.useAPI ? options.apiKEYs : []

    this.cache = client.cdb ? client.cdb : new Cache()

    this.extractor = new Extractor()

    // Listener to check if the channel is empty
    client.on('voiceStateUpdate', (oldState, newState) => this._handleVoiceStateUpdate(oldState, newState))
  }

  /**
     * @ignore
     * @param {String} query
     */
  resolveQueryType(query, forceType) {
    if (forceType && typeof forceType === 'string') return forceType

    if (Util.isSpotifyLink(query)) {
      return 'spotify-song'
    } else if (Util.isYTPlaylistLink(query)) {
      return 'youtube-playlist'
    } else if (Util.isYTVideoLink(query)) {
      return 'youtube-video'
    } else if (Util.isYTRelatedVideo(query)) {
      return 'youtube-related'
    } else if (Util.isSoundcloudLink(query)) {
      return 'soundcloud-song'
    } else if (Util.isSoundcloudKeyword(query)) {
      return 'soundcloud-keyword'
    } else if (Util.isSoundcloudPlaylist(query)) {
      return 'soundcloud-playlist'
    } else if (Util.isSpotifyPLLink(query)) {
      return 'spotify-playlist'
    } else if (Util.isLBRYVideoLink(query)) {
      return 'lbry-video'
    } else if (Util.isLBRYVideoKeyword(query)) {
      return 'lbry-keyword'
    } else if (Util.isVimeoLink(query)) {
      return 'vimeo'
    } else if (Util.isNetease(query)) {
      return 'netease-song'
    } else if (Util.isNeteaseKeyword(query)) {
      return 'netease-keyword'
    } else if (Util.isNeteasePlaylist(query)) {
      return 'netease-playlist'
    } else if (Util.isBilibiliVideo(query)) {
      return 'bilibili-video'
    } else if (Util.isBilibiliAnime(query)) {
      return 'bilibili-anime'
    } else if (Util.isBilibiliVideoKeyword(query)) {
      return 'bilibili-video-keyword'
    } else if (Util.isBilibiliAnimeKeyword(query)) {
      return 'bilibili-anime-keyword'
    } else if (Util.isTiktokVideo(query)) {
      return 'tiktok-video'
    } else if (Util.isReverbnationLink(query)) {
      return 'reverbnation'
    } else if (Util.isDiscordAttachment(query)) {
      return 'attachment'
    } else {
      return 'youtube-video-keywords'
    }
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
      resolve(this._playYTDLStream(queue, true, false))
    })
  }

  clearFilters(guildID) {
    return new Promise((resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      Object.keys(queue.filters).forEach((filterName) => {
        queue.filters[filterName] = false
      })
      resolve()
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
  searchTracks(query, allResults = false, noCache = false) {
    // todo: Cache results
    return new Promise(async (resolve, reject) => {
      this.extractor.searchTrack(query, { apiKEYs: this.apiKEYs, useAPI: this.useAPI }).then((tracks) => {
        if (Array.isArray(tracks)) {
          if (tracks.length === 0) return reject(new Error('No results'))
          if (!allResults && !tracks[0].fromPlaylist) {
            return resolve([tracks[0]])
          } else {
            return resolve(tracks)
          }
        } else {
          if (!tracks) return reject(new Error('No results'))
          return resolve([tracks])
        }
      }).catch(reject)
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
  play(voiceChannel, track, user, oldQueue) {
    // this.queues = this.queues.filter((g) => g.guildID !== voiceChannel.id)
    // let oldQueue = this.oldQueue.get(voiceChannel.guild.id)
    return new Promise(async (resolve, reject) => {
      if (!voiceChannel || typeof voiceChannel !== 'object') {
        return reject(new Error(`voiceChannel must be type of VoiceChannel. value=${voiceChannel}`))
      }

      const connection = getVoiceConnection(voiceChannel.guildId) || await this._join(voiceChannel)

      // Create a new guild with data
      const queue = new Queue(voiceChannel.guild.id, connection)
      if (oldQueue) queue.autoplay = oldQueue.autoplay;
      queue.voiceConnection = connection
      queue.filters = {}
      // queue.channel = channel
      Object.keys(this.filters).forEach((f) => {
        queue.filters[f] = false
      })
      let result = null
      if (!await this.cache.get(track)) {
        if (Array.isArray(track) && track.length === 1) track = track[0]
        if (Array.isArray(track)) {
          track.forEach(async (t) => {
            t.requestedBy = user
            await this.cache.set(t.name, result);
            // Add the track to the queue
            queue.tracks.push(t)
          })
          result = {
            type: 'list',
            tracks: track
          }
        } else if (typeof track === 'object') {
          track.requestedBy = user
          result = track
          await this.cache.set(track.name, result);
          // Add the track to the queue
          queue.tracks.push(track)
        } else if (typeof track === 'string') {
          const results = await this.searchTracks(track).catch((e) => {
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
            await this.cache.set(track, result);
          } else {
            return reject(new Error('Not found'))
          }
          results.forEach((i) => {
            i.requestedBy = user
            queue.tracks.push(i)
          })
        }
      } else {
        result = await this.cache.get(track);
        result.requestedBy = user
        queue.tracks.push(result)
      }
      // Add the queue to the list
      this.queues.push(queue)
      // Play the track
      this._playTrack(queue.guildID, true)
      // Resolve the track
      resolve(result)
    })
  }

  async _join(channel, options = {}) {
    let conn = joinVoiceChannel({
      guildId: channel.guild.id,
      channelId: channel.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: Boolean(options.deaf)
    });

    try {
      conn = await entersState(conn, VoiceConnectionStatus.Ready, options?.maxTime ?? 20000);
      if (channel.type === "GUILD_STAGE_VOICE") {
        if (!channel.stageInstance) {
          channel.createStageInstance({
            topic: "🎶 準備中...!",
            privacyLevel: "GUILD_ONLY"
          })
        } else channel.stageInstance.setTopic(`🎶 準備中!`);
        await channel.guild.me.voice.setSuppressed(false);
      }
      return conn;
    } catch (err) {
      conn.destroy();
      throw err;
    }
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
      queue.audioPlayer.pause()
      queue.paused = true

      this.emit('pause', queue, queue.playing)
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
      queue.audioPlayer.unpause()
      queue.paused = false

      this.emit('resume', queue, queue.playing)
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
      // clear queue
      queue.tracks = []
      // Stop the dispatcher
      queue.audioPlayer.stop(true)
      queue.autoplay = false
      queue.queueLoopMode = false
      queue.repeatMode = false
      queue.stopped = true
      queue.destroy()
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
      // queue.voiceConnection.dispatcher.setVolumeLogarithmic(queue.calculatedVolume / 200)
      queue.resource.volume.setVolumeLogarithmic(queue.calculatedVolume / 200)
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
  addToQueue(guildID, track, user, number) {
    return new Promise(async (resolve, reject) => {
      // Get guild queue
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) return reject(new Error('Not playing'))
      // Search the track
      let result = null
      if (!await this.cache.get(track)) {
        if (Array.isArray(track) && track.length === 1) track = track[0]
        if (Array.isArray(track)) {
          track.forEach(async (t) => {
            t.requestedBy = user
            await this.cache.set(t.name, result);
            // Add the track to the queue
            if (typeof number !== 'number') queue.tracks.push(t)
            else queue.tracks.splice(number, 0, t)
          })
          result = {
            type: 'list',
            tracks: track
          }
        } else if (typeof track === 'object') {
          track.requestedBy = user
          result = track
          await this.cache.set(track.name, result);
          // Add the track to the queue
          if (typeof number !== 'number') queue.tracks.push(track)
          else queue.tracks.splice(number, 0, track)
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
            await this.cache.set(track, result);
          } else {
            return reject(new Error('Not found'))
          }
          results.forEach((i, index) => {
            i.requestedBy = user
            if (typeof number !== 'number') queue.tracks.push(i)
            else queue.tracks.splice(number + index, 0, i)
          })
        }
      } else {
        result = await this.cache.get(track);
        result.requestedBy = user
        if (typeof number !== 'number') queue.tracks.push(result)
        else queue.tracks.splice(number + index, 0, i)
      }
      this.emit('addTrack', queue, result, user)
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
      queue.audioPlayer.stop();
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
          queue.tracks = queue.tracks.filter((t) => t !== trackFound[0])
          trackFound = queue.tracks.filter((s) => s.name.includes(track))[0]
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
    const currentStreamTime = queue.resource
      ? queue.resource.playbackDuration + queue.additionalStreamTime
      : 0

    // Total stream time
    const totalTime = queue.playing.durationMS
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
      if (!queue) return reject(new Error('Not Playing'))
      if (!timeFormated) return reject('Cannot seek')
      try {
        const time = timeFormated.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0)
        this._playYTDLStream(queue, false, time ? (time * 1000) : 0).then(resolve)
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
      if (!queue) reject(new Error('Not Playing'))
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
      if (!queue) reject(new Error('Not Playing'))
      try {
        if (!queue.previousTrack.length) reject(new Error("找不到上個播放的歌曲"))
        // old implement:
        // queue.tracks = Array.from([queue.playing]).concat(queue.tracks)
        // queue.playing = queue.previousTrack[queue.previousTrack.length - 1]
        // queue.previousTrack = queue.previousTrack.slice(0, -1)

        queue.tracks.unshift(queue.playing)
        queue.playing = queue.previousTrack.shift()
        this._playYTDLStream(queue, false).then(resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  autoplay(guildID) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) reject(new Error('Not Playing'))
      queue.autoplay = !queue.autoplay
      resolve(queue.autoplay)
    })
  }

  vote(guildID, voter) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) reject(new Error('Not Playing'))
      if (queue.voter.includes(voter)) return reject('您已經投票過了!')
      queue.voter.push(voter)
      resolve(queue.voter)
    })
  }

  forward(guildID, time) {
    return new Promise((resolve, reject) => {
      const queue = this.queues.find((g) => g.guildID === guildID)
      if (!queue) reject(new Error('Not Playing'))
      try {
        this._playYTDLStream(queue, true, (queue.resource.playbackDuration + queue.additionalStreamTime) + time * 1000)
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
      if (!queue) reject(new Error('Not Playing'))
      try {
        this._playYTDLStream(queue, true, (queue.resource.playbackDuration + queue.additionalStreamTime) - time * 1000)
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
    const queue = this.queues.find((g) => g.voiceConnection.joinConfig.guildId === oldState.guild.id)
    if (!queue) return

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      if (queue.voiceConnection) queue.voiceConnection.channel = newState.channel;
    }

    if (!oldState.member.id === newState.guild.me.id) return;

    if (!oldState.channelId && newState.channelId) { // If the bot joins a voice channel
      (newState.serverMute || !newState.serverMute) ? (() => {
        newState.serverMute ? this.pause(queue.guildID) : this.resume(queue.guildID)
      }) : void 0; // eslint-disable-line no-unused-expressions // What the fuck?

      (newState.suppress || !newState.suppress) ? (() => {
        newState.suppress ? (newState.guild.me.voice.setRequestToSpeak(true).catch(noop), this.pause(queue.guildID)) : this.resume(queue.guildID) // eslint-disable-line no-unused-expressions
      })() : void 0;  // eslint-disable-line no-unused-expressions // What the fuck?
    }

    if (oldState.channelId === newState.channelId) { // If the bot changes its voice channel
      oldState.serverMute != newState.serverMute ? (() => {
        newState.serverMute ? this.pause(queue.guildID) : this.resume(queue.guildID)
      }) : void 0; // eslint-disable-line no-unused-expressions // What the fuck?

      oldState.suppress != newState.suppress ? (() => {
        newState.suppress ? (newState.guild.me.voice.setRequestToSpeak(true).catch(noop), this.pause(queue.guildID)) : this.resume(queue.guildID) // eslint-disable-line no-unused-expressions
      })() : void 0;  // eslint-disable-line no-unused-expressions // What the fuck?
    }

    if (!this.options.leaveOnEmpty) {
      // If the member leaves a voice channel
      if (!oldState.channelId || newState.channelId) return
      // If the channel is not empty
      if (this.client.channels.cache.get(queue.voiceConnection.joinConfig.channelId).members.filter(m => !m.user.bot).size > 1) return
      // Disconnect from the voice channel
      // queue.voiceConnection.disconnect()
      setTimeout(() => {
        if (this.client.channels.cache.get(queue.voiceConnection.joinConfig.channelId).members.filter(m => !m.user.bot).size > 1) return;
        // Destroy the voice connection
        queue.destroy()
        // Delete the queue
        this.queues = this.queues.filter((g) => g.guildID !== queue.guildID)
        // Emit end event
        queue.emit('channelEmpty')
      }, 7500)
    }
  }

  /**
     * Play a stream in a channel
     * @ignore
     * @private
     * @param {Queue} queue The queue to play
     * @param {Boolean} updateFilter Whether this method is called to update some ffmpeg filters
     * @returns {Promise<void>}
     */
  _playYTDLStream(queue, updateFilter, seek, options = {}) {
    return new Promise((resolve, reject) => {
      const encoderArgsFilters = []
      let filters_ = Object.keys(queue.filters);
      if (filters_.some(f => queue.filters[f])) {
        filters_.forEach((filterName) => {
          if (queue.filters[filterName]) encoderArgsFilters.push(filters[filterName])
        })
      }
      if (queue.speed != 1.0) {
        encoderArgsFilters.push('atempo=' + parseFloat(queue.speed).toFixed(1))
      }

      if (queue.pitch != 1.0) {
        encoderArgsFilters.push('asetrate=44100*' + parseFloat(queue.pitch).toFixed(2) + ',aresample=44100')
      }

      queue.process(updateFilter, seek, encoderArgsFilters, this).then(resolve)
      const stateChange = (oldState, newState) => {
        if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle && !queue.queueLock) {
          queue.destroy() // Destroy the queue
          queue.removeListener('stateChange', stateChange)
          return this._playTrack(queue.guildID, false)
        }
        return;
      }
      queue.audioPlayer.on('stateChange', stateChange)
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
    var queue = this.queues.find(q => q.guildID === guildID)
    if (!queue) return
    if (queue.playing) {
      queue.playing.stream?.destroy();
      queue.playing.stream?.read();
      queue.resource = null
    }
    queue.voter = []
    // If there isn't any music in the queue
    if (queue.tracks.length < 1 && !firstPlay && !queue.repeatMode) {
      if (queue.queueLoopMode) {
        queue.playing = queue.tracksCache[0]
        queue.playing.queue = queue
        queue.tracksCache.slice(1)
        queue.tracks = queue.tracksCache
        if (queue.voiceConnection.dispatcher) queue.voiceConnection.dispatcher.destroy()
        this._playYTDLStream(queue, false).then(() => {
          // Emit trackChanged event
          queue.emit('trackChanged', queue.playing, queue.tracks[0], false, true)
          this.emit('trackChanged', queue, queue.playing, queue.tracks[0], false, true)

          var channel = this.client.channels.cache.get(queue.voiceConnection.joinConfig.channelId)
          if (channel?.stageInstance) channel.stageInstance.setTopic(`🎵 ${queue.playing.name}`);
          channel = null
        })
        return;
      }

      if (queue.autoplay) {
        const wasPlaying = queue.playing
        queue.previousTrack.push(queue.playing)
        const nowPlaying = queue.playing = [await this.searchTracks("youtube-related:" + wasPlaying, false, false)][0];
        queue.playing.requestedBy = wasPlaying.requestedBy
        nowPlaying.queue = queue.playing.queue = queue
        this._playYTDLStream(queue, false).then(() => {
          // Emit trackChanged event
          if (!firstPlay) {
            queue.emit('trackChanged', wasPlaying, nowPlaying, false, true)
            this.emit('trackChanged', queue, wasPlaying, nowPlaying, false, true)
            var channel = this.client.channels.cache.get(queue.voiceConnection.joinConfig.channelId)
            if (channel?.stageInstance) channel.stageInstance.setTopic(`🎵 ${nowPlaying.name}`);
            channel = null
          }
        })
        return;
      }
      // Leave the voice channel
      if (this.options.leaveOnEnd && !queue.stopped) queue.voiceConnection.disconnect()
      // Save the queue to the cache
      // this.oldQueue.set(guildID, queue)
      // Remove the guild from the guilds list
      this.queues = this.queues.filter((g) => g.guildID !== guildID)

      var channel = this.client.channels.cache.get(queue.voiceConnection.joinConfig.channelId)
      if (channel?.stageInstance) channel.stageInstance.setTopic(`💤 待機中...`)
      channel = null
      // Emit stop event
      if (queue.stopped) {
        if (this.options.leaveOnStop) queue.voiceConnection.destroy()
        this.emit('stop', queue)
        return queue.emit('stop')
      }
      // Emit end event
      queue.playing.queue = queue
      this.emit('end', queue, queue.playing)
      queue.emit('end', queue.playing)
      queue.removeAllListeners()
      queue.audioPlayer.removeAllListeners()
      queue.audioPlayer.stop()
      queue.voiceConnection.destroy()
      queue = null
      return;
    }
    const wasPlaying = queue.playing
    if (!firstPlay) queue.previousTrack.push(queue.playing)
    const nowPlaying = queue.playing = (queue.repeatMode ? wasPlaying : queue.tracks.shift())
    nowPlaying.queue = queue.playing.queue = queue
    // Reset lastSkipped state
    queue.lastSkipped = false
    this._playYTDLStream(queue, false).then(() => {
      // Emit trackChanged event
      if (!firstPlay) {
        queue.emit('trackChanged', wasPlaying, nowPlaying, queue.lastSkipped, queue.repeatMode)
        this.emit('trackChanged', queue, wasPlaying, nowPlaying, queue.lastSkipped, queue.repeatMode)
      } else {
        queue.emit('start')
        this.emit('start', queue, nowPlaying, queue.lastSkipped, queue.repeatMode)
      }
      var channel = this.client.channels.cache.get(queue.voiceConnection.joinConfig.channelId)
      if (channel?.stageInstance) channel.stageInstance.setTopic(`🎵 ${nowPlaying.name}`);
      channel = null
    })
  }

  getFilters() {
    return filters;
  }
};

module.exports = Player
