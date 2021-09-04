// v13

module.exports = {
  name: 'skip',
  category: 'music',
  description: '投票以跳過歌曲',
  aliases: ['vskp', 'vskip'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, isDJPerm } = bot
    try {
      if (!player.isPlaying(msg.guild.id)) throw new Error('目前沒有正在播放的歌曲!')
      const np = await player.nowPlaying(msg.guild.id)
      if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel &&
        msg.guild.me.voice.channel &&
        msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      }

      let queue = player.getQueue(msg.guild.id)

      if (queue.voter.some(m => m.id === msg.author.id)) {
        queue.voter.splice(queue.voter.indexOf(msg.author), 1)
        let voter = queue.voter
        var voteCount = voter.length
        var stillNeed = Math.ceil((msg.member.voice.channel.members.size - 1) * 0.66 - voter.length)
        var total = (stillNeed + voteCount)
        var bar = [...(String('🟥').repeat(15))]
        var need = Math.floor(bar.length * (voteCount / total))
        for (let i = 0; i < need; i++) {
          bar[i] = '🟩'
        }
        return msg.channel.send({
          embeds:
            [
              new MessageEmbed()
                .setTitle('🎶 成功取消投票', msg.guild.iconURL())
                .setColor('FFE023')
                .setDescription(`\`\`\`\n已有 ${voteCount} 位成員投票,\n仍需 ${stillNeed} 票數才能跳過.\n\`\`\``)
                .addField('投票進度', `\`\`\`\n${bar.join('')}\n\`\`\``)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
      }

      let voter = await player.vote(msg.guild.id, msg.author);

      if (voter.length > ((msg.member.voice.channel.members.size - 1) * 0.66)) {
        player.skip(msg.guild.id);
        return msg.channel.send({
          embeds:
            [
              new MessageEmbed()
                .setTitle('🎶 成功跳過', msg.guild.iconURL())
                .setColor('FFE023')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
      } else {
        var voteCount = voter.length
        var stillNeed = Math.ceil((msg.member.voice.channel.members.size - 1) * 0.66 - voter.length)
        var total = (stillNeed + voteCount)
        var bar = [...(String('🟥').repeat(15))]
        var need = Math.floor(bar.length * (voteCount / total))
        for (let i = 0; i < need; i++) {
          bar[i] = '🟩'
        }
        return msg.channel.send({
          embeds:
            [
              new MessageEmbed()
                .setTitle('🎶 成功投票', msg.guild.iconURL())
                .setColor('FFE023')
                .setDescription(`\`\`\`\n已有 ${voteCount} 位成員投票,\n仍需 ${stillNeed} 票數才能跳過.\n\`\`\``)
                .addField('投票進度', `\`\`\`\n${bar.join('')}\n\`\`\``)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
      }
    } catch (e) {
      return msg.channel.send({
        embeds:
          [
            new MessageEmbed()
              .setTitle('❌ 無法投票/跳過', msg.guild.iconURL())
              .setColor('FF2323')
              .addField('錯誤訊息', '```' + e.toString() + '```')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
      })
    }
  }
}
