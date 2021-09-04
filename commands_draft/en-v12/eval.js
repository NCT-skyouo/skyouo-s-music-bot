const { inspect } = require('util')

module.exports = {
  name: 'eval',
  category: 'utility',
  description: '[Developer] Run JS code on runtime',
  aliases: [],
  run: async (bot, msg, args) => {
    if (msg.author.id !== bot.config.ownerid) return
    let evaled
    try {
      evaled = await eval(args.join(' '))
      msg.channel.send('```' + inspect(evaled) + '```')
    } catch (error) {
      msg.channel.send('```' + error.stack + '```')
    }
  }
}
