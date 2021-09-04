// v13

module.exports = {
  name: 'disconnect',
  category: 'music',
  description: '停止播放, 並離開頻道',
  aliases: ['leave', 'fuckoff', 'left', 'stfu'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, isDJPerm } = bot
    try {
      // if (player.isPlaying(msg.guild.id)) { throw new Error('目前仍有正在播放的歌曲!') }
      if (!msg.guild.me.voice.channel) {
        throw new Error('機器人未加入任何一個語音頻道!')
      }

      // const np = await player.nowPlaying(msg.guild.id)
      if (!await isDJPerm({})) throw new Error('沒有權限!!')

      if (player.isPlaying(msg.guild.id)) await player.stop(msg.guild.id)
      else await msg.guild.me.voice.disconnect()

      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('🎶 成功離開', msg.guild.iconURL())
            .setColor('FFE023')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    } catch (e) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 無法離開', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}
