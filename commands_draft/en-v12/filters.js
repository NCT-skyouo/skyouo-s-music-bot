const { MessageMenu, MessageMenuOption } = require('discord-buttons')

module.exports = {
    name: 'filters',
    category: 'filter',
    description: '[Premium] Choose the audio filter that you want',
    aliases: [],
    premium: true,
    run: async (bot, msg, args) => {
        try {
          console.log('0')
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
            const np = await bot.player.nowPlaying(msg.guild.id)
            if (!await bot.isDJPerm(np)) throw new Error('You don\'t have permission to use this command!')
            let active_filters = ["nightcore", "bass", "karaoke", "subboost", "8d", "vaporwave", "shadow", "echo", "mountain_echo", "metal"]

            console.log('1')

            var embed =
                new bot.MessageEmbed()
                    .setTitle("👇 Use the menu below to select filters")
                    .setColor("RANDOM")
                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())

            const menu = new MessageMenu()
                .setID('filter-response')
                .setPlaceholder('Select the filters you want to add/remove!')
                .setMaxValues(3)
                .setMinValues(1)

            console.log('2')

            let no_option = new MessageMenuOption()
                .setLabel('Cancel')
                .setEmoji('❌')
                .setValue('no')
                .setDescription('No thanks (Just testing)')

            menu.addOption(no_option)

            console.log('3')

            for (var i in active_filters) {
                let i2 = Number(i) + 1
                let option = new MessageMenuOption()
                    .setLabel("Filters " + String(i2))
                    .setEmoji('🎶')
                    .setValue(String(i2))
                    .setDescription(active_filters[i] + ' filters')

                menu.addOption(option)
            }

            console.log('4')

            console.log(menu)

            msg.channel.send(embed, menu).then(m => {
                console.log('5')
                let collector = m.createMenuCollector(menu => menu.clicker.user.id === msg.author.id, { max: 1, time: 30000, errors: ['time'] })
                collector.on('collect', (menu) => {
                    if (menu.id !== 'filter-response') return;
                    let reses = []
                    let no = false
                    menu.values.forEach(SIndex => {
                        if (SIndex === 'no') no = true
                        reses.push(active_filters[parseInt(SIndex) - 1])
                    })

                    if (no) {
                        // Yep, Do nothin'
                    } else {
                        reses.forEach(r => bot.commands.get(r)[msg.author.language].run(bot, msg, args))
                    }

                    menu.reply?.defer(true);
                    collector.stop()
                })

                collector.on('end', () => m.delete())
            }).catch(e => {
              throw e
            })

        } catch (e) {
            return msg.channel.send(
                new bot.MessageEmbed()
                    .setTitle('❌ Failed', msg.guild.iconURL())
                    .setColor('FF2323')
                    .addField('Error', '```' + e.toString() + '```')
                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())
            )
        }
    }
}