module.exports = {
    name: 'metal',
    category: 'filter',
    description: '[Premium] Toggle metal audio filter',
    aliases: [],
    premium: true,
    run: async (bot, msg, args) => {
        try {
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
            const metalEnabled = await bot.player.getQueue(msg.guild.id).filters.metal
            bot.player.setFilters(msg.guild.id, {
                metal: !metalEnabled
            })
            return msg.channel.send(
                new bot.MessageEmbed()
                    .setTitle('🎶 Successfully ' + (!metalEnabled ? 'enabled' : 'disabled') + ' metal effect', msg.guild.iconURL())
                    .setColor('FFE023')
                    .setFooter(bot.config.footer, bot.user.displayAvatarURL()
                    )
            )
        } catch (e) {
            return msg.channel.send(
                new bot.MessageEmbed()
                    .setTitle('❌ Failed', msg.guild.iconURL())
                    .setColor('FF2323')
                    .addField('Error', '```' + e.toString() + '```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
