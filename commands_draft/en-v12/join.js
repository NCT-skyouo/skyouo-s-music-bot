module.exports = {
    name: 'join',
    category: 'music',
    description: 'Let bot join the voice channel',
    aliases: ['j', 'come-in', 'come'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        try {
            if (player.isPlaying(msg.guild.id)) { throw new Error('Someone is currently using!') }
            if (!msg.member.voice.channel) {
                throw new Error('You have to connect to a voice channel to use this command!')
            }
            msg.member.voice.channel.join()
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('🎶 Successfully joined', msg.guild.iconURL())
                    .setColor('FFE023')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        } catch (e) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('❌ Unable to join', msg.guild.iconURL())
                    .setColor('FF2323')
                    .addField('Error', '```' + e.toString() + '```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
