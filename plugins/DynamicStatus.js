module.exports = {
  name: "DynmaicStatus",
  id: "dynamic-status",
  description: "想要讓機器人的狀態 \"動\" 起來嘛?\nDynamic Status 提供了多種選擇讓您使用!",
  enable: true,
  author: "NCT skyouo",
  version: "1.1.0",
  api: ['2.0.0'],
  support: ['6.0.0', '6.0.1'],
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
         * %bot_prefix%: 指令前綴
         * %v5_version%: v5 的版本
         * %api_version%: v5 插件 API 的版本 
         * %player_count%: 目前正在使用的伺服器數量
         * %v5_codename% - v5 的版本代號 
         */
        /**
         * detail: 狀態詳情, 可用佔位符
         * status: 狀態 (online, idle, dnd)
         * type: Discord.js 的狀態類別
         * onlyIf: 觸發條件, 可用佔位符
         */
        status: [
          {
            detail: '使用 %bot_prefix%help | Made by NCT skyouo',
            status: 'online',
            type: 'STREAMING',
            url: 'https://www.twitch.tv/skyouo0727'
          },
          {
            detail: '總人數: %bot_users% | 總伺服器: %bot_guilds%',
            status: 'idle',
            onlyIf: '%player_count% === 0'
          },
          {
            detail: '正在使用的伺服器數: %player_count%',
            status: 'dnd',
            onlyIf: '%player_count% > 0'
          },
          {
            detail: '使用 v6 %v5_version% | API %api_version%',
            status: 'idle',
            type: 'COMPETING'
          }
        ],
        time: 15
      }
    }
    onLoad() {
      if (!this.bot.users || !this.bot.config || !this.bot.settingsClone.allowListenEvents || !this.bot.user || !this.bot.player) {
				this.logger.warn("您必須要開啟設置 'allowImportantConfigsAccess', 'allowCacheAccess', 'allowListenEvents', 'allowClientUserAccess', 'allowPlayerAccess' 才能使用該插件!");
				this.status = 'fail';
				return;
			}

      var bot = this.bot, api = this.api, configs = this.configs
      function placehold(originString) {
        return originString
          .replace(/%bot_users%/g, bot.users.cache.size)
          .replace(/%bot_guilds%/g, bot.guilds.cache.size)
          .replace(/%bot_prefix%/g, bot.config.prefix)
          .replace(/%v5_version%/g, v5.version)
          .replace(/%v5_codename%/g, v5.codename)
          .replace(/%api_version%/g, api.version)
          .replace(/%player_count%/g, bot.player.queues.length)
      }
      this.logger.info("正在加載!")
      try {
        var count = 0
        var until = this.configs.status.length - 1
        let updateStatus = () => {
          if (until < 0) return;
          var theStatus = configs.status[count]
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
            activities: [{
              name: placehold(theStatus.detail),
              type: theStatus.type ? theStatus.type : "PLAYING",
              url: theStatus.url
            }]
          })
          if (count !== until) {
            count++
          } else {
            count = 0
          }
        }

        bot.once("ready", updateStatus)
        setInterval(updateStatus, this.configs.time * 1000)
        this.status = "active"
      } catch (e) {
        this.logger.showErr(e)
        this.status = "fail"
      }
    }

    onEnable() {
      if (this.status === "active") this.logger.info("啟動成功!")
    }

    onDisable() { }
  }
}