module.exports = {
  name: "Online Forever | 永遠在線",
  enable: false,
  author: "NCT skyouo",
  version: "1.0.0",
  api: ['1.0.0'],
  support: ['5.7.0'],
  requires: ['discord.js', 'node-fetch'],
  Plugin: class {
    constructor(bot, api) {
      this.logger = api.getLoggerInstance('插件-永遠在線')
      this.status = "load"
      this.bot = bot
      this.api = api
      this.configs = {
        time: 20 // 秒
      }
    }
    onLoad() {
      var fetch = require("node-fetch")
      if (!bot.config.web.enable) {
        this.logger.info("已偵測到您關閉了 dashboard, 所以不會啟動該插件!!")
        return
      }
      if (process.env.REPL_SLUG) {
        const { REPL_OWNER, REPL_SLUG } = process.env
        this.logger.info("已偵測到您正在使用 repl.it!")
        setInterval(() => {
          fetch("https://" + REPL_SLUG.replace(/[^\x00-\x7F]/g, "").replace(/ +/g, "").toLowerCase() + "." + REPL_OWNER.toLowerCase() + ".repl.co")
          this.logger.debug('ping')
        }, this.configs.time * 1000)
        this.status = "active"
      } else if (process.env.PROJECT_DOMAIN) {
        this.logger.info("已偵測到您正在使用 glitch.com!")
        setInterval(() => {
          fetch("https://" + process.env.PROJECT_DOMAIN + ".glitch.me")
          this.logger.debug('ping')
        }, this.configs.time * 1000)
        this.status = "active"
      } else {
        this.logger.info("不支援的平台!")
      }
    }

    onEnable() {
      if (this.status === "active") this.logger.info("啟動成功!")
    }

    onDisable() { }
  }
}