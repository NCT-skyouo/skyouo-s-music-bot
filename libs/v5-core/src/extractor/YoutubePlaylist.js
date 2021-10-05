const BaseExtractor = require("./BaseExtractor")

const LocalTools = require("../LocalTools");
const Track = require("../Track");
const Util = require("../Util");

const YouTube = require('simple-youtube-api');
const ytpl = require('ytpl');

module.exports = class YoutubeVideoKeywordExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'youtube-playlist' })
        this.playlist = true;
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {
            const playlistID = await ytpl.getPlaylistID(query).catch(() => { })
            if (options.useAPI) {
                let youtube = options.apiKEYs?.length ? new YouTube(options.apiKEYs[Math.floor(Math.random() * options.apiKEYs.length)]) : null
                const playlist = await youtube.getPlaylistByID(playlistID).then(playlist => playlist.fetch()).catch(() => { })
                if (playlist) {
                    const videos = await playlist.getVideos()
                    return await Promise.all(videos.map(async (v) => {
                        try {
                            const a = await v.fetch()
                            v.duration = Util.buildTimecode(a.duration)
                            return v
                        } catch (e) {
                            if (v.duration) {
                                return v
                            } else {
                                return null
                            }
                        }
                    })).then((result) => {
                        resolve(result.filter(v => !!v).map((i) => new Track({
                            title: i.title,
                            duration: i.duration,
                            bestThumbnail: i.maxRes,
                            author: { name: i.channel.title },
                            url: i.url,
                            fromPlaylist: true,
                            fromYoutube: true
                        }, null, null)))
                    })
                } else {
                    resolve([])
                }
            } else {
                const playlist = await ytpl(`https://www.youtube.com/playlist?list=${playlistID}`, { gl: 'TW', hl: 'zh', limit: Infinity })
                return resolve(playlist.items.map(v => new Track({
                    title: v.title,
                    duration: LocalTools.ms2mmss(LocalTools.s2ms(v.durationSec)),
                    bestThumbnail: { url: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg` },
                    author: v.author,
                    url: `https://www.youtube.com/watch?v=${v.id}`,
                    fromPlaylist: true,
                    fromYoutube: true
                }, null, null)))
            }
        });
    }

    extract(track, options) {
        throw new Error("Method not implemented.");
    }

    validate(query) {
        return [ytpl.validateID(query)]
    }
}