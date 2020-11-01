module.exports = {
  name: 'now-playing',
  description: '獲取目前播放',
  aliases: ['np'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config } = bot
    const isPlaying = await player.isPlaying(msg.guild.id)
    try {
      if (!isPlaying) throw new Error('沒有正在播放的歌曲')

      const np = await player.nowPlaying(msg.guild.id)

      const queue = await player.getQueue(msg.guild.id)

      function ms2mmss (ms) {
        const minutes = Math.floor(ms / 60000)
        const seconds = ((ms % 60000) / 1000).toFixed(0)
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
      }
      // Stream time of the dispatcher
      const currentStreamTime = queue.voiceConnection.dispatcher
        ? queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime
        : 0
        // Total stream time
      // const total = queue.playing.ms()
      msg.channel.send(
        new MessageEmbed()
          .setAuthor('目前播放: ' + np.name, msg.guild.iconURL())
          .setURL(np.url)
          .setColor('FFEE07')
          .setDescription('```' + ms2mmss(currentStreamTime) + '/' + np.duration + '\n\n\n' + player.createProgressBar(msg.guild.id) + '```')
          .setFooter(config.footer)
      )
    } catch (e) {
      bot.botLogger.showErr(e)
    }
  }
}
