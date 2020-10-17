module.exports = {
  name: "removelist",
  description: "移除指定歌單",
  aliases: ["rmlist", "rmls", "rls"],
  run: async (bot, msg, args) => {
    const { config, MessageEmbed, sdb } = bot;
    if (!args[0]) return msg.channel.send(
      new MessageEmbed()
      .setTitle("用法錯誤")
      .setColor("RANDOM")
      .addField("用法範例", "```" + msg.guild.prefix +"removelist [歌單名稱]```")
      .setFooter(config.footer, bot.user.displayAvatarURL())
     )
    var all = sdb.all()
    var list = []
    for (var key in all) {
      var tmp = all[key]
      all[key] = {}
      all[key].key = key
      all[key].list = tmp
      list.push(all[key])
    }
    var userlist = list.filter(list => list.key === msg.author.id + "-" + args[0]);
    if (userlist.length === 0) {
      return msg.channel.send(
        new MessageEmbed()
        .setTitle("找不到該歌單!")
        .setColor("RANDOM")
        .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    } else {
      sdb.remove(msg.author.id + "-" + args[0])
      msg.channel.send(
        new MessageEmbed()
        .setTitle("移除成功")
        .setColor("RANDOM")
        .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    }
  }
}