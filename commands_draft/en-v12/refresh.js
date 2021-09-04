module.exports = {
    name: 'refresh',
    category: 'admin',
    description: 'Force clear queue\'s data.',
    aliases: ['reload'],
    run: async (bot, msg, args) => {
        const { player, config, MessageEmbed, isDJPerm } = bot
        try {
            if (!player.getQueue(msg.guild.id)) throw new Error('Queue is empty.')
            if (!msg.member.voice.channel) {
                throw new Error('You have to connect to a voice channel to use this command!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
            }
            if (!await isDJPerm({})) throw new Error('You don\'t have permission to use this command!')
            bot.player.queues = bot.player.queues.filter(queue => queue.guildID !== msg.guild.id)
            if (msg.guild.me.voice.channel) msg.guild.me.voice.channel.leave()
            msg.channel.send(
                new MessageEmbed()
                    .setTitle('✅ Queue cleared')
                    .setColor('FF0523')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        } catch (e) {
            msg.channel.send(
                new MessageEmbed()
                    .setTitle('❌ Failed')
                    .setColor('FF4D4D')
                    .addField('Error', '```' + e.toString() + '```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}