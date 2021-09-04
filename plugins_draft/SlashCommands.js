const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {
  name: "Slash Commands",
  id: "slash-commands",
  description: "在不久後 Discord 即將讓獲取訊息成為 Privileged Intents 要怎麼辦? 使用 SlashCommands 插件就可以輕鬆的遷移到斜線指令上!",
  enable: false,
  author: "NCT skyouo",
  version: "1.1.0",
  api: ['2.0.0'],
  support: ['6.0.0 Preview'],
  requires: ['discord.js', '@discordjs/rest', '@discordjs/builders', 'discord-api-types'],
  Plugin: class {
    constructor(bot, api) {
      this.logger = api.getLoggerInstance('插件-斜線指令')
      this.status = "load"
      this.bot = bot
      this.api = api
      this.configs = {}
    }
    async onLoad() {
      var self = this
      if (!self.bot.token || !self.bot.user || !self.bot.commands) {
        this.logger.warn("您必須要開啟設置 'allowImportantConfigsAccess', 'allowClientUserAccess', 'allowCommandAccess' 才能使用該插件!");
        this.status = 'fail';
        return;
      }
        const rest = new REST({ version: '9' }).setToken(self.bot.token);
        const slashes = []
        for (const command of this.bot.commands.values()) {
          var rCmd = command['zh-tw']
          if (!rCmd.slash) {
            slashes.push((new SlashCommandBuilder().setName(rCmd.name).setDescription(rCmd.description)).toJSON())
          } else {
            slashes.push(rCmd.slash.toJSON())
          }
        }

        await rest.put(
          Routes.applicationCommands(self.bot.user.id),
          { body: slashes }
        )

        self.logger.info("載入成功!")
        self.status = "active"    
      }

    onEnable() {
      if (this.status === "active") this.logger.info("啟動成功!")
    }

    onDisable() { }
  }
}