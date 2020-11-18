module.exports = {
  name: 'pitch',
  description: '加快節奏',
  aliases: ['pit'],
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
      player.pitchUp(msg.guild.id, Number(args[0]).toFixed(2)).catch(e => {
        throw e
      })
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('🎶 調整成功', msg.guild.iconURL())
          .setColor('FFE023')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    } catch (e) {
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('❌ 調整失敗', msg.guild.iconURL())
          .setColor('FF2323')
          .addField('錯誤訊息', '```' + e.toString() + '```')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    }
  }
}
