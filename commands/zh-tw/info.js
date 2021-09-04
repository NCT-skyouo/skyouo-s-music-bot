// v13

module.exports = {
  name: 'info',
  category: 'utility',
  description: '作者的話',
  aliases: [],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    const { config, MessageEmbed } = bot
    return msg.channel.send({
      embeds: [
        new MessageEmbed()
        .setTitle('v6 機器人, 您日常的好夥計')
        .setColor('FF2323')
        .addField('銘謝名單', 'NCT skyouo#3144 (599923291968241666) - 專案主要維護者, better-storing, mojim-crawler 作者\nTEA#7331 (582018951903707136) - 翻譯者 (English)')
        .setFooter(config.footer, bot.user.displayAvatarURL())
      ]
    })
  }
}
