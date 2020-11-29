module.exports = {
  name: 'invite',
  description: '獲取邀請鏈接!',
  aliases: [],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    const { config, MessageEmbed } = bot
    return msg.channel.send(
      new MessageEmbed()
        .setTitle('邀請我至您的伺服器!')
        .setColor('FF2323')
        .setDescription('這是我的邀請鏈接和支援伺服器, 希望能幫助到您!')
        .addField("邀請鏈接", '[點我](https://kristen.skyouo.tech/invite "邀請鏈接")')
        .addField('支援伺服器', '[點我](https://discord.gg/F3gSD5C "邀請鏈接")')
        .setFooter(config.footer, bot.user.displayAvatarURL())
    )
  }
}
