module.exports = {
    name: 'party',
    category: 'filter',
    description: 'Toggle party mode',
    aliases: [],
    premium: true,
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
            var np = await bot.player.nowPlaying(msg.guild.id)

            if (!await bot.isDJPerm(np)) throw new Error('You don\'t have permission to use this command!')

            let queue = player.getQueue(msg.guild.id);

            if (queue.party) {
                player._eval('this.getQueue("' + msg.guild.id + '").modify("party", false)');

                return msg.channel.send(
                    new MessageEmbed()
                    .setTitle('🎶 Successfully disable party mode!', msg.guild.iconURL())
                    .setColor('FFE023')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
                )
            } else {
                player._eval('this.getQueue("' + msg.guild.id + '").modify("party", true)');

                return msg.channel.send(
                    new MessageEmbed()
                    .setTitle('🎶 Successfully enabled party mode, it will be added to the next song!', msg.guild.iconURL())
                    .setColor('FFE023')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
                )
            }
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
