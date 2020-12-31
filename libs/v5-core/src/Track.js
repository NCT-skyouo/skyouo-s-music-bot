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
const Queue = require('./Queue')

/**
 * Represents a track.
 */
class Track {
  /**
     * @param {Object} videoData The video data for this track
     * @param {Discord.User?} user The user who requested the track
     * @param {Queue?} queue The queue in which is the track is
     */
  constructor (videoData, user, queue) {
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
    this.duration = videoData.duration
    /**
         * The video description
         * @type {string}
         */
    this.description = videoData.description
    /**
         * The video thumbnail
         * @type {string}
         */
    this.thumbnail = videoData.bestThumbnail.url
    /**
         * The video views
         * @type {?number}
         */
    this.views = videoData.views
    /**
         * The video channel
         * @type {string}
         */
    this.author = videoData.author.name
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
     * The track duration
     * @type {number}
     */
  get durationMS () {
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

  get getAllInfo () {
    return {
      name: this.name,
      url: this.url,
      duration: this.duration,
      description: this.description,
      views: this.views,
      thumbnail: this.thumbnail,
      views: this.views,
      requestedBy: this.requestedBy,
      author: this.author,
      fromPlaylist: this.fromPlaylist
    }
  }
}

module.exports = Track
