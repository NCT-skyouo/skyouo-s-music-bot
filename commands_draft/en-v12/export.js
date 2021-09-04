module.exports = {
    name: 'export',
    category: 'list',
    description: 'Creating playlist by using tracks in the queue',
    aliases: ['ept', 'expt'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, sdb } = bot
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
            if (!args[0]) {
                throw new Error(`Invalid usage!\nUsage: ${msg.guild.prefix}export [playlist name]`)
            }
            var res = await sdb.get(`${msg.author.id}-${args.join(" ")}`)
            if (res) {
                throw new Error('The playlist already exists!\nIf you want to override exists playlist ' + msg.guild.prefix + 'forceExp [playlist name]')
            }
            const q = await player.getQueue(msg.guild.id)
            const allInfo = q.tracks.map(t => t.getAllInfoForList()) || []
            allInfo.unshift(q.playing.getAllInfoForList())
            await sdb.set(`${msg.author.id}-${args.join(" ")}`, allInfo)
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('⭕ Successfully exported!')
                    .setColor('FFEE07')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        } catch (e) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('❌ Failed to export', msg.guild.iconURL())
                    .setColor('FF2323')
                    .addField('Error', '```' + e.toString() + '```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}
