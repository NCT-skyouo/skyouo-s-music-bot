module.exports = {
    name: 'queue',
    category: 'music',
    description: 'Show the queue\'s infomation',
    aliases: ['q'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config } = bot
        try {
            const isPlaying = await player.isPlaying(msg.guild.id)
            if (!isPlaying) throw new Error('Not playing')
            const queue = await player.getQueue(msg.guild.id)
            let cp = queue.tracks
            const np = queue.playing
            if (!np && cp.length <= 0) throw new Error('Not playing')
            let page = parseInt(args[0])
            if (isNaN(page) || page < 2) {
                page = 0
            } else {
                page = page - 1
            }
            if (page !== 0) cp = cp.slice(10 * page)
            if (cp.length > 10) cp = cp.slice(0, 10)
            if (cp.length <= 0 && page) {
                return msg.channel.send(
                    new MessageEmbed()
                        .setTitle(`Queue (${cp.length}) | Page (${page})`)
                        .setDescription('Nothing here!')
                        .setColor('FFFE07')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                )
            }
            let embed = new MessageEmbed()
                .setTitle(`Queue (${cp.length}) | Page (${page})`)
                .addField('🎶 Now playing', `🎵 - **${np.name}** | ${np.duration} | Requested by: ${np.requestedBy}`)
                .setColor('FFFE07')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            if (cp.length !== 0) {
                embed = embed.setDescription('```' + cp.map((item, i) => {
                    return `${'🎵 ' + i} - ${item.name} | ${item.duration} | Requested by: ${item.requestedBy}`
                }).join('\n\n') + '```')
            }
            return msg.channel.send(
                embed
            )
        } catch (e) {
            if (e.message !== 'Not playing') bot.botLogger.showErr(e)
            return msg.channel.send(
                new MessageEmbed()
                    .setAuthor('Nothing here!!', msg.guild.iconURL())
                    .setColor('FFEE07')
            )
        }
    }
}
