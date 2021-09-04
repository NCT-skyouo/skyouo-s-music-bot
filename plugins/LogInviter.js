module.exports = {
  name: 'LogInviter',
  id: 'log-inviter',
  description: "想要知道誰邀請了您的機器人嘛? Log Inviter 幫助您監控新進的伺服器!",
  enable: true,
  author: 'NCT skyouo',
  version: '1.1.0',
  api: ['2.0.0'],
  support: ['6.0.0'],
  requires: ['discord.js'],
  Plugin: class {
    constructor(bot, api) {
      this.logger = api.getLoggerInstance('插件-邀請紀錄');
      this.db = api.registerFileAsDB('LogInviter', 'inviter')
      this.status = 'load';
      this.bot = bot;
      this.api = api;
      this.configs = {
        "log_channel": "777485251253370900"
      };
    }
    onLoad() {
      if (!this.bot.settingsClone.allowListenEvents && !this.bot.settingsClone.allowAll) {
				this.logger.warn("您必須要開啟設置 'allowListenEvents' 才能使用該插件!");
				this.status = 'fail';
				return;
			}

      var join = async (bot, guild) => {
        const logs = await guild.fetchAuditLogs()
        const log = logs.entries.find(l => l.action === "BOT_ADD" && l.target.id === bot.user.id)
        if (log) {
          try {
            var embed = new bot.MessageEmbed()
              .setTitle(`<a:verify:721155712683737129> 謝謝您邀請我!`)
              .setDescription(`${log.executor.tag} 您好,\n\n\`\`\`\n感謝您使用 v6 機器人,\n使用 ${bot.config.prefix}help 就可以查看所有指令,\n若有什麼問題可以到 v6 GitHub 頁面發表 issue,\n本機器人目前擁有 ${bot.commands.size} 個指令\n再次感謝您使用 ${bot.user.tag}.\`\`\`\nGitHub 專案連結: [點我](https://github.com/NCT-skyouo/skyouo-s-music-bot)\n官方伺服器: [點我](${bot.config.offical_server})`)
              .setColor('RANDOM')
              .setFooter(bot.config.footer, bot.user.displayAvatarURL())
            log.executor.send({ embeds: [embed] })
            this.db.set(guild.id, log.executor.id)
          } catch (e) {
            this.logger.showErr(e)
          }

          try {
            bot.channels.cache.get(this.configs.log_channel).send({
              embeds: [
                new bot.MessageEmbed()
                  .setTitle('新的群組')
                  .addField('群組名稱', '```\n' + guild.name + '\n```')
                  .addField('群組人數', '```\n' + guild.memberCount + '\n```')
                  .setColor('FF0077')
              ]
            })
          } catch (e) {
            this.logger.showErr(e)
          }
        }
      }

      var leave = async (bot, guild) => {
        bot.channels.cache.get(this.configs.log_channel).send({
          embeds: [
            new bot.MessageEmbed()
              .setTitle('離開群組')
              .addField('群組名稱', '```\n' + guild.name + '\n```')
              .addField('群組人數', '```\n' + guild.memberCount + '\n```')
              .setColor('FF0077')
          ]
        })
      }
      this.api.registerEvent('guildCreate', join)
      this.api.registerEvent('guildDelete', leave)
      this.status = 'active'
    }

    onEnable() { }

    onDisable() { }
  }
};
