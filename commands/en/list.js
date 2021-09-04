// v13

module.exports = {
    name: 'list',
    category: 'list',
    description: 'Lists all of your saved playlists',
    aliases: ['ls'],
    run: async (bot, msg, args) => {
        const { config, MessageEmbed, sdb } = bot
        if (args[0]) return;
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
            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('You don\'t have any saved playlist!')
                        .setColor('RANDOM')
                        .setFooter(`${msg.guild.prefix}export [playlist name] to create a playist!`)
                ]
            })
        } else {
            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`Your playlists (${userlist.length})`)
                        .setDescription(userlist.map(ul => `${ul.key.split('-').slice(1).join('-')} - ${ul.list.length} songs`).join('\n'))
                        .setColor('RANDOM')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
        }
    }
}
