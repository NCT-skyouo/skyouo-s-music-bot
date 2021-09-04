// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'seek',
  category: 'music',
  description: '跳至指定時間',
  aliases: ['goto'],
  slash: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('跳至指定時間.')
    .addStringOption(option => option.setName('時間').setDescription('要跳至的時間 (格式: 分分:秒秒).').setRequired(true)),
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, isDJPerm } = bot
    try {
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
        .seek(msg.guild.id, args[0])
        .then(async () => {
          const np = await player.nowPlaying(msg.guild.id)
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('成功', msg.guild.iconURL())
                .setColor('FFEE07')
                .setDescription('```' + args[0] + '/' + np.duration + '\n\n\n' + player.createProgressBar(msg.guild.id) + '```')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        })
        .catch((e) => {
          return msg.channel.send({
            embeds:
              [
                new bot.MessageEmbed()
                  .setTitle('❌ 調整失敗', msg.guild.iconURL())
                  .setColor('FF2323')
                  .addField('錯誤訊息', '```' + e.toString() + '```')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
          })
        })
    } catch (e) {
      return msg.channel.send({
        embeds:
          [
            new bot.MessageEmbed()
              .setTitle('❌ 調整失敗', msg.guild.iconURL())
              .setColor('FF2323')
              .addField('錯誤訊息', '```' + e.toString() + '```')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
      })
    }
  }
}
