module.exports = {
  name: 'queuerepeat',
  description: '隊列循環',
  aliases: ['queueloop', 'qloop', 'queuelp', 'qlp'],
  run: async (bot, msg, args) => {
    const { player, config, MessageEmbed, isDJPerm } = bot
    if (!player.isPlaying(msg.guild.id)) throw new Error('目前沒有正在播放的歌曲!')
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
    if (!isDJPerm(np)) throw new Error('沒有權限!')
    const repeatModeEnabled = player.getQueue(msg.guild.id).queueLoopMode
    if (repeatModeEnabled) {
      player.setQueueRepeatMode(msg.guild.id, false)
      msg.channel.send(
        new MessageEmbed()
          .setTitle('隊列重複模式關閉!!')
          .setColor('FF0523')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    } else {
      player.setQueueRepeatMode(msg.guild.id, true)
      msg.channel.send(
        new MessageEmbed()
          .setTitle('隊列重複模式開啟!!')
          .setColor('FFE023')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    }
  }
}
