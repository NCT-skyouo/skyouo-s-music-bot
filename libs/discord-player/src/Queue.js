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
const { EventEmitter } = require('events')
const Track = require('./Track')

/**
 * Represents a guild queue.
 */
class Queue extends EventEmitter {
    /**
     * @param {Discord.Snowflake} guildID ID of the guild this queue is for.
     */
    constructor (guildID) {
        super()
        /**
         * ID of the guild this queue is for.
         * @type {Discord.Snowflake}
         */
        this.guildID = guildID
        /**
         * The voice connection of this queue.
         * @type {Discord.VoiceConnection}
         */
        this.voiceConnection = null
        /**
         * The song currently played.
         * @type {Track}
         */
        this.playing = null
        /**
         * The tracks of this queue. The first one is currenlty playing and the others are going to be played.
         * @type {Track[]}
         */
        this.tracks = []
        /**
         * Whether the stream is currently stopped.
         * @type {boolean}
         */
        this.stopped = false
        /**
         * Whether the last track was skipped.
         * @type {boolean}
         */
        this.lastSkipped = false
        /**
         * The stream volume of this queue. (0-100)
         * @type {number}
         */
        this.volume = 100
        /**
         * Whether the stream is currently paused.
         * @type {boolean}
         */
        this.paused = true
        /**
         * Whether the repeat mode is enabled.
         * @type {boolean}
         */
        this.repeatMode = false
        /**
         * Filters status
         * @type {Filters}
         */
        this.filters = {}
        /**
         * Additional stream time
         * @type {Number}
         */
        this.additionalStreamTime = 0
    }

    get calculatedVolume () {
        return this.filters.bassboost ? this.volume + 50 : this.volume
    }
}

module.exports = Queue

/**
 * Emitted when the queue is empty.
 * @event Queue#end
 *
 * @example
 * client.on('message', (message) => {
 *
 *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
 *      const command = args.shift().toLowerCase();
 *
 *      if(command === 'play'){
 *
 *          let track = await client.player.play(message.member.voice.channel, args[0]);
 *
 *          track.queue.on('end', () => {
 *              message.channel.send('The queue is empty, please add new tracks!');
 *          });
 *
 *      }
 *
 * });
 */

/**
 * Emitted when the voice channel is empty.
 * @event Queue#channelEmpty
 */

/**
 * Emitted when the track changes.
 * @event Queue#trackChanged
 * @param {Track} oldTrack The old track (playing before)
 * @param {Track} newTrack The new track (currently playing)
 * @param {Boolean} skipped Whether the change is due to the skip() function
 *
 * @example
 * client.on('message', (message) => {
 *
 *      const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
 *      const command = args.shift().toLowerCase();
 *
 *      if(command === 'play'){
 *
 *          let track = await client.player.play(message.member.voice.channel, args[0]);
 *
 *          track.queue.on('trackChanged', (oldTrack, newTrack, skipped, repeatMode) => {
 *              if(repeatMode){
 *                  message.channel.send(`Playing ${newTrack} again...`);
 *              } else {
 *                  message.channel.send(`Now playing ${newTrack}...`);
 *              }
 *          });
 *
 *      }
 *
 * });
 */
