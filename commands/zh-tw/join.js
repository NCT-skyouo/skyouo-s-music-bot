// v13

module.exports = {
  name: 'join',
  category: 'music',
  description: '加入頻道',
  aliases: ['j', 'come-in', 'come'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, isDJPerm, gdb } = bot;

    try {
      if (player.isPlaying(msg.guild.id)) { throw new Error('目前有人正在使用!') }
      if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      }
      if (gdb.blacklist.enable && gdb.blacklist.channels.includes(msg.member.voice.channel.id) && !await isDJPerm({})) {
        throw new Error('這個頻道已經在黑名單裡!')
      }
      await player._join(msg.member.voice.channel);
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('🎶 加入成功', msg.guild.iconURL())
            .setColor('FFE023')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    } catch (e) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 無法加入', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}
