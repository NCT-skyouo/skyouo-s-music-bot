module.exports = class API {
  constructor(bot, player) {
    this.bot = bot
    this.player = player
    this.version = '1.0.0'
  }

  getBot() {
    return this.bot
  }

  getPlayer() {
    return this.player
  }

  getLoggerInstance(name) {
    return new (require('../logger'))(name, this.bot.config.debug ? 1 : 0, this.bot.config.ignore)
  }
}