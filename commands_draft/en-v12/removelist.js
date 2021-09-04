module.exports = {
    name: 'removelist',
    category: 'list',
    description: 'Remove playlist that you created',
    aliases: ['rmlist', 'rmls', 'rls'],
    run: async (bot, msg, args) => {
        const { config, MessageEmbed, sdb } = bot
        if (!args[0]) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('Invalid usage')
                    .setColor('RANDOM')
                    .addField('Usage', '```' + msg.guild.prefix + 'removelist [playlist name]```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
        const all = await sdb.all()
        const list = []
        for (const key in all) {
            const tmp = all[key]
            all[key] = {}
            all[key].key = key
            all[key].list = tmp
            list.push(all[key])
        }
        const userlist = list.filter(list => list.key === msg.author.id + '-' + args[0])
        if (userlist.length === 0) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('❌ Playlist not found!')
                    .setColor('RANDOM')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        } else {
            sdb.remove(msg.author.id + '-' + args[0])
            msg.channel.send(
                new MessageEmbed()
                    .setTitle(`Successfully removed ${args[0]}`)
                    .setColor('RANDOM')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
