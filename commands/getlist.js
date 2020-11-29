function ms (duration) {
  const args = duration.split(':')
  if (args.length === 3) {
    return parseInt(args[0]) * 60 * 60 * 1000 +
            parseInt(args[1]) * 60 * 1000 +
            parseInt(args[2]) * 1000
  } else if (args.length === 2) {
    return parseInt(args[0]) * 60 * 1000 +
            parseInt(args[1]) * 1000
  } else {
    return parseInt(args[0]) * 1000
  }
}
function ms2mmss (ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

module.exports = {
  name: 'getlist',
  description: '獲取指定歌單的訊息',
  aliases: ['getls', 'gls'],
  run: async (bot, msg, args) => {
    const { config, MessageEmbed, sdb } = bot
    if (!args[0]) {
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('用法錯誤')
          .setColor('RANDOM')
          .addField('用法範例', '```' + msg.guild.prefix + 'getlist [歌單名稱]```')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
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
    if (userlist.length === 0) {
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('找不到該歌單!')
          .setColor('RANDOM')
          .setFooter(`${msg.guild.prefix}export [歌單名稱] 以添加該歌單!`)
      )
    } else {
      const durs = userlist[0].list.map(l => ms(l.duration))
      const duration = durs.reduce((a, b) => a + b)
      return msg.channel.send(
        new MessageEmbed()
          .setTitle(`你的歌單 (${userlist[0].key.split('-').slice(1).join('-')})`)
          .setDescription(userlist[0].list.map(l => `[${l.name}](${l.url}) - ${l.duration}`).join('\n') + '\n\n**共長 ' + ms2mmss(duration) + '**')
          .setColor('RANDOM')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    }
  }
}
