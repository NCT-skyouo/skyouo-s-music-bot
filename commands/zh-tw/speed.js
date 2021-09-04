// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'speed',
  category: 'filter',
  description: '加速播放',
  aliases: ['spd'],
  slash: new SlashCommandBuilder()
    .setName('speed')
    .setDescription('加速播放.')
    .addStringOption(option => option.setName('數值').setDescription('速度快慢, 數值越高速度越快.').setRequired(true)),
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
      if (!args[0]) {
        return msg.channel.send({
          embeds:
            [
              new MessageEmbed()
                .setTitle('用法錯誤')
                .setColor('RANDOM')
                .addField('用法範例', '```' + msg.guild.prefix + 'speed [速度]```')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
      }
      if (Number(args[0]) > 3 || Number(args[0]) < 0.01) {
        return msg.channel.send({
          embeds:
            [
              new MessageEmbed()
                .setTitle('錯誤')
                .setColor('RANDOM')
                .setDescription('由於將該數值設置的太離譜會浪費主機的資源,\n所以請將該值設在`0.01 - 3` 之間! 謝謝您!')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
      }
      const np = await player.nowPlaying(msg.guild.id)
      if (!await isDJPerm(np)) throw new Error('沒有權限!!')
      await player.speedUp(msg.guild.id, Number(args[0]).toFixed(1))
      return msg.channel.send({
        embeds:
          [
            new MessageEmbed()
              .setTitle('🎶 加速成功', msg.guild.iconURL())
              .setColor('FFE023')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
      })
    } catch (e) {
      return msg.channel.send({
        embeds:
          [
            new MessageEmbed()
              .setTitle('❌ 加速失敗', msg.guild.iconURL())
              .setColor('FF2323')
              .addField('錯誤訊息', '```' + e.toString() + '```')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
      })
    }
  }
}
