// v13

const { MessageSelectMenu: MessageMenu, MessageActionRow } = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'search',
    category: 'music',
    description: 'Searches for a song with the given query and returns the top 10 results',
    aliases: ['youtube', 'find'],
    slash: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Searches for a song with the given query and retuns the top 10 results')
        .addStringOption(option => option.setName('query').setDescription('The song you want to search.').setRequired(true)),
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, db, config, isDJPerm, MessageMenuOption } = bot
        try {
            if (!args[0]) {
                throw new Error(`Invalid usage!\nUsage: ${msg.guild.prefix}search (query)`)
            } else if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('Nothing playing in the server!') }
            if (!msg.member.voice.channel) {
                throw new Error('You need to connect to a voice channel to use this command!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
            }
            const gconf = await db.get(msg.guild.id)

            if (gconf.djonly.enable && !await isDJPerm({})) {
                throw new Error('The owner of the server has enabled DJ only mode!\n')
            }
            let res = await player.searchTracks(args.join(' '), true, true)
            res = res.slice(0, 10)

            const menu = new MessageMenu()
                .setCustomId('search-response')
                .setPlaceholder('Please choose a number between 1 and ' + res.length + ' to make a choice')
                .setMaxValues(res.length)
                .setMinValues(1)

            for (var i in res) {
                let i2 = Number(i) + 1
                let option = new MessageMenuOption()
                    .setLabel(String(i2))
                    .setEmoji('🎶')
                    .setValue(String(i2))
                    .setDescription(res[i].name.slice(0, 50))

                menu.addOptions([option])
            }

            const embed = new bot.MessageEmbed()
                .setTitle('👇 Use the menu below to select the song you want to play')
                .setColor('FFE007')
                .setFooter(config.footer, bot.user.displayAvatarURL())

            msg.channel.send({
                embeds: [embed],
                components: [new MessageActionRow().addComponents(menu)]
            }).then(async m => {
                let collector = m.createMessageComponentCollector({ filter: menu => menu.user.id === msg.author.id, max: 1, time: 30000, errors: ['time'] })
                collector.on('collect', async (menu) => {
                    if (menu.customId !== 'search-response') return;
                    let reses = []
                    menu.values.forEach(SIndex => {
                        reses.push(res[parseInt(SIndex) - 1])
                    })
                    bot.commands.get('play')[msg.author.language].run(bot, msg, reses)
                    try {
                        await menu.deferUpdate(true);
                    } catch (e) {

                    }
                    collector.stop()
                })

                collector.on('end', () => m.delete())
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
