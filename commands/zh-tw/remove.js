// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'remove',
  category: 'music',
  description: '從隊列裡移除歌曲',
  aliases: ['rm'],
  slash: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('從隊列裡移除歌曲.')
    .addIntegerOption(option => option.setName('歌曲編號').setDescription('想移除的歌曲編號.')),
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
      if (!await isDJPerm(np)) throw new Error('沒有權限移除!')
      player.remove(msg.guild.id, (!isNaN(parseInt(args[0])) ? Number(args[0]) - 1 : args[0])).then(t => {
        if (!t) {
          throw new Error('找不到要移除的歌曲')
        } else {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('🎶 移除成功', msg.guild.iconURL())
                .setColor('FFEE23')
                .setImage(t.thumbnail)
                .addField('目前播放', `[${t.name}](${t.url})`)
                .addField('歌曲時長', t.duration)
                .addField('請求者', t.requestedBy)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        }
      }).catch(e => { throw e })
      return
    } catch (e) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 無法移除', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}
