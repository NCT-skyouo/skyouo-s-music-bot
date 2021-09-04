// v13

module.exports = {
  name: 'dumpsonginfo',
  category: 'sysadmin',
  description: '[Developer] 查看歌曲資訊',
  aliases: ['dsi', 'songinfo', 'si'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed } = bot
    if (msg.author.id !== bot.config.ownerid) return
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

      var result = []
      var info = np.getAllInfoForList()
      Object.keys(info).forEach(key => {
        result.push(`${key} - ${info[key]}`)
      })
      // const queue = await player.getQueue(msg.guild.id)

      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(np.name)
            .setURL(np.url)
            .setDescription("```yml\n" + result.join('\n') + "\n```")
            .setColor("FFEE07")
            .setFooter(bot.config.footer, bot.user.displayAvatarURL())
        ]
      })
    } catch (err) {
      return msg.channel.send(err.message)
    }
  }
}
