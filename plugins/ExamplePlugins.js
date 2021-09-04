 module.exports = {
    name: "ExamplePlugins",
    id: "example-plugins",
    description: "範例插件!",
    enable: false,
    author: "Your name",
    version: "1.0.0",
    api: ['2.0.0'],
    support: ['6.0.0'],
    requires: ['discord.js'],
    Plugin: class {
      constructor(bot, api) {
        this.logger = api.getLoggerInstance('插件-範例插件')
        this.status = "load"
        this.bot = bot
        this.api = api
        this.configs = {
            example: "text" // 可以在 onLoad 中使用 this.configs.example 訪問
        }
      }
      onLoad() {
        /**
         * 權限範例:
         * 允許所有權限 - allowAll
         * 允許註冊指令 - allowCommandAccess
         * 允許訪問 bot.player - allowPlayerAccess
         * 允許訪問 bot - allowBotAccess
         * 允許訪問 bot.user - allowClientUserAccess
         * 允許 bot.on/bot.once - allowListenEvents
         * 允許訪問 bot.config - allowImportantConfigsAccess
         * 允許訪問 bot.users/bot.channels/bot.guilds - allowCacheAccess
         * 允許訪問 bot.cdb/bot.sdb/bot.sb - allowDatabaseAccess
         * 
         * 使用 this.api.hasPermission("allowCommandAccess") 檢查是否擁有 allowCommandAccess 權限,
         * 其他以此類推.
         */
        if (!this.api.hasPermission("allowAll")) {
            this.logger.warn("您必須要開啟設置 'allowAll' 才能使用該插件!");
            this.status = 'fail';
            return;
        }

        this.api.registerCommand( // 注册指令
            "ping", // 指令名稱
            {
                category: 'utility', // 指令類別 (sysadmin, utility, music, filter etc.)
                description: 'Pong!', // 指令說明
                aliases: [] // 指令別名
            },
            async (bot, msg, args) => { // 指令內容
                this.logger.info("指令被執行!")
                return msg.channel.send("Pong!")
            }, 
            "zh-tw" // 指令語言 (zh-tw/en)
        )

        this.api.registerEvent( // 注册事件
            "guildCreated", // 事件名稱
            async (bot, guild) => { // 事件內容
                this.logger.info("事件被執行!")
            }
        )

        this.api.registerCategory(
            "testing" // 注册指令類別
        )

        this.logger.info("插件已載入!")
      }
  
      onEnable() {
        if (this.status === "active") this.logger.info("啟動成功!")
      }
  
      onDisable() { }
    }
  }
