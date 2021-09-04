const BaseExtractor = require('./BaseExtractor');
const Track = require("../Track");
const { ms2mmss } = require("../LocalTools")

const youtubeDl = require('youtube-dl-exec');

const soundcloud = require('soundcloud-scraper')

module.exports = class SoundCloudSongExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'soundcloud-song' })
        this.client = new soundcloud.Client();
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            var info = await this.client.getSongInfo(url)
            return resolve(new Track({
                title: info.title,
                duration: ms2mmss(info.duration),
                bestThumbnail: { url: info.thumbnail },
                author: info.author,
                url: info.url,
                fromPlaylist: false,
                fromYoutube: false
            }, null, null))
        })
    }

    extract(track, options) {
        return youtubeDl.raw(track.url, {
            o: '-',
            q: '',
            f: 'bestaudio',
            r: '1M',
            audioQuality: "192K"
          }, {
            stdio: ['ignore', 'pipe', 'ignore']
        })
    }

    validate(query) {
        return [soundcloud.validateURL(query) && !query.includes('/sets/')]
    }
}