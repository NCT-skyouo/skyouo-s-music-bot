// v13

module.exports = {
    name: 'disconnect',
    category: 'music',
    description: 'Disconnects the bot from the voice channel it is in and clears the queue',
    aliases: ['leave', 'fuckoff', 'left', 'stfu'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        try {
            // if (player.isPlaying(msg.guild.id)) { throw new Error('目前仍有正在播放的歌曲!') }
            if (!msg.guild.me.voice.channel) {
                throw new Error('I am not connected to a voice channel!')
            }

            // const np = await player.nowPlaying(msg.guild.id)
            if (!await isDJPerm({})) throw new Error('You don\'t have permission to use this command!!')

            if (player.isPlaying(msg.guild.id)) await player.stop(msg.guild.id)
            else await msg.guild.me.voice.disconnect()

            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('🎶 Successfully disconnected', msg.guild.iconURL())
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
