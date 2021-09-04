// v13

module.exports = {
    name: 'dumpsonginfo',
    category: 'sysadmin',
    description: '[Developer] View song information',
    aliases: ['dsi', 'songinfo', 'si'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed } = bot
        if (msg.author.id !== bot.config.ownerid) return
        try {
            if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('Nothing playing in the server!') }
            var np = await bot.player.nowPlaying(msg.guild.id)
            if (!msg.member.voice.channel) {
                throw new Error('You need to connect to a voice channel to use this command!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
            }

            var result = []
            var info = np.getAllInfoForList()
            Object.keys(info).forEach(key => {
                result.push(`${key} - ${info[key]}`)
            })
            // const queue = await player.getQueue(msg.guild.id)

            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle(np.name)
                        .setURL(np.url)
                        .setDescription("```yml\n" + result.join('\n') + "\n```")
                        .setColor("FFEE07")
                        .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                ]
            })
        } catch (err) {
            return msg.channel.send(err.message)
        }
    }
}
