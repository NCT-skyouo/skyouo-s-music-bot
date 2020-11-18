module.exports = {
  name: 'tos',
  description: '服務守則, 務必遵守',
  aliases: [],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    const { config, MessageEmbed } = bot
    return msg.channel.send(
      new MessageEmbed()
        .setTitle('v5 機器人 | 服務守則')
        .setColor('FF2323')
        .addField("法律部分", "為了遵守中華民國著作權法 '合理使用' 之第 55 條,\n您不得將該機器人所公開播送之部分用於商業用途,\n且播送時仍需遵守中華民國著作權法 '合理使用' 部分.\n高級版啟用後即代表該機器人所重製的音樂符合中華民國著作權法 '合理使用' 之第 51 條.")
        .addField("w", "w")
        .setFooter(config.footer, bot.user.displayAvatarURL())
    )
  }
}
