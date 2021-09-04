const BaseExtractor = require('./BaseExtractor');
const Track = require("../Track");

const youtubeDl = require('youtube-dl-exec');

const YABAW = new (require("../../../yabaw/index"))()


module.exports = class BilibiliAnimeExtractor extends BaseExtractor {
  constructor(options) {
    super({ id: "bilibili-anime" });
    this.playlist = true;
  }

  search(query, options) {
    return new Promise(async (resolve, reject) => {
      const data = await YABAW.search(query);

      let res = data[0].eps.map(d => new Track({
        title: d.title.replace(/<[^>]*>?/gm, ''),
        duration: "0:00",
        bestThumbnail: { url: d.cover },
        author: { name: data[0].staff },
        url: d.url,
        fromPlaylist: true,
        fromYoutube: false
      }, null, null));

      return resolve(res)
    })
  }

  extract(track, options) {
    return youtubeDl.raw(track.url, {
      o: '-',
      q: '',
      r: '1M',
      audioQuality: "0"
    })
  }

  validate(query) {
    return [query.startsWith('https://www.bilibili.com/anime/') || query.startsWith("https://upos-hz-mirrorakam.akamaized.net") || query.startsWith('http://www.bilibili.com/anime/') || query.startsWith("http://upos-hz-mirrorakam.akamaized.net") || query.startsWith("https://www.bilibili.com/bangumi") || query.startsWith("http://www.bilibili.com/bangumi")]
  }
}