const API = require('./API');
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch');
const Logger = require('../logger');

class FakeBot {
    #bot;
    #settings;

    constructor(bot, settings) {
        this.#bot = bot
        this.#settings = settings
        this.settingsClone = JSON.parse(JSON.stringify(settings))

        this.MessageEmbed = bot.MessageEmbed

        if (settings.allowBotAccess || settings.allowAll) {
            this.bot = bot;
        }

        if (settings.allowImportantConfigsAccess || settings.allowAll) {
            this.config = bot.config
            this.token = bot.config.token
        }

        if (settings.allowClientUserAccess || settings.allowAll) {
            this.user = bot.user
        }

        if (settings.allowDatabaseAccess || settings.allowAll) {
            this.db = bot.db
            this.sdb = bot.sdb
            this.cdb = bot.cdb
        }

        if (settings.allowCacheAccess || settings.allowAll) {
            this.emojis = bot.emojis
            this.users = bot.users
            this.channels = bot.channels
            this.guilds = bot.guilds
        }

        if (settings.allowPluginAccess || settings.allowAll) {
            this.plugins = bot.plugins
        }

        if (settings.allowCommandAccess || settings.allowAll) {
            this.commands = bot.commands
            this.languages = bot.languages
        }

        if (settings.allowPlayerAccess || settings.allowAll) {
            this.player = bot.player
        }

        if (settings.allowPluginLoaderAccess || settings.allowAll) {
            this.pluginLoader = bot.pluginLoader
        }
    }

    on(event, callback) {
        if (this.#settings.allowListenEvents || this.#settings.allowAll) {
            this.#bot.on(event, callback)
        }
    }

    once(event, callback) {
        if (this.#settings.allowListenEvents || this.#settings.allowAll) {
            this.#bot.once(event, callback)
        }
    }

    emit(event, ...data) {
        if (this.#settings.allowEmitEvents || this.#settings.allowAll) {
            this.#bot.emit(event, ...data)
        }
    }

    removeListener(event, callback) {
        if (this.#settings.allowRevorkEvents || this.#settings.allowAll) {
            this.#bot.removeListener(event, callback)
        }
    }

    removeAllListeners(event) {
        if (this.#settings.allowRevorkEvents || this.#settings.allowAll) {
            this.#bot.removeAllListeners(event)
        }
    }
}

class PluginLoader {
    constructor(instance, settings) {
        if (!(typeof instance !== 'object')) throw new Error('Cannot initialize PluginLoader, you have to override it.');
    }

    loadPlugin(pluginName, pluginConfig) {
        throw new Error('Cannot call this function, you have to override this method.');
    }

    loadPlugins(pluginDir, pluginConfigs) {
        throw new Error('Cannot call this function, you have to override this method.');
    }

    unloadPlugin(pluginName) {
        throw new Error('Cannot call this function, you have to override this method.');
    }

    unloadPlugins() {
        throw new Error('Cannot call this function, you have to override this method.');
    }

    _isCompatible(pluginInstance) {
        throw new Error('Cannot call this function, you have to override this method.');
    }
}

class SimplePluginLoader extends PluginLoader {
    constructor(bot, settings) {
        super(SimplePluginLoader, settings);
        this.plobjs = new Map();
        this.bot = bot;
        this.settings = settings;
        this.pluginServer = 'https://packages.kristen.skyouo.tech';
        this.pluginLogger = new Logger('插件加載', bot.config.debug, bot.config.ignore, bot.config.gmt.offset);
    }

    async loadPlugin(pluginName, pluginConfig) {
        const plobj = require(this.bot.path + '/plugins/' + pluginName)
        if (!plobj.enable) return;
        this.plobjs.set(plobj.id, plobj)
        var bot = new FakeBot(this.bot, pluginConfig)
        var api = new API(bot)
        if (!this._isCompatible(plobj, api)) return this.pluginLogger.warn(`插件 ${pluginName} 不兼容該版本的 v6!\n(目前版本: ${global.v5.version}, API 版本: ${api.version})\n(需求版本: ${plobj.support.join('/')}, API ${plobj.api.join('/')})`);
        var plugin = new plobj.Plugin(bot, api);
        try {
            plugin.onLoad()
            plugin.onEnable()
            this.bot.plugins.set(pluginName, plugin)
            this.pluginLogger.ok("載入插件檔案 '" + pluginName + "@" + plobj.version + "' 成功! (作者: " + plobj.author + ")")
        } catch (e) {
            this.pluginLogger.showErr(e)
        }
    }

    async loadPlugins(pluginDir, pluginConfigs) {
        var self = this
        fs.readdir(path.resolve(this.bot.path, pluginDir), (err, files) => {
            if (err) self.pluginLogger.showErr(err)
            files.filter(f => f.endsWith('.js')).forEach(async file => {
                var pluginName = file.replace('.js', '')
                var pluginConfig = pluginConfigs[pluginName] || pluginConfigs.default
                this.loadPlugin(pluginName, pluginConfig)
            })
        })
    }

    unloadPlugin(pluginName) {
        this.bot.plugins.get(pluginName).onDisable()
        this.bot.plugins.delete(pluginName)
        this.pluginLogger.ok("卸載插件檔案 '" + pluginName + "' 成功!")
    }

    unloadPlugins() {
        this.bot.plugins.keys().forEach(this.unloadPlugin);
    }

    _isCompatible(pluginInstance, api) {
        if (!(pluginInstance.api.includes(api) || pluginInstance.api.includes('*')) && !pluginInstance.api.some(api_ => api_.includes(api.version)) && !pluginInstance.api.some(v => api.compatible.includes(v))) {
            return false
        }

        if (!pluginInstance.support.some(v => global.v5.version.includes(v)) && !pluginInstance.support.includes('*')) {
            return false
        }

        return true
    }

    // check updates moved to PluginManager.js
}

module.exports.FakeBot = FakeBot;
module.exports.PluginLoader = PluginLoader;
module.exports.SimplePluginLoader = SimplePluginLoader