// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'jump',
  category: 'music',
  description: '跳至指定歌曲',
  aliases: ['j', 'skipto'],
  slash: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('跳至指定歌曲.')
    .addStringOption(option => option.setName('歌曲編號').setDescription('要跳至的歌曲編號.').setRequired(true)),
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, isDJPerm } = bot
    try {
      const queue = await player.getQueue(msg.guild.id)
      if (!queue.playing || !player.isPlaying) {
        throw new Error('目前沒有播放中的歌曲!')
      }
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
      if (
        !await isDJPerm(np)
      ) { throw new Error('沒有權限!') }
      if (!args[0]) throw new Error("缺少重要參數: <track number>")
      player.jump(msg.guild.id, Number(args[0]) - 1).then(() => {
        return msg.channel.send({
          embeds: [
            new MessageEmbed()
              .setTitle('🎶 成功跳至 ' + args[0], msg.guild.iconURL())
              .setColor('FFE023')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
        })
      }).catch(e => { throw e })
    } catch (e) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 無法跳至 ' + args[0], msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}
