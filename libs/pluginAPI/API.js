module.exports = class API {
  constructor(bot) {
    this.bot = bot
    this.version = '2.2.0'
    this.compatible = ['2.0.0', '2.1.0', '2.2.0']
    this.incompatible = []
    this.categories = ['music', 'filter', 'utility', 'list', 'admin']
  }

  getBot() {
    return this.bot?.bot
  }

  getLoggerInstance(name) {
    return new (require('../logger'))(name, 0, [], this.bot.config?.gmt?.offset || 0)
  }

  registerCommand(name, prop = {}, onCommand, language) {
    var temp = {}
    for (var key in prop) {
      temp[key] = prop[key]
    }
    temp.run = onCommand
    temp.name = name
    if (language) {
      let cmd = this.bot.commands.get(name) || {}
      cmd[language] = temp
      this.bot.commands.set(temp.name, cmd)
    } else {
      var cmd = {}
      for (const lang of this.bot.languages) {
        cmd[lang] = temp
      }
      this.bot.commands.set(temp.name, cmd)
    }
  }

  registerEvent(name, onEvent) {
    this.bot.on(name, onEvent.bind(null, this.bot))
  }

  unregisterCommand(name, language) {
    if (language) {
      var cmd = this.bot.commands.get(name) || {}
      delete cmd[language]
      this.bot.commands.set(name, cmd)
    } else {
      this.bot.commands.delete(name)
    }
  }

  unregisterCommandByAliases(value, language) {
    if (language) {
      var res = this.bot.commands.find(cmd => cmd.aliases.includes(value))
      delete res[language]
      this.bot.commands.set(res.name, res)
    } else {
      for (const lang of this.bot.languages) {
        var res = this.bot.commands.filter(cmd => !cmd.aliases.includes(value))
        this.bot.commands = res
      }
    }
  }

  unregisterEvent(name) {
    this.bot.removeListeners([name])
  }

  unregisterEventBySpecify(name, value) {
    this.bot.removeListener(name, value)
  }

  registerFileAsDB(plugin, name) {
    var fs = require('fs')

    if (!fs.existsSync(require('path').resolve(__dirname, '../../plugins/' + plugin))) {
      fs.mkdirSync(require('path').resolve(__dirname, '../../plugins/' + plugin))
    }

    var Store = require('../better-storing/index')()
    Store.use('JSON')
    var Database = Store.getStoringInstance()
    var middles = Store.getBulitInMiddle()
    var opt = {
      path: require('path').resolve(__dirname, '../../plugins/' + plugin),
      caching: true
    }
    opt.startMiddle = middles.startJSON
    opt.endMiddle = middles.endJSON
    return new Database(name, opt)
  }

  getCategories() {
    return this.categories
  }

  registerCategory(category) {
    if (!this.categories.includes(category)) this.categories.push(category)
  }

  registerExtractor(extractor) {
    this.bot.player.extractor.register(extractor)
  }

  hasPermission(permission) {
    return this.bot.settingsClone[permission]
  }

  hasPermissions(permissions) {
    return permissions.every(p => this.bot.settingsClone[p])
  }
}