module.exports = class PluginBase {
  constructor(bot, api) {
    this.bot = bot
    this.api = api
  }

  onLoad() {}

  onEnable() {}

  onDisable() {}
}