module.exports = {
    name: 'seek',
    category: 'music',
    description: 'Skips to the specified time',
    aliases: ['goto'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('Nothing playing in the server!') }
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
        player.seek(msg.guild.id, args[0])
            .then(async () => {
                const np = await player.nowPlaying(msg.guild.id)
                msg.channel.send(
                    new MessageEmbed()
                        .setAuthor('Success', msg.guild.iconURL())
                        .setColor('FFEE07')
                        .setDescription('```' + args[0] + '/' + np.duration + '\n\n\n' + player.createProgressBar(msg.guild.id) + '```')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                )
            })
            .catch((e) => {
                msg.channel.send(e.toString())
            })
    }
}
