const { MessageButton, MessageActionRow } = require('discord-buttons')

var buttons = [
  [
    new MessageButton()
      .setStyle('blurple')
      .setLabel('⏪ Previous song')
      .setID('previous'),
    new MessageButton()
      .setStyle('blurple')
      .setLabel('⏸️ Pause player')
      .setID('pause'),
    new MessageButton()
      .setStyle('blurple')
      .setLabel('⏩ Skipping Song')
      .setID('skip'),
  ],
  [
    new MessageButton()
      .setStyle('blurple')
      .setLabel('🔀 Shuffle mode')
      .setID('shuffle'),
    new MessageButton()
      .setStyle('blurple')
      .setLabel('▶️\u2005 Resume player')
      .setID('resume'),
    new MessageButton()
      .setStyle('blurple')
      .setLabel('⏹️ Stop playing')
      .setID('stop'),
  ],
  [
    new MessageButton()
      .setStyle('blurple')
      .setLabel('🔂 Repeat Mode')
      .setID('repeat'),
    new MessageButton()
      .setStyle('blurple')
      .setLabel('🔁 Queue loop')
      .setID('queuerepeat'),
    new MessageButton()
      .setStyle('blurple')
      .setLabel('🎶 Filters Control')
      .setID('filters'),
  ],
  [
    new MessageButton()
      .setLabel('\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2002\u200b')
      .setID('empty')
      .setStyle('gray')
      .setDisabled(),
    new MessageButton()
      .setStyle('red')
      .setLabel('❌ Close menu')
      .setID('end'),
    new MessageButton()
      .setLabel('\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2002\u200b')
      .setID('empty')
      .setStyle('gray')
      .setDisabled()
  ]
]

module.exports = {
    name: 'now-playing',
    category: 'music',
    description: 'Show the infomation of currently playing track',
    aliases: ['np'],
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config } = bot
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

            const np = await player.nowPlaying(msg.guild.id)

            const queue = await player.getQueue(msg.guild.id)

            function ms2mmss(ms) {
                const minutes = Math.floor(ms / 60000)
                const seconds = ((ms % 60000) / 1000).toFixed(0)
                return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
            }
            // Stream time of the dispatcher
            const currentStreamTime = queue.voiceConnection.dispatcher
                ? queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime
                : 0
            // Total stream time
            // const total = queue.playing.ms()
            var rows = [new MessageActionRow(), new MessageActionRow(), new MessageActionRow(), new MessageActionRow()]

            for (let i = 0; i < buttons.length; i++) rows[i] = rows[i].addComponents(...buttons[i])

            var message = await msg.channel.send(
                new MessageEmbed()
                    .setAuthor('🎶 Now playing: ' + np.name, msg.guild.iconURL())
                    .setURL(np.url)
                    .setColor('FFEE07')
                    .setDescription('```css\n' + ms2mmss(currentStreamTime) + '/' + np.duration + '\n\n\n' + player.createProgressBar(msg.guild.id) + '```')
                    .setFooter(config.footer),
                { components: rows }
            )

            const collector = message.createButtonCollector(button => button.clicker.user.id === msg.author.id, { max: 1, time: 30000, errors: ['time'] })

            collector.on('collect', async (button) => {
                switch (button.id) {
                    case 'end':
                        collector.stop();
                        break;
                    default:
                        bot.commands.get(button.id)[msg.author.language].run(bot, msg, args)
                        break;
                }
            })

            collector.on('end', async () => {
                await message.delete()
            })

        } catch (e) {
            bot.botLogger.showErr(e)
        }
    }
}
