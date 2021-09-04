const BaseExtractor = require('./BaseExtractor');
const Track = require("../Track");
const { ms2mmss } = require("../LocalTools")

const soundcloud = require('soundcloud-scraper')

module.exports = class SoundCloudPlaylistExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'soundcloud-playlist' })
        this.client = new soundcloud.Client();
        this.playlist = true;
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            var info = await this.client.getPlaylist(url)
            return info.tracks.map(track => {
                return new Track({
                    title: track.title,
                    duration: ms2mmss(track.duration),
                    bestThumbnail: { url: track.thumbnail },
                    author: track.author,
                    url: track.url,
                    fromPlaylist: true,
                    fromYoutube: false
                }, null, null)
            })
        })
    }

    extract(track, options) {
        throw new Error('Not implemented');
    }

    validate(query) {
        return [soundcloud.validateURL(query) && !query.includes('/sets/')]
    }
}