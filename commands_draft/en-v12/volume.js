module.exports = {
    name: 'volume',
    category: 'music',
    description: 'Adjust the volume of the player',
    aliases: ['vol'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
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
            if (!args[0]) { throw new Error(`Invalid usage!\nUsage: ${msg.guild.prefix}volume (volume)`) }
            if (isNaN(parseInt(args[0]))) throw new Error('Please provide a number between 0 and 200!')
            if (Number(args[0]) > 200 || Number(args[0]) < 0) {
                return msg.channel.send(
                    new MessageEmbed()
                        .setTitle('❌ Error')
                        .setColor('FF2323')
                        .setDescription('Please provide a number between 0 and 200!')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                )
            }
            player.setVolume(msg.guild.id, parseInt(args[0]))
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('🎶 Success', msg.guild.iconURL())
                    .setColor('FFE023')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
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
