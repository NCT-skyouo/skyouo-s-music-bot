module.exports = {
  name: 'karaoke',
  description: '[Premium] 去人聲, 不太乾淨',
  aliases: ['ok'],
  premium: true,
  run: async (bot, msg, args) => {
    try {
      if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('目前沒有正在播放的歌曲!') }
      if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel && msg.guild.me.voice.channel && msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      }
      const np = await bot.player.nowPlaying(msg.guild.id)
      if (!bot.isDJPerm(np)) throw new Error('沒有權限!!')
      const karaokeEnabled = await bot.player.getQueue(msg.guild.id).filters.karaoke
      bot.player.setFilters(msg.guild.id, {
        karaoke: !karaokeEnabled
      })
      return msg.channel.send(
        new bot.MessageEmbed()
          .setTitle('🎶 ' + (!karaokeEnabled ? '開啟' : '關閉') + ' 卡拉ok(非完整去人聲) 成功', msg.guild.iconURL())
          .setColor('FFE023')
          .setFooter(bot.config.footer, bot.user.displayAvatarURL()
          )
      )
    } catch (e) {

    }
  }
}
