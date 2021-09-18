// v13

module.exports = {
  name: 'tos',
  category: 'utility',
  description: '服務守則, 務必遵守',
  aliases: [],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    const { config, MessageEmbed } = bot
    return msg.channel.send({
      embeds:
        [
          new MessageEmbed()
            .setTitle('v6 機器人 | 服務守則')
            .setColor('FF2323')
            .setDescription("以下代指本服務稱 Kristen v6\n您為 服務使用者\n公眾為 多數人與非特定人, 為了保障您的權益, 請詳讀.")
            .addField("1.", "為了遵守中華民國著作權法 '合理使用' 之第 55 條,\n您不得將該機器人所公開播送之部分用於商業用途,\n若您並非居住在中華民國法定領土, 上述守則仍有效.")
            .addField("2.", "在您不得使用本服務做出任何在 Discord ToS/Guideline 明確禁止的行為.")
            .addField("3.", "除非您以正規的方式獲取 Kristen v6 的源代碼, 否則您不得重製, 改作, 散佈, 再許可 Kristen v6.")
            .addField("4.", "在您使用本服務時的特定功能, 您同意本服務收集您的\n(1) Discord 相關**公開**資料 (頭像, 名稱)\n(2) 使用服務時的設置\n(3) 使用服務的時段/詳細資料 (如聆聽) 等行為紀錄.")
            .addField("5.", "不管是無意或有意, 您不得惡意性質的濫用本服務, 否則提供者將可以在不通知的情況下終結對您的服務.")
            .addField("6.", "在您開始使用本服務時及即同意本規範之內容, 不得以不知悉, 不同意等理由拒絕遵守該規範, 倘若您不同意/不再使用該服務, 請將該機器人踢出您的 Discord 群組.")
            .addField("7.", bot.user.tag.includes("Kristen") ? "本服務之提供者 NCT skyouo#3144, 保留任何法律權利." : "本服務之提供者, 保留任何法律權利.")
            .addField("8.", "本服務無權更改您伺服器相關之設定, 且**__包括但不限於__** 炸群, 修改伺服器頻道/類別名稱, 修改伺服器身份組權限, 倘若您發現本服務有相關情形, 請通知 " + bot.users.cache.get(bot.config.ownerid).tag + ".")
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
    })
  }
}
