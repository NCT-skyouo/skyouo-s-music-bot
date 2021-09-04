module.exports = {
  name: "PluginBase",
  enable: true,
  author: "Your Name",
  version: "1.0.0",
  api: ['1.0.0', '1.1.0', '1.2.0-dev', '1.2.0', '2.0.0', '2.1.0'],
  support: ['5.7.0', '5.8.0', '6.0.0', '6.0.0 Preview'],
  requires: ['discord.js'],
  Plugin: class PluginBase {
    constructor(bot, api) {
      this.bot = bot
      this.api = api
    }

    onLoad() {}

    onEnable() {}

    onDisable() {}
  }
}