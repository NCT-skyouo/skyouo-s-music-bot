module.exports = {
    name: 'list',
    category: 'list',
    description: 'Get all the playlist that you created',
    aliases: ['ls'],
    run: async (bot, msg, args) => {
        const { config, MessageEmbed, sdb } = bot
        const all = await sdb.all()
        const list = []
        for (const key in all) {
            const tmp = all[key]
            const obj2 = {}
            obj2.key = key
            obj2.list = tmp
            list.push(obj2)
        }
        const userlist = list.filter(list => list.key.startsWith(msg.author.id))
        if (userlist.length === 0) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('You don\'t have any playlist!')
                    .setColor('RANDOM')
                    .setFooter(`${msg.guild.prefix}export [playlist name] to add a playlist!`)
            )
        } else {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle(`Your ${userlist.length > 1 ? 'playlists' : 'playlist'} (${userlist.length})`)
                    .setDescription(userlist.map(ul => `${ul.key.split('-').slice(1).join('-')} - ${ul.list.length} songs`).join('\n'))
                    .setColor('RANDOM')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
