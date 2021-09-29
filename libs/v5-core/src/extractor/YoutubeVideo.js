const BaseExtractor = require("./BaseExtractor");
const Track = require("../Track");

const { ms2mmss, s2ms } = require("../LocalTools");

const youtubeDl = require("youtube-dl-exec");

const ytdl = require("ytdl-core");

function getFirefoxUserAgent() {
    let date = new Date()
    let version = ((date.getFullYear() - 2018) * 4 + Math.floor(date.getMonth() / 4) + 58) + ".0"
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version} Gecko/20100101 Firefox/${version}`
}

const reqOpt = {
    'Accept-Language': "zh-TW, zh;q=0.9, zh-MO;q=0.8, zh-CN;q=0.7",
    'User-Agent': getFirefoxUserAgent()
}

module.exports = class YoutubeVideoKeywordExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'youtube-video' })
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {

            const info = await ytdl.getInfo(query, reqOpt)
            const details = info.videoDetails;
            resolve(new Track({
                title: details.title,
                duration: ms2mmss(s2ms(Number(details.lengthSeconds))),
                bestThumbnail: details.thumbnails[details.thumbnails.length - 1],
                author: details.author,
                url: details.video_url,
                fromPlaylist: false,
                fromYoutube: true
            }))

        });
    }

    extract(track, options) {
        if (track.durationMS !== 0) { // check for stream, if not stream, use youtube-dl to play it.
            return youtubeDl.raw(track.url, {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '512K'
            }, {
                stdio: ['ignore', 'pipe', 'ignore']
            })
        } else {
            return ytdl(track.url, {
                dlChunkSize: 0,
                highWaterMark: 1 << 25,
                isHLS: true,
                requestOptions: {
                    headers: reqOpt
                }
            })
        }
    }

    validate(query) {
        return [/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/.test(query) && !query.includes("youtube-related:")]
    }
}