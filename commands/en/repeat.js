module.exports = {
    name: 'repeat',
    category: 'music',
    description: 'Toggles looping the current playing track',
    aliases: ['loop', 'lp'],
    run: async (bot, msg, args) => {
        const { player, config, MessageEmbed, isDJPerm } = bot
        try {
            if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('Nothing playing in the server!') }
            if (!msg.member.voice.channel) {
                throw new Error('You need to connect to a voice channel to use this command!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
            }
            const np = await bot.player.nowPlaying(msg.guild.id)
            if (!await bot.isDJPerm(np)) throw new Error('You don\'t have permission to use this command!!')
            const repeatModeEnabled = player.getQueue(msg.guild.id).repeatMode
            if (repeatModeEnabled) {
                player.setRepeatMode(msg.guild.id, false)
                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('🔂 Loop has enabled!!')
                            .setColor('FF0523')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
                })
            } else {
                player.setRepeatMode(msg.guild.id, true)
                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('🔂 Loop has disabled!!')
                            .setColor('FFE023')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
                })
            }
        } catch (e) {
            return msg.channel.send({
                embeds:
                    [
                        new bot.MessageEmbed()
                            .setTitle('❌ Failed', msg.guild.iconURL())
                            .setColor('FF2323')
                            .addField('Error', '```' + e.toString() + '```')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
            })
        }
    }
}
