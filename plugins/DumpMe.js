function randstr(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
    return result;
}

module.exports = {
    name: "Dump Me",
    id: "dump-me",
    description: "回報 Bug 時開發人員要您提供 dump 指令的連結?\n那麼安裝這款插件吧! 此插件會收集非敏感資訊, 並將其發送到 Kristen 的伺服器!",
    enable: true,
    author: "NCT skyouo",
    version: "1.1.0",
    api: ['2.0.0'],
    support: ['6.0.0', '6.0.1'],
    requires: ['discord.js', 'node-fetch'],
    loadLater: true,
    Plugin: class {
        constructor(bot, api) {
            this.logger = api.getLoggerInstance('插件-導出資訊')
            this.status = "load"
            this.bot = bot
            this.api = api
            this.configs = {
                // 官方導出資料網站: https://dump.kristen.skyouo.tech
                dumpServer: "https://dump.kristen.skyouo.tech"
            }
        }
        onLoad() {
            if (!this.bot.commands) {
				this.logger.warn("您必須要開啟設置 'allowCommandAccess' 才能使用該插件!");
				this.status = 'fail';
				return;
			}

            this.api.registerCategory("sysadmin")
            var self = this
            async function dump_ZH_TW(bot, msg, args) {
                const { MessageEmbed } = require("discord.js")
                const fetch = require('node-fetch')
                if (bot.config.ownerid !== msg.author.id) return msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("❌ 您沒有權限使用!")
                            .setColor("RED")
                            .setDescription("蠻抱歉, 該指令只能給機器人擁有者使用!")
                            .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                    ]
                })

                const configClone = JSON.parse(JSON.stringify(bot.config))
                // obfuscating important infomation for preventing werido destroying bot lol
                configClone["token"] = randstr(configClone.token.length)
                if (configClone["APIKEY"].length) {
                    configClone["APIKEY"] = configClone["APIKEY"].map(key => randstr(key.length))
                }
                // configClone.spotify.clientID = randstr(configClone.spotify.clientID.length)
                // configClone.spotify.clientSecret = randstr(configClone.spotify.clientSecret.length)
                configClone.genius.key = randstr(configClone.genius.key.length)
                configClone.web.url = randstr(configClone.web.url.length)
                configClone.web.clientSecret = randstr(configClone.web.clientSecret.length)
                for (var way of Object.keys(configClone.store)) {
                    configClone.store[way].mysql.host = randstr(configClone.store[way].mysql.host.length)
                    configClone.store[way].mysql.user = randstr(configClone.store[way].mysql.user.length)
                    configClone.store[way].mysql.password = randstr(configClone.store[way].mysql.password.length)
                    configClone.store[way].mongo.url = randstr(configClone.store[way].mongo.url.length)
                    configClone.store[way].redis.host = randstr(configClone.store[way].redis.host.length)
                    configClone.store[way].redis.password = randstr(configClone.store[way].redis.password.length)
                }
                const packageJson = require(require("path").join(process.cwd(), "package.json"))
                const info = {
                    v6: global.v5,
                    config: configClone,
                    commands: Array.from(bot.commands.keys()),
                    plugins: Array.from(bot.plugins.keys()),
                    loggers: {
                        bot: null,
                        process: null,
                        core: null,
                        plugins: {}
                    },
                    packages: packageJson.dependencies
                }
                info.loggers.bot = bot.botLogger.history
                info.loggers.process = bot.processLogger.history
                info.loggers.core = global.coreLogger.history
                Array.from(bot.plugins.keys()).forEach(p => {
                    var plugin = bot.plugins.get(p)
                    info.loggers.plugins[p] = plugin.logger.history
                })
                var response = await fetch(`${self.configs.dumpServer}/documents`, {
                    method: "post",
                    body: JSON.stringify(info, null, 2)
                }).then(res => res.json())
                switch (response.message) {
                    case "Document exceeds maximum length.":
                        msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("❌ 無法發送資料到主伺服器!")
                                    .setColor("RED")
                                    .setDescription("紀錄超過 40 MB!")
                                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                        break;
                    case "Error adding document.":
                        msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("❌ 無法發送資料到主伺服器!")
                                    .setColor("RED")
                                    .setDescription("紀錄內容為空!")
                                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                        break;
                    case "Connection error.":
                        msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("❌ 無法發送資料到主伺服器!")
                                    .setColor("RED")
                                    .setDescription("連線意外中斷!")
                                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                        break;
                    default:
                        msg.channel.send({
                            embeds: [
                            new MessageEmbed()
                                .setTitle("✅ 發送成功!")
                                .setColor("GREEN")
                                .setDescription(`請複製以下連結給官方人員 (如果他們有問的話):\n\`\`\`\n${self.configs.dumpServer}/${response.key}\n\`\`\``)
                                .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                        break;
                }
            };

            async function dump_EN(bot, msg, args) {
                const { MessageEmbed } = require("discord.js")
                const fetch = require('node-fetch')
                if (bot.config.ownerid !== msg.author.id) return msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("❌ Owner only command!")
                            .setColor("RED")
                            .setDescription("I'm sorry, but this command is restricted to owner only!")
                            .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                    ]
                })

                const configClone = JSON.parse(JSON.stringify(bot.config))
                // obfuscating important infomation for preventing werido destoring bot lol
                configClone["token"] = randstr(configClone.token.length)
                if (configClone["APIKEY"].length) {
                    configClone["APIKEY"] = configClone["APIKEY"].map(key => randstr(key.length))
                }
                // configClone.spotify.clientID = randstr(configClone.spotify.clientID.length)
                // configClone.spotify.clientSecret = randstr(configClone.spotify.clientSecret.length)
                configClone.genius.key = randstr(configClone.genius.key.length)
                configClone.web.url = randstr(configClone.web.url.length)
                for (var way of Object.keys(configClone.store)) {
                    configClone.store[way].mysql.host = randstr(configClone.store[way].mysql.host.length)
                    configClone.store[way].mysql.user = randstr(configClone.store[way].mysql.user.length)
                    configClone.store[way].mysql.password = randstr(configClone.store[way].mysql.password.length)
                    configClone.store[way].mongo.url = randstr(configClone.store[way].mongo.url.length)
                    configClone.store[way].redis.host = randstr(configClone.store[way].redis.host.length)
                    configClone.store[way].redis.password = randstr(configClone.store[way].redis.password.length)
                }
                const packageJson = require(require("path").join(process.cwd(), "package.json"))
                const info = {
                    v6: global.v5,
                    config: configClone,
                    commands: Array.from(bot.commands.keys()),
                    plugins: Array.from(bot.plugins.keys()),
                    loggers: {
                        bot: null,
                        process: null,
                        core: null,
                        plugins: {}
                    },
                    packages: packageJson.dependencies
                }
                info.loggers.bot = bot.botLogger.history
                info.loggers.process = bot.processLogger.history
                info.loggers.core = global.coreLogger.history
                Array.from(bot.plugins.keys()).forEach(p => {
                    var plugin = bot.plugins.get(p)
                    info.loggers.plugins[p] = plugin.logger.history
                })
                var response = await fetch(`${self.configs.dumpServer}/documents`, {
                    method: "post",
                    body: JSON.stringify(info, null, 2)
                }).then(res => res.json())
                switch (response.message) {
                    case "Document exceeds maximum length.":
                        msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("❌ Could not upload!")
                                    .setColor("RED")
                                    .setDescription("Logs size exceeds the limit (40 MB)!")
                                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                        break;
                    case "Error adding document.":
                        msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("❌ Could not upload!")
                                    .setColor("RED")
                                    .setDescription("Logs are empty!")
                                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                        break;
                    case "Connection error.":
                        msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("❌ Could not upload!")
                                    .setColor("RED")
                                    .setDescription("Connection closed unexpectedly!")
                                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                        break;
                    default:
                        msg.channel.send({
                            embeds: [
                            new MessageEmbed()
                                .setTitle("✅ Uploaded!")
                                .setColor("GREEN")
                                .setDescription(`Please copy this link, and send it to Kristen v6 developers (If they ask for it):\n\`\`\`\n${self.configs.dumpServer}/${response.key}\n\`\`\``)
                                .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                        break;
                }
            };

            this.api.registerCommand(
                'dump',
                {
                    category: 'sysadmin',
                    description: '導出資訊, 讓 Kristen v6 官方人員更好判斷你的問題!',
                    aliases: []
                },
                dump_ZH_TW,
                'zh-tw'
            );

            this.api.registerCommand(
                'dump',
                {
                    category: 'sysadmin',
                    description: 'Dump the infomations, let developer know your issue(s) more!',
                    aliases: []
                },
                dump_EN,
                'en'
            );
            this.status = "active"
        }

        onEnable() {
            if (this.status === "active") this.logger.info("啟動成功!")
        }

        onDisable() { }
    }
}