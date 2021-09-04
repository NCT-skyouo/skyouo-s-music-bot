const Track = require("../Track");
const BaseExtractor = require("./BaseExtractor");
const { ms2mmss, s2ms } = require("../LocalTools")

const youtubeDl = require("youtube-dl-exec");

const LBRY = new (require("../../../lbry-api/lbry"))()


module.exports = class LbryExtractor extends BaseExtractor {

    constructor(options) {
        super({ id: "lbry-video" });
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            let info = await LBRY.search(query)
            return resolve(info.map(d => {
                return new Track({
                    title: d.title,
                    description: d.description,
                    duration: ms2mmss(s2ms(d.video.duration)),
                    bestThumbnail: { url: d.thumbnail },
                    author: d.channel,
                    url: d.url,
                    fromPlaylist: false,
                    fromYoutube: false
                }, null, null)
            }));
        });
    }

    extract(track, options) {
        return youtubeDl.raw(track.url, {
            o: '-',
            q: '',
            r: '300K'
          }, {
            stdio: ['ignore', 'pipe', 'ignore']
        })
    }

    validate(query) {
        return [/https?:\/\/(?:www\.)?(?:lbry\.tv|odysee\.com)\/@.+:.+\/.+:.+/.test(query)]
    }
}