// v13

module.exports = {
  name: 'tos',
  category: 'utility',
  description: '[Mandarin Only] Terms Of Services',
  aliases: [],
  run: async (bot, msg, args) => {
    // 如果不想顯示該指令 請刪掉該檔案 owo
    return msg.channel.send(':x: **Sorry, the command hasn\'t been translated yet!**')
  }
}
