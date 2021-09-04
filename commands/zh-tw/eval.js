// v13

const { inspect } = require('util')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'eval',
  category: 'sysadmin',
  description: '[Developer] 運行 JS 代碼',
  aliases: [],
  slash: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('[Developer] 運行 JS 代碼.')
    .addStringOption(option => option.setName('代碼').setDescription('要運行的代碼.').setRequired(true)),
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
