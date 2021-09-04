const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "Plugin Manager | 插件管理",
  enable: false,
  author: "NCT skyouo",
  version: "1.0.1",
  api: ['1.2.0'],
  support: ['6.0.0'],
  requires: ['discord.js', 'node-fetch'],
  Plugin: class {
    constructor(bot, api) {
      this.logger = api.getLoggerInstance('插件-插件管理')
      this.status = "load"
      this.bot = bot
      this.api = api
      this.account = api.registerFileAsDB("PluginManager", "Account")
      this.configs = {
        "mirror": "https://packages.kristen.skyouo.tech"
      }
    }
    onLoad() {
      var self = this;
      this.api.registerCategory("sysadmin")

      async function manage(bot, msg, args) {
        if (!args.length) {
          return msg.channel.send(
            new MessageEmbed()
              .setTitle("您的插件")
              .setDescription("```\n" + (bot.plugins.size ? bot.plugins.map(p => p.name).join("\n") : "無") + "\n```")
              .setFooter(bot.config.footer, bot.user.displayAvatarURL())
          )
        } else if (args[0].toLowerCase() === "update") {

        }
      };

      /*this.api.registerCommand(
          'manage',
          {
              category: 'sysadmin',
              description: '快速的管理您的插件!',
              aliases: []
          },
          manage
      );*/
      this.status = "active";
    }

    onEnable() {
      if (this.status === "active") this.logger.info("啟動成功!")
    }


    onDisable() { }

    async getSession(username, password) {
      try {
        let content = await fetch(`${this.configs.mirror}/login`, {
          headers: {
            'Authorization': `Bot ${client.token}`,
            "Content-Type": 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ username, password })
        })
      } catch (error) {
        this.logger.showErr(error)
      }
    }

    async register() {
      try {
        let content = await fetch(`${this.configs.mirror}/register`, {
          headers: {
            'Authorization': `Bot ${client.token}`,
            "Content-Type": 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ username, password })
        })
      } catch (error) {
        this.logger.showErr(error)
      }
    }

    async download() {
      try {
        let content = await fetch(`${this.configs.mirror}/download`, {
          headers: {
            'Authorization': `Bot ${client.token}`,
            "Content-Type": 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ username, password })
        })
      } catch (error) {
        this.logger.showErr(error)
      }
    }

    async getInfo() {

    }

    // GET ${this.pluginServer}/package/${pluginName} using node-fetch, and get response data as JSON,
    // if the response data is not JSON, throw an error.
    // if data.status === 404 return false, otherwise return true.
    /**
     * @param {string} pluginName
     * @returns {Promise<boolean>}
     */
    _checkIfPluginIsOnPackageWebsite(pluginName) {
      var self = this
      return new Promise((resolve, reject) => {
        fetch(`${self.pluginServer}/info/${pluginName}`).
          then(response => response.json().catch(reject))
          .then(data => {
            if (data.status === 404) resolve(false)
            else resolve(true)
          })
          .catch(reject)
      })
    }

    _checkUpdates() {
      var self = this
      return new Promise((resolve, reject) => {
        fetch(`${self.configs.mirror}/infos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: Array.from(self.plobjs.values()).map(plobj => plobj.id)
          })
        })
          .then(res => res.json())
          .then(b => {
            for (var info of b.data) {
              if (info.success) {
                var plobj = self.plobjs.get(info.id)
                if (plobj.version !== info.data.version) {
                  self.pluginLogger.info(`插件 ${plobj.name} 有新版本: ${info.data.version}!`)
                  if (!path.resolve(self.bot.path, 'plugins_update/')) { }
                } else {
                  self.pluginLogger.ok(`插件 ${plobj.name} 目前已更新至最新版!`)
                }
              } else {
                self.pluginLogger.warn(`無法獲取插件 ${plobj.name} 的版本!`)
              }
            }
          })
      })
    }
  }
}