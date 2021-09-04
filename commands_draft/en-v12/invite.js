module.exports = {
  name: 'invite',
  category: 'utility',
  description: 'Get the invite link of bot!',
  aliases: [],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    const { config, MessageEmbed } = bot
    return msg.channel.send(
      new MessageEmbed()
        .setTitle('🤖 Invite me to your server!')
        .setColor('FF2323')
        .setDescription('Here is my invite link and offical server link!')
        .addField("Invite link", '[Click here](https://discord.com/api/oauth2/authorize?client_id=' + bot.user.id + '&permissions=0&scope=bot "link")')
        .addField('Offical server', '[Click here](' + bot.config.offical_server + ' "link")')
        .setFooter(config.footer, bot.user.displayAvatarURL())
    )
  }
}
