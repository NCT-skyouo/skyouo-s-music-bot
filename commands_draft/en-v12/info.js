module.exports = {
  name: 'info',
  category: 'utility',
  description: 'Author\'s info (and credit)',
  aliases: ['credit'],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    const { config, MessageEmbed } = bot
    return msg.channel.send(
      new MessageEmbed()
        .setTitle('Kristen v6, an alternative of Rythm and Groovy.')
        .setColor('FF2323')
        /*
        .addFields(
          { name: '為什麼叫 v5?', value: "其實該架構的全名叫做: 'skyouo0727 的非多功能混和音樂架構 v5' \n因為是第 5 個對內開源版本, 所以稱作 v5" },
          { name: '對內開源?', value: '既往的音樂架構皆為向__訂閱者__開放源代碼和測試,\n 所以稱作對內開源\n之後會對外開源' }
        )
        .addFields(
          { name: '會用什麼開源許可證?', value: '[Unlicense](https://unlicense.org) ' },
          { name: '你爲此付出了什麼?', value: '一堆時間.' },
          { name: "是否還會在更新下去", value: "是的, 我仍舊會維護 v5, 直到明年 1 月" }
        )
        */
        .addField('Special thanks to', 'NCT skyouo#3144 (599923291968241666) - Owner of Kristen\nTEA#7331 (582018951903707136) - Translator (English)')
        .setFooter(config.footer, bot.user.displayAvatarURL())
    )
  }
}
