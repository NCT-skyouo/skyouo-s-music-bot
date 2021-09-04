const BaseExtractor = require('./BaseExtractor');
const Track = require("../Track");
const { ms2mmss, s2ms } = require("../LocalTools")

const youtubeDl = require('youtube-dl-exec');

module.exports = class TiktokVideoExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'tiktok-video' })
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            let info = await youtubeDl(query, {
                dumpSingleJson: '',
            });

            resolve(new Track({
                title: info.title,
                description: info.title,
                duration: ms2mmss(s2ms(info.duration)),
                bestThumbnail: { url: info.thumbnail },
                author: info.uploader,
                url,
                fromPlaylist: false,
                fromYoutube: false
            }, null, null))
        })
    }

    extract(track, options) {
        return youtubeDl.raw(track.url, {
            o: '-',
            q: '',
            r: '1M',
            audioQuality: "192K"
        }, {
            stdio: ['ignore', 'pipe', 'ignore']
        })
    }

    validate(query) {
        return /(http|https)?:\/\/www.tiktok.com\/@.*\/video\/.*/.test(query);
    }
}