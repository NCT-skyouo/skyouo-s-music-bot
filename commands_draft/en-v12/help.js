module.exports = {
  name: 'help',
  category: 'utility',
  description: 'Show the help menu',
  aliases: [],
  run: async (bot, msg, args) => {
    const { config, MessageEmbed, commands } = bot
    if (!config.help) return
    return msg.channel.send(
      new MessageEmbed()
        .setTitle('Help menu')
        .setDescription(commands.map((cmd) => `**${msg.guild.prefix}${cmd[msg.author.language].name}** - __${cmd[msg.author.language].description}__`))
        .setColor('RANDOM')
        .setFooter(config.footer, bot.user.displayAvatarURL())
    )
  }
}
