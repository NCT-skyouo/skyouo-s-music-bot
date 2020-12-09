function ms2mmss (ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

module.exports = {
  name: 'rewind',
  description: '向前調整指定秒數',
  aliases: ['rw'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, isDJPerm } = bot
    const np = await player.nowPlaying(msg.guild.id)
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
    if (!await isDJPerm(np)) throw new Error('沒有權限!!')
    player
      .rewind(msg.guild.id, isNaN(parseInt(args[0])) ? 0 : parseInt(args[0]))
      .then(async () => {
        const np = await player.nowPlaying(msg.guild.id)
        msg.channel.send(
          new MessageEmbed()
            .setAuthor('成功', msg.guild.iconURL())
            .setColor('FFEE07')
            .setDescription('```' + ms2mmss(player.getQueue(msg.guild.id).additionalStreamTime) + '/' + np.duration + '\n\n\n' + player.createProgressBar(msg.guild.id) + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        )
      })
      .catch((e) => {
        msg.channel.send(e.toString())
      })
  }
}
