const BaseExtractor = require("./BaseExtractor")
const Track = require("../Track");
const Util = require("../Util");

const YouTube = require('simple-youtube-api');

const Youtube = require('youtube-sr').default; // Okay youtube-sr, do not make me do this again.

module.exports = class YoutubeVideoKeywordExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'youtube-video-keywords' })
        this.generic = true
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {

            if (options.useAPI) {
                let youtube = options.apiKEYs?.length ? new YouTube(options.apiKEYs[Math.floor(Math.random() * options.apiKEYs.length)]) : null

                youtube.searchVideos(query, 15, { part: 'snippet' }).then(res => {
                    if (res.length < 1) return resolve([])
                    const resultsVideo = res.map(r => {
                        r.title = r.title
                        r.bestThumbnail = r.maxRes
                        r.author = { name: r.channel.title }
                        r.fromYoutube = true
                        return r
                    })

                    return Promise.all(resultsVideo.map(async (v) => {
                        const a = await v.fetch()
                        v.duration = Util.buildTimecode(a.duration)
                        return v
                    }))
                        .then((result) => {
                            return resolve(result.map((r) => new Track(r, null, null)))
                        })
                        .catch((e) => {
                            return resolve([])
                        })
                })
            } else {
                Youtube.search(query, { type: "video" }).then(info => {
                    return resolve(info.map(i => {
                        return new Track({
                            title: i.title,
                            description: i.description,
                            duration: i.durationFormatted,
                            bestThumbnail: i.thumbnail,
                            author: i.channel,
                            url: `https://www.youtube.com/watch?v=${i.id}`,
                            fromPlaylist: false,
                            fromYoutube: true
                        })
                    }))
                }).catch(reject)
                /*yts(query).then(r => {
                    resolve(r.videos.map(i => {
                        return new Track({
                            title: i.title,
                            description: i.description,
                            duration: i.duration.timestamp,
                            bestThumbnail: { url: `https://i.ytimg.com/vi/${i.videoId}/maxresdefault.jpg` },
                            author: i.author,
                            url: `https://www.youtube.com/watch?v=${i.videoId}`,
                            fromPlaylist: false,
                            fromYoutube: true
                        })
                    }))
                }).catch(reject)*/
            }
        });
    }

    extract(track, options) {
        throw new Error("Method not implemented.");
    }

    validate(query) {
        return [true]
    }
}