const BaseExtractor = require('./BaseExtractor');
const Track = require("../Track");

const youtubeDl = require('youtube-dl-exec');

const YABAW = new (require("../../../yabaw/index"))()


module.exports = class BilibiliVideoExtractor extends BaseExtractor {
  constructor(options) {
    super({ id: "bilibili-video" });
  }

  search(query, options) {
    return new Promise(async (resolve, reject) => {
      const data = await YABAW.search(query);

      let res = data.map(d => new Track({
        title: d.title.replace(/<[^>]*>?/gm, ''),
        description: d.description,
        duration: d.duration.padStart(2, "0"),
        bestThumbnail: { url: "https:" + d.pic },
        author: { name: data.author },
        url: "https://www.bilibili.com/video/" + d.bvid,
        views: d.play,
        fromPlaylist: false,
        fromYoutube: false
      }, null, null))

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
    return [query.startsWith('https://www.bilibili.com/video/') || query.startsWith('http://www.bilibili.com/video/')]
  }
}