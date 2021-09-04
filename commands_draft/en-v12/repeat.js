module.exports = {
    name: 'repeat',
    category: 'music',
    description: 'Toggle loop mode',
    aliases: ['loop', 'lp'],
    run: async (bot, msg, args) => {
        const { player, config, MessageEmbed, isDJPerm } = bot
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
        const repeatModeEnabled = player.getQueue(msg.guild.id).repeatMode
        if (repeatModeEnabled) {
            player.setRepeatMode(msg.guild.id, false)
            msg.channel.send(
                new MessageEmbed()
                    .setTitle('Loop disabled!!')
                    .setColor('FF0523')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        } else {
            player.setRepeatMode(msg.guild.id, true)
            msg.channel.send(
                new MessageEmbed()
                    .setTitle('Loop enabled!!')
                    .setColor('FFE023')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
