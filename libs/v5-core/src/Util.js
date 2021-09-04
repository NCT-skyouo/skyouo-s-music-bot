const ytsr = require('ytsr')
const ytpl = require('ytpl')
const soundcloud = require('soundcloud-scraper')

const youtubeRegex = (/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
const spotifySongRegex = (/https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/)
const spotifyPlaylistRegex = (/https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/)
const spotifyAlbumRegex = (/https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})/)
const vimeoRegex = (/(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/)
const facebookRegex = (/(https?:\/\/)(www\.|m\.)?(facebook|fb).com\/.*\/videos\/.*/)
const tiktokRegex = (/(http|https)?:\/\/www.tiktok.com\/@.*\/video\/.*/)

module.exports = class Util {
    constructor () {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`)
    }

    static isVoiceEmpty (channel) {
        return channel.members.filter((member) => !member.user.bot).size === 0
    }

    static isSoundcloudLink (query) {
        return soundcloud.validateURL(query) && !query.includes('/sets/')
    }

    static isSoundcloudKeyword(query) {
        return query.startsWith("soundcloud:")
    }

    static isSoundcloudPlaylist (query) {
        return  soundcloud.validateURL(query) && query.includes('/sets/')
    }

    static isSpotifyLink (query) {
        return spotifySongRegex.test(query)
    }

    static isSpotifyPLLink (query) {
        return spotifyPlaylistRegex.test(query)
    }

    static isSpotifyAlbumLink (query) {
        return spotifyAlbumRegex.test(query)
    }

    static isYTPlaylistLink (query) {
        return ytpl.validateID(query)
    }

    static isYTVideoLink (query) {
        return youtubeRegex.test(query)
    }

    static isYTRelatedVideo(query) {
        return query.startsWith("youtube-related:")
    }

    static isVimeoLink (query) {
        return vimeoRegex.test(query)
    }

    static getVimeoID (query) {
        return Util.isVimeoLink(query) ? query.split('/').filter(x => !!x).pop() : null
    }

    static isFacebookLink (query) {
        return facebookRegex.test(query)
    }

    static isReverbnationLink (query) {
        return /https:\/\/(www.)?reverbnation.com\/(.+)\/song\/(.+)/.test(query)
    }

    static isDiscordAttachment (query) {
        return /https:\/\/cdn.discordapp.com\/attachments\/(\d{17,19})\/(\d{17,19})\/(.+)/.test(query)
    }

    static isLBRYVideoLink(query) {
        return /https?:\/\/(?:www\.)?(?:lbry\.tv|odysee\.com)\/@.+:.+\/.+:.+/.test(query);
    }

    static isLBRYVideoKeyword(query) {
        return query.startsWith("lbry:")
    }

    static isNetease(query) {
        return query.startsWith('http://m8.music.126.net/') || query.startsWith('https://m8.music.126.net/') || query.startsWith('https://music.163.com/') || query.startsWith('http://music.163.com/') || query.includes('sycdn.kuwo.cn') || query.includes('music.126.net')
    }

    static isTiktokVideo(query) {
        return tiktokRegex.test(query)
    }

    static isNeteaseKeyword(query) {
        return query.startsWith("netease:")
    }

    static isNeteasePlaylist(query) {
        return query.startsWith('https://music.163.com/#/playlist')
    }

    static isBilibiliVideo(query) {
        return query.startsWith('https://www.bilibili.com/video/') || query.startsWith('http://www.bilibili.com/video/')
    }

    static isBilibiliAnime(query) {
        return query.startsWith('https://www.bilibili.com/anime/') || query.startsWith("https://upos-hz-mirrorakam.akamaized.net") || query.startsWith('http://www.bilibili.com/anime/') || query.startsWith("http://upos-hz-mirrorakam.akamaized.net") || query.startsWith("https://www.bilibili.com/bangumi") || query.startsWith("http://www.bilibili.com/bangumi")
    }

    static isBilibiliVideoKeyword(query) {
        return query.startsWith("bilibili-video:")
    }

    static isBilibiliAnimeKeyword(query) {
        return query.startsWith("bilibili-anime:")
    }

    /*static buildTimecode (data) {
        const items = Object.keys(data)
        const required = ['days', 'hours', 'minutes', 'seconds']

        const parsed = items.filter(x => required.includes(x)).map(m => data[m] > 0 ? data[m] : '')
        const final = parsed.filter(x => !!x).map((x) => x.toString().padStart(2, '0')).join(':')
        return final.length <= 3 ? `0:${final.padStart(2, '0') || 0}` : final
    }*/

    static resolveQueryType(query, forceType) {
        if (forceType && typeof forceType === 'string') return forceType
    
        if (Util.isSpotifyLink(query)) {
          return 'spotify-song'
        } else if (Util.isYTPlaylistLink(query)) {
          return 'youtube-playlist'
        } else if (Util.isYTVideoLink(query)) {
          return 'youtube-video'
        } else if (Util.isYTRelatedVideo(query)) {
          return 'youtube-related'
        } else if (Util.isSoundcloudLink(query)) {
          return 'soundcloud-song'
        } else if (Util.isSoundcloudKeyword(query)) {
          return 'soundcloud-keyword'
        } else if (Util.isSoundcloudPlaylist(query)) {
          return 'soundcloud-playlist'
        } else if (Util.isSpotifyPLLink(query)) {
          return 'spotify-playlist'
        } else if (Util.isLBRYVideoLink(query)) {
          return 'lbry-video'
        } else if (Util.isLBRYVideoKeyword(query)) {
          return 'lbry-keyword'
        } else if (Util.isVimeoLink(query)) {
          return 'vimeo'
        } else if (Util.isNetease(query)) {
          return 'netease-song'
        } else if (Util.isNeteaseKeyword(query)) {
          return 'netease-keyword'
        } else if (Util.isNeteasePlaylist(query)) {
          return 'netease-playlist'
        } else if (Util.isBilibiliVideo(query)) {
          return 'bilibili-video'
        } else if (Util.isBilibiliAnime(query)) {
          return 'bilibili-anime'
        } else if (Util.isBilibiliVideoKeyword(query)) {
          return 'bilibili-video-keyword'
        } else if (Util.isBilibiliAnimeKeyword(query)) {
          return 'bilibili-anime-keyword'
        } else if (Util.isTiktokVideo(query)) {
          return 'tiktok-video'
        } else if (Util.isReverbnationLink(query)) {
          return 'reverbnation'
        } else if (Util.isDiscordAttachment(query)) {
          return 'attachment'
        } else {
          return 'youtube-video-keywords'
        }
      }

    static buildTimecode(data) {
        const items = Object.keys(data);
        const required = ['days', 'hours', 'minutes', 'seconds'];

        const parsed = items.filter((x) => required.includes(x)).map((m) => (data[m] > 0 ? data[m] : m === 'seconds' ? 0 : ''));
        const final = parsed
            .filter((x) => x !== '')
            .map((x) => x.toString().padStart(2, '0'))
            .join(':');
        return final.length <= 3 ? `0:${final.padStart(2, '0') || 0}` : final;
    }
}