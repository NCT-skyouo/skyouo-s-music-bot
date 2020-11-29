module.exports = {
  name: 'disconnect',
  description: '停止播放, 並離開頻道',
  aliases: ['leave', 'fuckoff', 'left', 'stfu'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, isDJPerm } = bot
    try {
      if (!player.isPlaying(msg.guild.id)) { throw new Error('目前沒有正在播放的歌曲!') }
      if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel &&
        msg.guild.me.voice.channel &&
        msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      }
      const np = await player.nowPlaying(msg.guild.id)
      if (!await isDJPerm(np)) throw new Error('沒有權限!!')
      player.stop(msg.guild.id)
      .then(() => {

      })
      .catch(() => {

      })
      .finally(() => {
        if (msg.guild.me.voice.channel) msg.guild.me.voice.channel.leave()
      })
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('🎶 成功離開', msg.guild.iconURL())
          .setColor('FFE023')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    } catch (e) {
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('❌ 無法離開', msg.guild.iconURL())
          .setColor('FF2323')
          .addField('錯誤訊息', '```' + e.toString() + '```')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    }
  }
}
