const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { FakeMessage } = require('../libs/discord-js-v12-v13/index')

const Discord = require('discord.js')

module.exports = {
    name: "Context Menu",
    id: "context-menu",
    description: "有的時候用戶懶的連打幾個字的指令都不想要, 倘若解決這樣的問題, 您應該試試這款插件!\n只需要在界面上發送您想要尋找的歌曲, 然後對發出去的消息點右鍵, \n機器人就會自動進入您的語音頻道, 並且播放您想要尋找的歌曲!",
    enable: false,
    author: "NCT skyouo",
    version: "1.1.0",
    api: ['2.0.0'],
    support: ['6.0.0 Preview'],
    requires: ['discord.js', '@discordjs/rest', 'discord-api-types'],
    Plugin: class {
        constructor(bot, api) {
            this.logger = api.getLoggerInstance('插件-內容選單')
            this.status = "load"
            this.bot = bot
            this.api = api
            this.configs = {
                "menus": [
                    {
                        "name": "加到隊列 (Youtube)",
                        "type": 3
                    },
                    {
                        "name": "加到隊列 (SoundCloud)",
                        "type": 3
                    },
                    {
                        "name": "加到隊列 (Spotify)",
                        "type": 3
                    },
                    {
                        "name": "加到隊列 (BiliBili 視頻)",
                        "type": 3
                    },
                    {
                        "name": "加到隊列 (網易雲)",
                        "type": 3
                    },
                ]
            }
        }
        async onLoad() {
            var self = this
            if (!self.bot.token || (!self.bot.settingsClone.allowListenEvents && !self.bot.settingsClone.allowAll) || !self.bot.user) {
                this.logger.warn("您必須要開啟設置 'allowImportantConfigsAccess', 'allowClientUserAccess' 和 'allowListenEvents' 才能使用該插件!");
                this.status = 'fail';
                return;
            }

            const rest = new REST({ version: '9' }).setToken(self.bot.token);
            await rest.put(
                Routes.applicationCommands(self.bot.user.id),
                { body: self.configs.menus }
            )

            /**
             * @param {Discord.Interaction} interaction
             */
            self.bot.on('interactionCreate', async (interaction) => {
                if (!interaction.isContextMenu()) return;
                var msg = new FakeMessage(interaction);
                var realMsg = interaction.options?.getMessage('message')
                if (msg.author.bot) return
                if (!msg.guild) return /*await msg.author.send("別私訊我啦 uwu, 我會... 害羞 (,,・ω・,,)")*/;
                var bot = self.bot
                let gdb = await bot.db.get(msg.guild.id)
                if (!gdb) {
                    await bot.db.set(msg.guild.id, bot.config.defaultconfig)
                    gdb = bot.config.defaultconfig
                }

                const prefix = msg.guild.prefix = (gdb.prefix.personal[msg.author.id] || gdb.prefix.guild) ?? bot.config.prefix

                bot.gdb = gdb

                let preferredLanguage = gdb.languages.personal[msg.author.id] ? gdb.languages.personal[msg.author.id] : gdb.languages.guild
                msg.author.language = msg.member.language = preferredLanguage

                await interaction.reply("請稍後, 將會為您播放...")
                switch (interaction.commandName) {
                    case "加到隊列 (Youtube)":
                        self.bot.commands.get('play')[preferredLanguage].run(bot, msg, [realMsg.content])
                        break;
                    case "加到隊列 (SoundCloud)":
                        if (this.bot.player.resolveQueryType(realMsg.content) === 'youtube-video-keywords') realMsg.content = 'soundcloud:' + realMsg.content
                        self.bot.commands.get('play')[preferredLanguage].run(bot, msg, [realMsg.content])
                        break;
                    case "加到隊列 (Spotify)":
                        self.bot.commands.get('play')[preferredLanguage].run(bot, msg, [realMsg.content])
                        break;
                    case "加到隊列 (BiliBili 視頻)":
                        if (this.bot.player.resolveQueryType(realMsg.content) === 'youtube-video-keywords') realMsg.content = 'bilibili-video:' + realMsg.content
                        self.bot.commands.get('play')[preferredLanguage].run(bot, msg, [realMsg.content])
                        break;
                    case "加到隊列 (BiliBili 番劇)":
                        if (this.bot.player.resolveQueryType(realMsg.content) === 'youtube-video-keywords') realMsg.content = 'bilibili-anime:' + realMsg.content
                        self.bot.commands.get('play')[preferredLanguage].run(bot, msg, [realMsg.content])
                        break;
                    case "加到隊列 (網易雲)":
                        if (this.bot.player.resolveQueryType(realMsg.content) === 'youtube-video-keywords') realMsg.content = 'netease:' + realMsg.content
                        self.bot.commands.get('play')[preferredLanguage].run(bot, msg, [realMsg.content])
                        break;
                    case "加到隊列 (Tiktok)":
                        self.bot.commands.get('play')[preferredLanguage].run(bot, msg, [realMsg.content])
                        break;
                    case "加到隊列 (LBRY)":
                        if (this.bot.player.resolveQueryType(realMsg.content) === 'youtube-video-keywords') realMsg.content = 'lbry:' + realMsg.content
                        self.bot.commands.get('play')[preferredLanguage].run(bot, msg, [realMsg.content])
                        break;
                    default:
                        return;
                }

                // msg.interaction = null
                // console.log(msg.channel.send)
            })
            self.logger.info("載入成功!")
            self.status = "active"
        }

        onEnable() {
            if (this.status === "active") this.logger.info("啟動成功!")
        }

        onDisable() { }
    }
}