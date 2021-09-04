const BaseExtractor = require("./BaseExtractor")
const Track = require("../Track");
const { ms2mmss } = require("../LocalTools")

const NeteaseMusic = require('simple-netease-cloud-music');
const match = require('@nondanee/unblockneteasemusic');

const nm = new NeteaseMusic();

module.exports = class NeteaseSongKeywordExtractor extends BaseExtractor {
    constructor(options) {
        super({ id: 'netease-keyword' })
    }

    search(query, options) {
        return new Promise(async (resolve, reject) => {

            const data = await nm.search(query)
            if (!data.result) reject(new Error('No result'))
            const apiUrl = await nm.url(data.result.songs[0].id)
            if (!apiUrl.data[0].url) {
                apiUrl.data[0].url = (await match(apiUrl.data[0].id, ['kuwo'])).url
            }

            const songData = await nm.song(String(apiUrl.data[0].id))
            let song = songData
            var time = ms2mmss(Number(song.songs[0].dt / 1000).toFixed() * 1000)

            resolve([new Track({
                title: song.songs[0].name,
                duration: time,
                bestThumbnail: { url: song.songs[0].al.picUrl },
                author: { name: song.songs[0].ar[0]?.name },
                url: apiUrl.data[0].url ?? "https://music.163.com/#/song?id=" + song.songs[0].id,
                fromYoutube: false,
                fromPlaylist: false
            }, null, null)])
        });
    }

    extract(track, options) {
        throw new Error('Not implemented');
    }

    validate(query) {
        return [query.startsWith("netease:"), query.slice("netease".length)]
    }
}