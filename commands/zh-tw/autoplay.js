// v13

module.exports = {
    name: 'autoplay',
    category: 'music',
    description: '當隊列結束時, 自動播放相關的音樂.',
    aliases: ['ap', 'autop', 'aplay'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        try {
            if (!player.isPlaying(msg.guild.id)) throw new Error('目前沒有正在播放的歌曲!')
            const np = await player.nowPlaying(msg.guild.id)
            if (!msg.member.voice.channel) {
              throw new Error('您尚未加入任何一個語音頻道!')
            } else if (
              msg.member.voice.channel &&
              msg.guild.me.voice.channel &&
              msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
              throw new Error('您必須要與機器人在同一個語音頻道!')
            }
            if (!await isDJPerm(np)) throw new Error('沒有權限開啟!')
            var autoplay = await player.autoplay(msg.guild.id)
            return msg.channel.send({
              embeds: [new MessageEmbed()
                .setTitle('🎶 成功' + (autoplay ? "開啟" : "關閉"), msg.guild.iconURL())
                .setColor('FFE023')
                .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
          } catch (e) {
            return msg.channel.send({
              embeds: [new MessageEmbed()
                .setTitle('❌ 無法設定', msg.guild.iconURL())
                .setColor('FF2323')
                .addField('錯誤訊息', '```' + e.toString() + '```')
                .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
          }
    }
  }
  