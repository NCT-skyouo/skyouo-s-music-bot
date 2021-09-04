function ms(duration) {
    const args = duration.split(':')
    if (args.length === 3) {
        return parseInt(args[0]) * 60 * 60 * 1000 +
            parseInt(args[1]) * 60 * 1000 +
            parseInt(args[2]) * 1000
    } else if (args.length === 2) {
        return parseInt(args[0]) * 60 * 1000 +
            parseInt(args[1]) * 1000
    } else {
        return parseInt(args[0]) * 1000
    }
}
function ms2mmss(ms) {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

module.exports = {
    name: 'getlist',
    category: 'list',
    description: 'Get the playlist info by name',
    aliases: ['getls', 'gls'],
    run: async (bot, msg, args) => {
        const { config, MessageEmbed, sdb } = bot
        if (!args[0]) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('Invalid usage')
                    .setColor('RANDOM')
                    .addField('Usage', '```' + msg.guild.prefix + 'getlist [playlist name]```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
        const all = await sdb.all()
        const list = []
        for (const key in all) {
            const tmp = all[key]
            const obj2 = {}
            obj2.key = key
            obj2.list = tmp
            list.push(obj2)
        }
        const userlist = list.filter(list => list.key === msg.author.id + '-' + args[0])
        if (userlist.length === 0) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('❌ Playlist not found!')
                    .setColor('RANDOM')
                    .setFooter(`${msg.guild.prefix}export [playlist name] to add a playlist!`)
            )
        } else {
            const durs = userlist[0].list.map(l => ms(l.duration))
            const duration = durs.reduce((a, b) => a + b)
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle(`Your playlist (${userlist[0].key.split('-').slice(1).join('-')})`)
                    .setDescription(userlist[0].list.map(l => `[${l.name}](${l.url}) - ${l.duration}`).join('\n') + '\n\n**Total ' + ms2mmss(duration) + '**')
                    .setColor('RANDOM')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
