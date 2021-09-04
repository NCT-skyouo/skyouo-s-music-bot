// v13

module.exports = {
  name: 'invite',
  category: 'utility',
  description: '獲取邀請鏈接!',
  aliases: [],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    const { config, MessageEmbed } = bot
    return msg.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle('邀請我至您的伺服器!')
          .setColor('FF2323')
          .setDescription('這是我的邀請鏈接和支援伺服器, 希望能幫助到您!')
          .addField("邀請鏈接", '[點我](https://discord.com/api/oauth2/authorize?client_id=' + bot.user.id + '&permissions=24117392&scope=bot%20applications.commands "邀請鏈接")')
          .addField('支援伺服器', '[點我](' + bot.config.offical_server + ' "邀請鏈接")')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      ]
    })
  }
}
