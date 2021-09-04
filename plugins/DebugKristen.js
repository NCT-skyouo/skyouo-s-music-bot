module.exports = {
  name: "Debug Kristen",
  id: "debug-kristen",
  description: "不知道哪個地方出錯嗎? 那麼試試 Debug Kristen!\nDebug Kristen 可以精確的幫助您找出程序中的錯誤!",
  enable: true,
  author: "NCT skyouo",
  version: "1.0.2",
  api: ['*'],
  support: ['*'],
  requires: ['discord.js'],
  Plugin: class {
    constructor(bot, api) {
      this.logger = api.getLoggerInstance('插件-v6除錯')
      this.status = "load"
      this.bot = bot
      this.api = api
      this.configs = {}
    }
    onLoad() {
      // 抓取錯誤
      process.on('uncaughtException', (err, origin) => {
        this.logger.error(
          `發生錯誤: ${err}\n` +
          `錯誤類別: ${origin}\n` +
          `訊息: ${err.stack}`
        )
      })

      process.on('unhandledRejection', error => {
        this.logger.error(
          `發生錯誤: ${error}\n` +
          `訊息: ${error?.stack || error?.message}`
        )
      })
      this.logger.notice("檢查完畢, 將會開啟 error tracer!")
      this.status = "active"
    }

    onEnable() {
      if (this.status === "active") this.logger.info("啟動成功!")
    }

    onDisable() { }
  }
}