// v13

module.exports = {
  name: 'help',
  category: 'utility',
  description: '獲得指令幫助',
  aliases: [],
  run: async (bot, msg, args) => {
    const { config, MessageEmbed, commands } = bot
    if (!config.help) return
    return msg.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle('幫助菜單')
          .setDescription(commands.map((cmd) => `**${msg.guild.prefix}${cmd[msg.author.language].name}** - __${cmd[msg.author.language].description}__`).join("\n"))
          .setColor('RANDOM')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      ]
    })
  }
}
