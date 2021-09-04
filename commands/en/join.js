// v13

module.exports = {
    name: 'join',
    category: 'music',
    description: 'Let bot join channel you in',
    aliases: ['j', 'come-in', 'come'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, gdb, isDJPerm } = bot
        try {
            if (player.isPlaying(msg.guild.id)) { throw new Error('Someone else is using the bot in different channel!') }
            if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('Nothing playing in the server!') }
            if (!msg.member.voice.channel) {
                throw new Error('You need to connect to a voice channel to use this command!')
            }

            if (gdb.blacklist.enable && gdb.blacklist.channels.includes(msg.member.voice.channel.id) && !await isDJPerm({})) {
                throw new Error('This channel is in blacklist!')
            }
            await player._join(msg.member.voice.channel);
            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('🎶 Successfully joined', msg.guild.iconURL())
                        .setColor('FFE023')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
        } catch (e) {
            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('❌ Failed', msg.guild.iconURL())
                        .setColor('FF2323')
                        .addField('Error', '```' + e.toString() + '```')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
        }
    }
}
