module.exports = {
  name: 'queue',
  description: '查詢目前隊列',
  aliases: ['q'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config } = bot
    try {
      const isPlaying = await player.isPlaying(msg.guild.id)
      if (!isPlaying) throw new Error('Not playing')
      const queue = await player.getQueue(msg.guild.id)
      let cp = queue.tracks
      const np = queue.playing
      if (!np && cp.length <= 0) throw new Error('Not playing')
      let page = parseInt(args[0])
      if (isNaN(page) || page < 2) {
        page = 0
      } else {
        page = page - 1
      }
      if (page !== 0) cp = cp.slice(10 * page)
      if (cp.length > 10) cp = cp.slice(0, 10)
      if (cp.length <= 0 && page) {
        return msg.channel.send(
          new MessageEmbed()
            .setTitle(`該群的隊列 (${cp.length}) | 頁數 (${page})`)
            .setDescription('這頁沒東西!')
            .setColor('FFFE07')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        )
      }
      let embed = new MessageEmbed()
        .setTitle(`該群的隊列 (${cp.length}) | 頁數 (${page})`)
        .addField('🎶 目前播放', `🎵 - **${np.name}** | ${np.duration} | 請求者: ${np.requestedBy}`)
        .setColor('FFFE07')
        .setFooter(config.footer, bot.user.displayAvatarURL())
      if (cp.length !== 0) {
        embed = embed.setDescription('```' + cp.map((item, i) => {
          return `${'🎵 ' + i} - ${item.name} | ${item.duration} | 請求者: ${item.requestedBy}`
        }).join('\n\n') + '```')
      }
      return msg.channel.send(
        embed
      )
    } catch (e) {
      if (e.message !== 'Not playing') bot.botLogger.showErr(e)
      return msg.channel.send(
        new MessageEmbed()
          .setAuthor('目前隊列是空的!!', msg.guild.iconURL())
          .setColor('FFEE07')
      )
    }
  }
}
