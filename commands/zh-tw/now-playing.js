// v13

const { MessageButton, MessageActionRow } = require('discord.js')

var buttons = [
  [
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('⏪ 回播歌曲')
      .setCustomId('previous'),
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('⏸️ 暫停歌曲')
      .setCustomId('pause'),
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('⏩ 跳過歌曲')
      .setCustomId('skip'),
  ],
  [
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('🔀 打亂清單')
      .setCustomId('shuffle'),
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('▶️\u2005 繼續播放')
      .setCustomId('resume'),
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('⏹️ 結束播放')
      .setCustomId('stop'),
  ],
  [
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('🔂 單曲重複')
      .setCustomId('repeat'),
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('🔁 清單重複')
      .setCustomId('queuerepeat'),
    new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('🎶 調整音效')
      .setCustomId('filters'),
  ],
  [
    new MessageButton()
      .setLabel('\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b')
      .setCustomId('empty1')
      .setStyle('SECONDARY')
      .setDisabled(true),
    new MessageButton()
      .setStyle('DANGER')
      .setLabel('❌ 取消操作')
      .setCustomId('end'),
    new MessageButton()
      .setLabel('\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b')
      .setCustomId('empty2')
      .setStyle('SECONDARY')
      .setDisabled(true)
  ]
]

function ms2mmss(ms) {
  var minutes = Math.floor(ms / 60000)
  var seconds = ((ms % 60000) / 1000).toFixed(0)
  minutes = (minutes < 10 ? '0' : '') + minutes
  seconds = (seconds < 10 ? '0' : '') + seconds
  return minutes + ':' + seconds
}

module.exports = {
  name: 'now-playing',
  category: 'music',
  description: '獲取目前播放',
  aliases: ['np'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config } = bot
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

      const queue = await player.getQueue(msg.guild.id)

      // Stream time of the dispatcher
      const currentStreamTime = queue.resource
        ? queue.resource.playbackDuration + queue.additionalStreamTime
        : 0
      // Total stream time
      // const total = queue.playing.ms()

      var rows = [new MessageActionRow(), new MessageActionRow(), new MessageActionRow(), new MessageActionRow()]

      for (let i = 0; i < buttons.length; i++) rows[i] = rows[i].addComponents(buttons[i])

      var message = await msg.channel.send({
        embeds: [new MessageEmbed()
          .setAuthor('🎶 目前播放: ' + np.name, msg.guild.iconURL())
          .setURL(np.url)
          .setColor('FFEE07')
          .setDescription('```css\n' + ms2mmss(currentStreamTime) + '/' + np.duration + ' | ' + player.createProgressBar(msg.guild.id) + '```')
          .setFooter(config.footer)], 
        components: rows
      })

      const collector = message.createMessageComponentCollector({ filter: button => button.user.id === msg.author.id, max: 1, time: 30000, errors: ['time'] })

      collector.on('collect', async (button) => {
        switch (button.customId) {
          case 'end':
            collector.stop();
            break;
          default:
            bot.commands.get(button.customId)[msg.author.language].run(bot, msg, args)
            break;
        }
      })

      collector.on('end', async () => {
        await message.delete()
      })

    } catch (e) {
      return msg.channel.send({
        embeds:
          [
            new bot.MessageEmbed()
              .setTitle('❌ 調整失敗', msg.guild.iconURL())
              .setColor('FF2323')
              .addField('錯誤訊息', '```' + e.toString() + '```')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
      })
    }
  }
}
