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
            .setTitle('v5 機器人 | 服務守則')
            .setColor('FF2323')
            .setDescription("以下代指本服務稱 Kristen v5\n您為 服務使用者\n公眾為 多數人與非特定人, 為了保障您的權益, 請詳讀")
            .addField("法律規範", "為了遵守中華民國著作權法 '合理使用' 之第 55 條,\n您不得將該機器人所公開播送之部分用於商業用途,\n使用時仍需遵守中華民國著作權法 '合理使用' 部分.\n高級版啟用後即代表該機器人所重製的音樂符合中華民國著作權法 '合理使用' 之第 51 條.\n若您並非居住在中華民國法定領土, 上述守則仍有效.")
            .addField("Discord 規範", "在您不得使用本服務做出任何在 Discord ToS 明確禁止的行為")
            .addField("改作 Kristen v6", "除非您以正規的方式獲取 Kristen v6 的源代碼, 否則您不得重製, 改作, 散佈, 再許可 Kristen v6.")
            .addField("Youtube 規範", "在使用本服務聽音樂時, 應為一般**觀看**行為, 下載音樂時本服務不負任何衍生出的法律責任")
            .addField("隱私政策", "在您使用本服務時的特定功能, 您同意本服務收集您的\n(1) Discord 相關**公開**資料 (頭像, 名稱)")
            .addField("濫用規範", "您不得惡意性質的濫用本服務, 不管是無意或有意, 否則提供者將可以在不通知的情況下終結對您的服務.")
            .addField("生效規範", "在您開始使用本服務時及即同意本規範之內容, 不得以不知悉, 不同意等理由拒絕遵守該規範, 倘若您不同意/不再使用該服務, 請將該機器人踢出您的 Discord 群組")
            .addField("權利保留", "本服務之託管者 NCT skyouo#4092, 保留任何法律權利.")
            .addField("無權規範", "本服務無權更改您伺服器相關之設定, 且**__包括但不限於__** 炸群, 修改伺服器頻道/類別名稱, 修改伺服器身份組權限, 倘若您發現本服務有相關情形, 請通知 " + bot.users.cache.get(bot.config.ownerid).tag + ".")
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
    })
  }
}
