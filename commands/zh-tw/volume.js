// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'volume',
  category: 'music',
  description: '調整音量',
  aliases: ['vol'],
  slash: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('調整音量.')
    .addStringOption(option => option.setName('音量大小').setDescription('音量大小, 數值越高音量越大.').setRequired(true)),
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, isDJPerm } = bot
    try {
      const np = await player.nowPlaying(msg.guild.id)
      if (!args[0]) { throw new Error(`沒有提供歌曲音量!\n用法: ${msg.guild.prefix}volume (音量)`) }
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
      if (!await isDJPerm(np)) throw new Error('沒有權限跳過!')
      if (isNaN(parseInt(args[0]))) throw new Error('無效的音量, 必須是數字!')
      if (Number(args[0]) > 200 || Number(args[0]) < 0) {
        return msg.channel.send({
          embeds:
            [
              new MessageEmbed()
                .setTitle('❌ 錯誤')
                .setColor('RANDOM')
                .setDescription('由於將該數值設置的太離譜會浪費主機的資源,\n所以請將該值設在`0 - 200` 之間! 謝謝您!')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
      }
      player.setVolume(msg.guild.id, parseInt(args[0]))
      return msg.channel.send({
        embeds:
          [
            new MessageEmbed()
              .setTitle('🎶 成功調整', msg.guild.iconURL())
              .setColor('FFE023')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
      })
    } catch (e) {
      return msg.channel.send({
        embeds:
          [
            new MessageEmbed()
              .setTitle('❌ 無法調整', msg.guild.iconURL())
              .setColor('FF2323')
              .addField('錯誤訊息', '```' + e.toString() + '```')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
      })
    }
  }
}
