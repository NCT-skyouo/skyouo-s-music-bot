// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'queue',
    category: 'music',
    description: 'Views the queue of the server',
    aliases: ['q'],
    slash: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Views the queue of the server')
        .addIntegerOption(option => option.setName('page').setDescription('The page of the queue you would like to view.')),
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
                page--
            }
            if (page !== 0) cp = cp.slice(10 * page)
            if (cp.length > 10) cp = cp.slice(0, 10)
            if (cp.length <= 0 && page) {
                return msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`🎫 Queue (${cp.length}) | Page (${page})`)
                            .setDescription('這頁沒東西!')
                            .setColor('FFFE07')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
                })
            }
            let embed = new MessageEmbed()
                .setTitle(`🎫 Queue (${cp.length}) | Page (${page})`)
                .addField('🎶 Now playing', `🎵 - **${np.name}** | ${np.duration} | Requested by: ${np.requestedBy}`)
                .setColor('FFFE07')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            if (cp.length !== 0) {
                embed = embed.setDescription('```' + cp.map((item, i) => {
                    return `${'🎵 ' + i} - ${item.name} | ${item.duration} | Requested by: ${item.requestedBy}`
                }).join('\n\n') + '```')
            }
            return msg.channel.send({
                embeds: [
                    embed
                ]
            })
        } catch (e) {
            if (e.message !== 'Not playing') bot.botLogger.showErr(e)
            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor('❌ Nothing in the queue!!', msg.guild.iconURL())
                        .setColor('FFEE07')
                ]
            })
        }
    }
}
