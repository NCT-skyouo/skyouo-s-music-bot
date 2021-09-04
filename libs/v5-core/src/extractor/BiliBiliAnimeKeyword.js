const BaseExtractor = require('./BaseExtractor');

const Track = require("../Track");
const YABAW = new (require("../../../yabaw/index"))()


module.exports = class BilibiliAnimeKeywordExtractor extends BaseExtractor {
  constructor(options) {
    super({ id: "bilibili-anime-keyword" });
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
    throw new Error('Not implemented');
  }

  validate(query) {
    return [query.startsWith("bilibili-anime:"), query.slice('bilibili-anime:'.length)]
  }
}