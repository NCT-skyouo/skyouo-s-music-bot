module.exports = {
  name: 'metal',
  description: '[Premium] 測試用, 訊號不好者勿用',
  aliases: [],
  premium: true,
  run: async (bot, msg, args) => {
    try {
      if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('目前沒有正在播放的歌曲!') }
      if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel && msg.guild.me.voice.channel &&	msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      }
      const np = await bot.player.nowPlaying(msg.guild.id)
      if (!await bot.isDJPerm(np)) throw new Error('沒有權限!!')
      const metalEnabled = await bot.player.getQueue(msg.guild.id).filters.metal
      bot.player.setFilters(msg.guild.id, {
        metal: !metalEnabled
      })
      return msg.channel.send(
        new bot.MessageEmbed()
          .setTitle('🎶 ' + (!metalEnabled ? '開啟' : '關閉') + ' 鋼鐵 成功', msg.guild.iconURL())
          .setColor('FFE023')
          .setFooter(bot.config.footer, bot.user.displayAvatarURL()
          )
      )
    } catch (e) {

    }
  }
}
