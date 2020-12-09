const { inspect } = require('util');

module.exports = {
  name: "eval",
  description: "[Developer] 運行 JS 代碼",
  aliases: [],
  run: async (bot, msg, args) => {
    if (msg.author.id !== bot.config.ownerid) return;
    let evaled;
    try {
      evaled = await eval(args.join(' '));
      msg.channel.send('```'+ inspect(evaled) + '```');
    }
    catch (error) {
      msg.channel.send('```'+ error.stack +'```');
    }
  }
}