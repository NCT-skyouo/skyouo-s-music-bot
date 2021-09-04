const BaseExtractor = require('./BaseExtractor');

const Track = require("../Track");
const YABAW = new (require("../../../yabaw/index"))()


module.exports = class BilibiliVideoKeywordExtractor extends BaseExtractor {
  constructor(options) {
    super({ id: "bilibili-video-keyword" });
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
    throw new Error('Not implemented');
  }

  validate(query) {
    return [query.startsWith("bilibili-video:"), query.slice('bilibili-video:'.length)]
  }
}