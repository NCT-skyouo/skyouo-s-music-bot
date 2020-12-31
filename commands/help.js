module.exports = {
  name: 'help',
  description: '獲得指令幫助',
  aliases: [],
  run: async (bot, msg, args) => {
    const { config, MessageEmbed, commands } = bot
    if (!config.help) return
    return msg.channel.send(
      new MessageEmbed()
        .setTitle('幫助菜單')
        .setDescription(commands.map((cmd) => `**${msg.guild.prefix}${cmd.name}** - __${cmd.description}__`))
        .setColor('RANDOM')
        .setFooter(config.footer, bot.user.displayAvatarURL())
    )
  }
}
