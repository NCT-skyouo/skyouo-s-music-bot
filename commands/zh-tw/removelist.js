const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'removelist',
  category: 'list',
  description: '移除指定歌單',
  aliases: ['rmlist', 'rmls', 'rls'],
  slash: new SlashCommandBuilder()
    .setName('removelist')
    .setDescription('從隊列裡移除歌曲.')
    .addStringOption(option => option.setName('歌單名稱').setDescription('自製歌單的名稱.')),
  run: async (bot, msg, args) => {
    const { config, MessageEmbed, sdb } = bot
    if (!args[0]) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 用法錯誤')
            .setColor('RANDOM')
            .addField('用法範例', '```' + msg.guild.prefix + 'removelist [歌單名稱]```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
    const all = await sdb.all()
    const list = []
    for (const key in all) {
      const tmp = all[key]
      all[key] = {}
      all[key].key = key
      all[key].list = tmp
      list.push(all[key])
    }
    const userlist = list.filter(list => list.key === msg.author.id + '-' + args[0])
    if (!userlist.length) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 找不到該歌單!')
            .setColor('RANDOM')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    } else {
      sdb.remove(msg.author.id + '-' + args[0])
      msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('✅ 移除成功')
            .setColor('RANDOM')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}
