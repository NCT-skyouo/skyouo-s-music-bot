module.exports = {
  name: "DynmaicStatus | 動態狀態",
  enable: true,
  author: "NCT skyouo",
  version: "1.0.0",
  api: ['1.0.0'],
  support: ['5.7.0'],
  requires: ['discord.js'],
  Plugin: class {
    constructor(bot, api) {
      this.logger = api.getLoggerInstance('插件-動態狀態')
      this.status = "load"
      this.bot = bot
      this.api = api
      this.configs = {
        /**
         * 範例:
         * [{ detail: '520', status: 'idle' }, { detail: 'owo', status: 'dnd' }]
        */
        /**
         * 可用的佔位符 (可被替代成對應數值):
         * %bot_users%: 總用戶
         * %bot_guilds%: 總伺服器
         * %v5_version%: v5 的版本
         * %api_version%: v5 插件 API 的版本 
         * %player_count%: 目前正在使用的伺服器數量
         * %v5_codename% - v5 的版本代號 
         */
        /**
         * detail: 狀態詳情, 可用佔位符
         * status: 狀態 (online, idle, dnd)
         * onlyIf: 觸發條件, 可用佔位符
         */
        status: [
          {
            detail: '總人數: %bot_users% | 總伺服器: %bot_guilds%',
            status: 'idle',
            onlyIf: '%player_count% === 0'
          },
          {
            detail: '正在使用的伺服器數: %player_count%',
            status: 'dnd',
            onlyIf: '%player_count% > 0'
          }
        ]
      }
    }
    onLoad() {
      var bot = this.bot, api = this.api
      function placehold(originString) {
        return originString
          .replace(/%bot_users%/g, bot.users.cache.array().length)
          .replace(/%bot_guilds%/g, bot.guilds.cache.array().length)
          .replace(/%v5_version%/g, v5.version)
          .replace(/%v5_codename%/g, v5.codename)
          .replace(/%api_version%/g, api.version)
          .replace(/%player_count%/g, api.player.queues.length)
      }
      this.logger.info("正在加載!")
      try {
        var count = 0
        var until = this.configs.status.length - 1
        setInterval(() => {
          var theStatus = this.configs.status[count]
          if (theStatus.onlyIf) {
            if (!eval(placehold(theStatus.onlyIf))) {
              if (count === until) {
                count = 0
              } else {
                count++
              }
              return
            }
          }
          this.bot.user.setPresence({
            status: theStatus.status,
            activity: {
              name: placehold(theStatus.detail),
              type: theStatus.type ? theStatus.type : "PLAYING"
            }
          })
          if (count !== until) {
            count++
          } else {
            count = 0
          }
        }, 40000)
        this.status = "success"
      } catch (e) {
        this.logger.showErr(e)
        this.status = "fail"
      }
    }

    onEnable() {
      this.logger.info("啟動成功!")
    }

    onDisable() { }
  }
}