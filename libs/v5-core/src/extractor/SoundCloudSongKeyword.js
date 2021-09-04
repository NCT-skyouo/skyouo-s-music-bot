const BaseExtractor = require('./BaseExtractor');
const Track = require("../Track");
const { ms2mmss } = require("../LocalTools")

const soundcloud = require('soundcloud-scraper')

module.exports = class SoundCloudSongKeywordExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'soundcloud-song' })
        this.client = new soundcloud.Client();
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            var info = await this.client.search(query, "track")
            let self = this
            return resolve(await Promise.all(info.map(async i => {
                var info = await this.client.getSongInfo(i.url)
                return resolve(new Track({
                    title: info.title,
                    duration: ms2mmss(info.duration),
                    bestThumbnail: { url: info.thumbnail },
                    author: info.author,
                    url: info.url,
                    fromPlaylist: false,
                    fromYoutube: false
                }, null, null))
            })))
        })
    }

    extract(track, options) {
        throw new Error('Not implemented');
    }

    validate(query) {
        return [query.startsWith("soundcloud:"), query.slice("soundcloud:".length)]
    }
}