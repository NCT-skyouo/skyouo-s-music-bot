const BaseExtractor = require("./BaseExtractor")
const Track = require("../Track");

const ytsr = require('youtube-sr').default

module.exports = class YoutubeVideoKeywordExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'youtube-releated' })
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            resolve (await ytsr.getVideo(query)).videos?.map(i => new Track({
                title: i.title,
                duration: i.durationFormatted,
                bestThumbnail: { url: `https://i.ytimg.com/vi/${i.id}/maxresdefault.jpg` },
                author: i.channel,
                url: `https://www.youtube.com/watch?v=${i.id}`,
                fromPlaylist: false,
                fromYoutube: true
              }, null, null))
        });
    }

    extract(track, options) {
        throw new Error("Method not implemented.");
    }

    validate(query) {
        return [query.startsWith("youtube-related:"), query.slice("youtube-related:".length)]
    }
}