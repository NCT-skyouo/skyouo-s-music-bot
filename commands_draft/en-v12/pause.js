module.exports = {
    name: 'pause',
    category: 'music',
    description: 'Pause the player',
    aliases: ['ps'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        try {
            const queue = await player.getQueue(msg.guild.id)
            if (!queue.playing || !player.isPlaying) { throw new Error('Nothing playing in the server!') }
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
            player.pause(msg.guild.id)
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('🎶 成功暫停播放', msg.guild.iconURL())
                    .setColor('FFE023')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        } catch (e) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('❌ 無法暫停播放', msg.guild.iconURL())
                    .setColor('FF2323')
                    .addField('錯誤訊息', '```' + e.toString() + '```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
