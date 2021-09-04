// v13

const { inspect } = require('util')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'eval',
    category: 'sysadmin',
    description: '[Developer] Eval JS code',
    aliases: [],
    slash: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('[Developer] Eval JS code')
        .addStringOption(option => option.setName('code').setDescription('code to eval').setRequired(true)),
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
