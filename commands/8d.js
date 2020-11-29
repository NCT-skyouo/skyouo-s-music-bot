module.exports = {
  name: '8d',
  description: '[Premium] 8D音響, 單聲道手機勿用',
  aliases: [],
  premium: true,
  run: async (bot, msg, args) => {
    try {
      if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('目前沒有正在播放的歌曲!') }
      if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel &&
        msg.guild.me.voice.channel &&
        msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      }
      const np = await bot.player.nowPlaying(msg.guild.id)
      if (!await bot.isDJPerm(np)) throw new Error('沒有權限!!')
      const Enabled = await bot.player.getQueue(msg.guild.id).filters['8D']
      bot.player.setFilters(msg.guild.id, {
        '8D': !Enabled
      })
      return msg.channel.send(
        new bot.MessageEmbed()
          .setTitle('🎶 ' + (!Enabled ? '開啟' : '關閉') + ' 8D 成功', msg.guild.iconURL())
          .setColor('FFE023')
          .setFooter(bot.config.footer, bot.user.displayAvatarURL()
          )
      )
    } catch (e) {

    }
  }
}
