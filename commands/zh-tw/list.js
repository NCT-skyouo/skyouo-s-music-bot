// v13

module.exports = {
  name: 'list',
  category: 'list',
  description: '獲取總歌單',
  aliases: ['ls'],
  run: async (bot, msg, args) => {
    const { config, MessageEmbed, sdb } = bot
    if (args[0]) return;
    const all = await sdb.all()
    const list = []
    for (const key in all) {
      const tmp = all[key]
      const obj2 = {}
      obj2.key = key
      obj2.list = tmp
      list.push(obj2)
    }
    const userlist = list.filter(list => list.key.startsWith(msg.author.id))
    if (userlist.length === 0) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('看起來這裡空空如也呢!')
            .setColor('RANDOM')
            .setFooter(`${msg.guild.prefix}export [歌單名稱] 以添加歌單!`)
        ]
      })
    } else {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`你的歌單 (${userlist.length})`)
            .setDescription(userlist.map(ul => `${ul.key.split('-').slice(1).join('-')} - ${ul.list.length} 首歌曲`).join('\n'))
            .setColor('RANDOM')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}
