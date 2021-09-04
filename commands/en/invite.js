// v13

module.exports = {
    name: 'invite',
    category: 'utility',
    description: 'Get an invite for the bot or to the support server!',
    aliases: [],
    run: async (bot, msg, args) => {
        // 如果不想顯示該指令 請刪掉該檔案 owo
        const { config, MessageEmbed } = bot
        return msg.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle('Invite me to your server!')
                    .setColor('FF2323')
                    .setDescription('Here is my invite link and support server link, wish this helps you!')
                    .addField('Invite link', '[Click here](https://discord.com/api/oauth2/authorize?client_id=' + bot.user.id + '&permissions=24117392&scope=bot%20applications.commands)')
                    .addField('Support server link', '[Click here](' + bot.config.offical_server + ')')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
    }
}
