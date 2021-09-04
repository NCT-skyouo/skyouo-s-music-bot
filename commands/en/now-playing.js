// v13

const { MessageButton, MessageActionRow } = require('discord.js')

var buttons = [
    [
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('⏪ Previous')
            .setCustomId('previous'),
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('⏸️ Pause')
            .setCustomId('pause'),
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('⏩ Skip')
            .setCustomId('skip'),
    ],
    [
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('🔀 Shuffle')
            .setCustomId('shuffle'),
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('▶️\u2005 Resume')
            .setCustomId('resume'),
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('⏹️ Stop')
            .setCustomId('stop'),
    ],
    [
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('🔂 Loop')
            .setCustomId('repeat'),
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('🔁 Queue loop')
            .setCustomId('queuerepeat'),
        new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('🎶 Filters')
            .setCustomId('filters'),
    ],
    [
        new MessageButton()
            .setLabel('\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b')
            .setCustomId('empty1')
            .setStyle('SECONDARY')
            .setDisabled(true),
        new MessageButton()
            .setStyle('DANGER')
            .setLabel('❌ Cancel')
            .setCustomId('end'),
        new MessageButton()
            .setLabel('\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b\u2002\u200b')
            .setCustomId('empty2')
            .setStyle('SECONDARY')
            .setDisabled(true)
    ]
]

function ms2mmss(ms) {
    var minutes = Math.floor(ms / 60000)
    var seconds = ((ms % 60000) / 1000).toFixed(0)
    minutes = (minutes < 10 ? '0' : '') + minutes
    seconds = (seconds < 10 ? '0' : '') + seconds
    return minutes + ':' + seconds
}

module.exports = {
    name: 'now-playing',
    category: 'music',
    description: 'Shows the information of the current playing song',
    aliases: ['np'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config } = bot
        try {
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

            const queue = await player.getQueue(msg.guild.id)

            // Stream time of the dispatcher
            const currentStreamTime = queue.resource
                ? queue.resource.playbackDuration + queue.additionalStreamTime
                : 0
            // Total stream time
            // const total = queue.playing.ms()

            var rows = [new MessageActionRow(), new MessageActionRow(), new MessageActionRow(), new MessageActionRow()]

            for (let i = 0; i < buttons.length; i++) rows[i] = rows[i].addComponents(buttons[i])

            var message = await msg.channel.send({
                embeds: [new MessageEmbed()
                    .setAuthor('🎶 目前播放: ' + np.name, msg.guild.iconURL())
                    .setURL(np.url)
                    .setColor('FFEE07')
                    .setDescription('```css\n' + ms2mmss(currentStreamTime) + '/' + np.duration + ' | ' + player.createProgressBar(msg.guild.id) + '```')
                    .setFooter(config.footer)],
                components: rows
            })

            const collector = message.createMessageComponentCollector({ filter: button => button.user.id === msg.author.id, max: 1, time: 30000, errors: ['time'] })

            collector.on('collect', async (button) => {
                switch (button.customId) {
                    case 'end':
                        collector.stop();
                        break;
                    default:
                        bot.commands.get(button.customId)[msg.author.language].run(bot, msg, args)
                        break;
                }
            })

            collector.on('end', async () => {
                await message.delete()
            })

        } catch (e) {
            return msg.channel.send({
                embeds:
                    [
                        new bot.MessageEmbed()
                            .setTitle('❌ Failed', msg.guild.iconURL())
                            .setColor('FF2323')
                            .addField('Error', '```' + e.toString() + '```')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
            })
        }
    }
}
