const BaseExtractor = require('../libs/v5-core/src/extractor/BaseExtractor');

const LocalTools = require('../libs/v5-core/src/LocalTools');

const youtubeDl = require('youtube-dl-exec');
const Track = require('../libs/v5-core/src/Track');

module.exports = {
  name: "Core Extended",
  id: "core-extended",
  description: "不知道哪個地方出錯嗎? 那麼試試 Debug Kristen!\nDebug Kristen 可以精確的幫助您找出程序中的錯誤!",
  enable: true,
  author: "NCT skyouo",
  version: "1.0.0",
  api: ['2.2.0'],
  support: ['6.0.0', '6.0.1'],
  requires: ['discord.js', '@discord-player/extractor', 'reverbnation-scraper'],
  Plugin: class {
    constructor(bot, api) {
      this.logger = api.getLoggerInstance('插件-v6除錯')
      this.status = "load"
      this.bot = bot
      this.api = api
      this.configs = {}
    }
    onLoad() {
      if (!this.api.hasPermission('allowPlayerAccess')) {
        this.logger.error("您需要先開啟 'allowPlayerAccess' 才能使用該插件!")
        return
      }

      var extractor;
      var reverbnation;
      try {
        extractor = require("@discord-player/extractor")
      } catch (e) {
        this.logger.error("您必須要安裝 @discord-player/extractor!")
        this.status = "failed"
        return;
      }

      try {
        reverbnation = require("reverbnation-scraper")
      } catch (e) {
        this.logger.error("您必須要安裝 reverbnation-scraper!")
        this.status = "failed"
        return;
      }

      class Reverbnation extends BaseExtractor {
        constructor() {
          super({ id: "reverbnation" })
        }

        search(query, options) {
          return new Promise(async (resolve, reject) => {
            reverbnation.getInfo(query).then(async (data) => {
              resolve(new Track({
                title: data.title,
                duration: LocalTools.ms2mmss(data.duration),
                bestThumbnail: { url: data.thumbnail },
                url: data.streamURL,
                views: 0,
                author: data.artist?.name,
                url: data.url,
                fromYoutube: false
              }, null, null))
            })
          })
        }

        extract(track, options) {
          return youtubeDl.raw(track.url, {
            o: '-',
            q: '',
            r: '1M',
            audioQuality: "192K"
          }, {
            stdio: ['ignore', 'pipe', 'ignore']
          })
        }

        validate(query) {
          return [extractor.Reverbnation.validate(query)]
        }
      }

      class Vimeo extends BaseExtractor {
        constructor() {
          super({ id: "viemo-video" })
        }

        search(query, options) {
          return new Promise(async (resolve, reject) => {
            extractor.Vimeo.getInfo(query).then(async (data) => {
              resolve(new Track({
                title: data.info[0].title,
                duration: LocalTools.ms2mmss(data.info[0].duration),
                bestThumbnail: { url: data.info[0].thumbnail },
                url: data.info[0].streamURL || query,
                views: 0,
                author: data.info[0].author,
                url: query,
                fromYoutube: false
              }, null, null))
            })
          })
        }

        extract(track, options) {
          return youtubeDl.raw(track.url, {
            o: '-',
            f: 'bestaudio[ext=m4a]',
            q: '',
            r: '1M',
            audioQuality: "192K"
          }, {
            stdio: ['ignore', 'pipe', 'ignore']
          })
        }

        validate(query) {
          return [extractor.Vimeo.validate(query)]
        }
      }

      class Facebook extends BaseExtractor {
        constructor() {
          super({ id: "facebook-video" })
        }

        search(query, options) {
          return new Promise(async (resolve, reject) => {
            extractor.Facebook.getInfo(query).then(async (data) => {
              resolve(new Track({
                title: data.info[0].title,
                duration: LocalTools.ms2mmss(data.info[0].duration),
                bestThumbnail: { url: data.info[0].thumbnail },
                url: data.info[0].engine,
                views: 0,
                author: data.info[0].author,
                url: data.info[0].url,
                fromYoutube: false
              }, null, null))
            })
          })
        }

        extract(track, options) {
          return youtubeDl.raw(track.url, {
            o: '-',
            f: 'bestaudio[ext=m4a]',
            q: '',
            r: '1M',
            audioQuality: "192K"
          }, {
            stdio: ['ignore', 'pipe', 'ignore']
          })
        }

        validate(query) {
          return [extractor.Facebook.validate(query)]
        }
      }

      class Attachment extends BaseExtractor {
        constructor() {
          super({ id: "attachment" })
        }

        search(query, options) {
          return new Promise(async (resolve, reject) => {
            extractor.Attachment.getInfo(query).then(async (data) => {
              resolve(new Track({
                title: data.info[0].title,
                duration: LocalTools.ms2mmss(data.info[0].duration),
                bestThumbnail: { url: data.info[0].thumbnail },
                url: data.info[0].engine,
                views: 0,
                author: data.info[0].author,
                url: data.info[0].url,
                fromYoutube: false
              }, null, null))
            })
          })
        }

        extract(track, options) {
          return youtubeDl.raw(track.url, {
            o: '-',
            q: '',
            r: '1M',
            audioQuality: "192K"
          }, {
            stdio: ['ignore', 'pipe', 'ignore']
          })
        }

        validate(query) {
          return [extractor.Attachment.validate(query)]
        }
      }

      if (this.api.version !== "2.2.1") {
        this.api.registerExtractor(new Reverbnation)
        this.api.registerExtractor(new Vimeo)
        this.api.registerExtractor(new Facebook)
        this.api.registerExtractor(new Attachment)
      } else {
        this.api.registerExtractor(Reverbnation)
        this.api.registerExtractor(Vimeo)
        this.api.registerExtractor(Facebook)
        this.api.registerExtractor(Attachment)
      }

      this.logger.info("插件已載入!")

      this.status = "active"
    }

    onEnable() {
      if (this.status === "active") this.logger.info("啟動成功!")
    }

    onDisable() { }
  }
}