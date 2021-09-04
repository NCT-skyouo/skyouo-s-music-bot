module.exports = {
    name: 'jump',
    category: 'music',
    description: 'Skip to specified tracks by order',
    aliases: ['j', 'skipto'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        try {
            const queue = await player.getQueue(msg.guild.id)
            if (!queue.playing || !player.isPlaying) throw new Error('Nothing playing in the server!')
            if (!msg.member.voice.channel) {
                throw new Error('You have to connect to a voice channel to use this command!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
            }
            const np = await bot.player.nowPlaying(msg.guild.id)
            if (!await bot.isDJPerm(np)) throw new Error('You don\'t have permission to use this command!')
            if (!args[0]) throw new Error("Missing argument: <track number>")
            player.jump(msg.guild.id, Number(args[0]) - 1).then(() => {
                return msg.channel.send(
                    new MessageEmbed()
                        .setTitle('🎶 Successfully skipped to ' + args[0], msg.guild.iconURL())
                        .setColor('FFE023')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                )
            }).catch(e => { throw e })
        } catch (e) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('❌ Failed', msg.guild.iconURL())
                    .setColor('FF2323')
                    .addField('Error', '```' + e.toString() + '```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
