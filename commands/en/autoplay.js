// v13

module.exports = {
    name: 'autoplay',
    category: 'music',
    description: 'When the queue ends, the bot will automatically plays related music',
    aliases: ['ap', 'autop', 'aplay'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
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
            var autoplay = await player.autoplay(msg.guild.id)
            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle('🎶 Successfully ' + (autoplay ? "enabled" : "disabled") + 'autoplay mode', msg.guild.iconURL())
                    .setColor('FFE023')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
        } catch (e) {
            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle('❌ Failed', msg.guild.iconURL())
                    .setColor('FF2323')
                    .addField('Error', '```' + e.toString() + '```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
        }
    }
}
