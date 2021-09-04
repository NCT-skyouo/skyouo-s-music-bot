function ms2mmss(ms) {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'rewind',
    category: 'music',
    description: 'Rewinds by a certain amount of time in the current track',
    aliases: ['rw'],
    slash: new SlashCommandBuilder()
        .setName('rewind')
        .setDescription('Rewinds by a certain amount of time in the current track.')
        .addIntegerOption(option => option.setName('amount').setDescription('The amount to rewind').setRequired(true)),
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('Nothing playing in the server!') }
        if (!msg.member.voice.channel) {
            throw new Error('You need to connect to a voice channel to use this command!')
        } else if (
            msg.member.voice.channel &&
            msg.guild.me.voice.channel &&
            msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
        ) {
            throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
        }
        const np = await bot.player.nowPlaying(msg.guild.id)
        if (!await bot.isDJPerm(np)) throw new Error('You don\'t have permission to use this command!!')
        player
            .rewind(msg.guild.id, isNaN(parseInt(args[0])) ? 0 : parseInt(args[0]))
            .then(async () => {
                const np = await player.nowPlaying(msg.guild.id)
                msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setAuthor('🎶 Successfully', msg.guild.iconURL())
                            .setColor('FFEE07')
                            .setDescription('```' + ms2mmss(player.getQueue(msg.guild.id).additionalStreamTime) + '/' + np.duration + '\n\n\n' + player.createProgressBar(msg.guild.id) + '```')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
                })
            })
            .catch((e) => {
                return msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('❌ Failed', msg.guild.iconURL())
                            .setColor('FF2323')
                            .addField('Error', '```' + e.toString() + '```')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
                })
            })
    }
}
