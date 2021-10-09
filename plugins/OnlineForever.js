const { fetch } = require('undici')

module.exports = {
  name: "Online Forever",
  id: "online-forever",
  description: "在 Glitch 或者 Repl.it 託管嘛? 使用 Online Forever, 讓您的機器人 24 小時運行!",
  enable: true,
  author: "NCT skyouo",
  version: "1.1.0",
  api: ['2.0.0'],
  support: ['*'],
  requires: ['undici'],
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
      if (!this.bot.config) {
				this.logger.warn("您必須要開啟設置 'allowImportantConfigsAccess' 才能使用該插件!");
				this.status = 'fail';
				return;
			}

      if (!this.bot.config.web.enable) {
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
          fetch("https://" + process.env.PROJECT_DOMAIN + ".glitch.me", {
            method: "HEAD",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
            }
          })
          this.logger.debug('ping')
        }, this.configs.time * 1000)
        this.status = "active"
      } else {
        this.logger.info("不支援的平台!")
        this.status = "fail"
      }
    }

    onEnable() {
      if (this.status === "active") this.logger.info("啟動成功!")
    }

    onDisable() { }
  }
}