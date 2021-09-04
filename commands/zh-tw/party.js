// v13

module.exports = {
  name: 'party',
  category: 'filter',
  description: '開啟派對模式',
  aliases: ['party'],
  premium: true,
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

      var np = await player.getQueue(msg.guild.id);

      if (!await isDJPerm(np.playing)) throw new Error('沒有權限!!')

      player.getQueue(msg.guild.id).modify("party", true);

      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('🎶 調整成功, 切換到下一首歌曲的時候會套用!', msg.guild.iconURL())
            .setColor('FFE023')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    } catch (e) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 開啟失敗', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}
