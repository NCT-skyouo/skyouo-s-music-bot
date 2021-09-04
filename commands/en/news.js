// v13

function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * offset));
    return nd
}


var Discord = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'news',
    category: 'utility',
    description: '[Mandarin Only] View news.',
    aliases: [],
    slash: new SlashCommandBuilder()
        .setName('news')
        .setDescription('觀看新聞.')
        .addStringOption(option => option.setName('新聞編號').setDescription('想播放的新聞的編號 (可選).')),
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Message} msg
     * @param {Discord.Message[]} args
     */
    run: async (bot, msg, args) => {
        return msg.channel.send(':x: **Sorry, the command hasn\'t been translated yet!**')
    }
}