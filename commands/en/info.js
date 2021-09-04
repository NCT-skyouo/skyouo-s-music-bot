// v13

module.exports = {
    name: 'info',
    category: 'utility',
    description: 'Author\'s words',
    aliases: [],
    run: async (bot, msg, args) => {
        // 如果不想顯示該指令 請刪掉該檔案 owo
        const { config, MessageEmbed } = bot
        return msg.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle('v6 bot, Your daily great partner')
                    .setColor('FF2323')
                    .addField('Special thanks to', 'NCT skyouo#3144 (599923291968241666) - Author of Kristen, better-storing, mojim-crawler\nTEA#7331 (582018951903707136) - Translator (English)')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
    }
}
