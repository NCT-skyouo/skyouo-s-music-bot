const BaseExtractor = require("./BaseExtractor")
const Track = require("../Track");
const Util = require("../Util");

const YouTube = require('simple-youtube-api');
const ytsr = require('youtube-sr').default
const ytpl = require('ytpl')

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
                const playlist = await youtube.getPlaylistByID(playlistID).catch(() => { })
                if (playlist) {
                    const videos = await playlist.getVideos()
                    return await Promise.all(videos.map(async (v) => {
                        const a = await v.fetch()
                        v.duration = Util.buildTimecode(a.duration)
                        return v
                    })).then((result) => {
                        resolve(result.map((i) => new Track({
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
                const playlist = await ytsr.getPlaylist(`https://www.youtube.com/playlist?list=${playlistID}`)
                return resolve(playlist.videos.map(v => new Track({
                    title: v.title,
                    duration: v.durationFormatted,
                    bestThumbnail: { url: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg` },
                    author: v.channel,
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