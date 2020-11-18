module.exports = {
  name: 'info',
  description: '作者的話',
  aliases: [],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    const { config, MessageEmbed } = bot
    return msg.channel.send(
      new MessageEmbed()
        .setTitle('v5 機器人, 您日常的好夥計')
        .setColor('FF2323')
        .addFields(
          { name: '為什麼叫 v5?', value: "其實該架構的全名叫做: 'skyouo0727 的非多功能混和音樂架構 v5' \n因為是第 5 個對內開源版本, 所以稱作 v5" },
          { name: '對內開源?', value: '既往的音樂架構皆為向__訂閱者__開放源代碼和測試,\n 所以稱作對內開源\n之後會對外開源' }
        )
        .addFields(
          { name: '會用什麼開源許可證?', value: '[Unlicense](https://unlicense.org) ' },
          { name: '你爲此付出了什麼?', value: '一堆時間.' },
          { name: "是否還會在更新下去", value: "是的, 我仍舊會維護 v5, 直到明年 1 月" }
        )
        .addField('銘謝名單', 'Patreon#4935 - v4, v4.5 開發者\nzheng8788#4893 - v3 v3.5 v4 v4.5 v5 自願測試者, Bug 獵人(7)\ngohchengxian#7445 - v5 自願測試者, Bug 獵人(2)\nRICE.#5161 - v4.5 v5 自願測試者 (其實不太算xdd)\nziblock214#4132 - v5 自願測試者\n[Androz2091](https://github.com/Androz2091) - discord-player 原作者\nNCT skyouo#4092 - 專案主要維護者, json-db, mojim-crawler 作者')
        .setFooter(config.footer, bot.user.displayAvatarURL())
    )
  }
}
