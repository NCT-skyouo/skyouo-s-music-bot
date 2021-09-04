// v13 updated
const ytdl = require('ytdl-core')

const { Message, MessageSelectMenu: MessageMenu, MessageActionRow } = require('discord.js')

function getFirefoxUserAgent() {
    let date = new Date()
    let version = ((date.getFullYear() - 2018) * 4 + Math.floor(date.getMonth() / 4) + 58) + ".0"
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version} Gecko/20100101 Firefox/${version}`
}

const reqOpt = {
    'Accept-Language': "zh-TW, zh;q=0.9, zh-MO;q=0.8, zh-CN;q=0.7, en-US;q=0.6, en-UK;q=0.3",
    'User-Agent': getFirefoxUserAgent()
}

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'play',
    category: 'music',
    description: 'Plays a song with the given query or URL',
    aliases: ['p'],
    slash: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song with given the query or URL')
        .addStringOption(option => option.setName('query').setDescription('Plays a song with the given query or URL').setRequired(true)),
    /**
     * @param {Message} msg
     */
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, gdb, isDJPerm, MessageMenuOption } = bot
        try {
            if (!args[0]) {
                throw new Error(`Invalid usage!\nUsage: ${config.prefix}play (query / URL)`)
            }
            if (!msg.member.voice.channel) {
                throw new Error('You need to connect to a voice channel to use this command!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
            }

            const gconf = gdb

            if (gconf.djonly.enable && !await isDJPerm({})) {
                throw new Error('The owner of the server has enabled DJ only mode!\n')
            }

            if (gdb.blacklist.enable && gdb.blacklist.channels.includes(msg.member.voice.channel.id) && !await isDJPerm({})) {
                throw new Error('This channel is in blacklist!')
            }

            if (!player.isPlaying(msg.guild.id)) {
                const song = await player.play(
                    msg.member.voice.channel,
                    typeof args[0] === 'string' ? args.join(' ') : args,
                    msg.author.tag,
                    msg.channel
                ).catch(e => { throw e });// 播放音樂

                if (!song) throw new Error('No matches')

                if (song.type === 'playlist') {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor('🎶 Now playing', msg.guild.iconURL())
                                .setColor('FFEE23')
                                .setImage(song.tracks[0].thumbnail)
                                .addField(
                                    'Now playing',
                                    `[${song.tracks[0].name}](${song.tracks[0].url})`
                                )
                                .addField('Duration', song.tracks[0].duration)
                                .addField('Requested by', song.tracks[0].requestedBy)
                                .addField('Playlist length', song.tracks.length)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                    })
                } else if (song.type === 'list') {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor('🎶 Now playing', msg.guild.iconURL())
                                .setDescription((song.tracks.length - 1) ? '**x songs has been added to queue...**'.replace('x', song.tracks.length - 1) : '')
                                .setColor('FFEE23')
                                .setImage(song.tracks[0].thumbnail)
                                .addField('Now playing', `[${song.tracks[0].name}](${song.tracks[0].url})`)
                                .addField('Duration', song.tracks[0].duration)
                                .addField('Requested by', song.tracks[0].requestedBy)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                    })
                } else {
                    msg.channel.send({
                        embeds: [new MessageEmbed()
                            .setAuthor('🎶 Now playing', msg.guild.iconURL())
                            .setColor('FFEE23')
                            .setImage(song.thumbnail)
                            .addField('Now playing', `[${song.name}](${song.url})`)
                            .addField('Duration', song.duration)
                            .addField('Requested by', song.requestedBy)
                            .setFooter(config.footer, bot.user.displayAvatarURL())]
                    })
                }

                player
                    .getQueue(msg.guild.id)
                    .on('end', async (t) => {
                        // 結束所有播放時...
                        var embed = new MessageEmbed()
                            .setAuthor('🎶 | Finished playing!', msg.guild.iconURL())
                            .setDescription((t.fromYoutube) ? "**👇 Use the menu below to perform some functions**" : "👋 Thanks for using v6!")
                            .setColor('FF2323')
                            .setFooter(config.footer)

                        embed = t.fromYoutube ? embed : embed.setImage(
                            'https://media.discordapp.net/attachments/774291859648020480/774888000345473044/Shiron.gif')

                        if (!t.fromYoutube) return msg.channel.send({
                            embeds: [embed]
                        });
                        // const video = await YouTube.getVideo(t.url, reqOpt);
                        const video = await ytdl.getInfo(t.url, reqOpt)
                        if (!video.related_videos?.length) return msg.channel.send({ embeds: [embed.setDescription("👋 Thanks for using v6!")] });

                        if (t.queue.autoplay) {
                            args = [video.related_videos[0].id]
                            return bot.commands.get("play")[msg.author.language].run(bot, msg, args)
                        }

                        video.related_videos = video.related_videos.slice(0, 25)

                        const menu = new MessageMenu()
                            .setCustomId('final-play-response')
                            .setPlaceholder('Select the option you want!')
                            .setMaxValues(1)
                            .setMinValues(1)

                        let no_option = new MessageMenuOption()
                            .setLabel('Cancel')
                            .setEmoji('❌')
                            .setValue('no')
                            .setDescription('No thanks')

                        menu.addOptions([no_option])

                        for (var i in video.related_videos) {
                            let i2 = Number(i) + 1
                            let option = new MessageMenuOption()
                                .setLabel('Recommended songs')
                                .setEmoji('🎶')
                                .setValue(String(i2))
                                .setDescription('I want to play ' + video.related_videos[i].title?.slice(0, 45))

                            menu.addOptions([option])
                        }

                        let play_again_option = new MessageMenuOption()
                            .setLabel('Play again?')
                            .setEmoji('⏪')
                            .setValue('play-again')
                            .setDescription('Play again the previous song')

                        menu.addOptions([play_again_option])

                        msg.channel.send({ embeds: [embed], components: [new MessageActionRow().addComponents(menu)] }).then(m => {
                            let collector = m.createMessageComponentCollector({ filter: menu => menu.user.id === msg.author.id, max: 1, time: 30000, errors: ['time'] })
                            collector.on('collect', async (menu) => {
                                if (menu.customId !== 'final-play-response') return;
                                let reses = []
                                let no = false;
                                let playAgain = false;
                                menu.values.forEach(choice => {
                                    if (choice === "no") {
                                        no = true
                                    } else if (choice === "play-again") {
                                        playAgain = true
                                    } else {
                                        reses.push(video.related_videos[parseInt(choice) - 1])
                                    }
                                })
                                if (no) {
                                    // do nothing, just let collector stop
                                } else if (playAgain) {
                                    bot.commands.get("play")[msg.author.language].run(bot, msg, [t.url])
                                } else {
                                    bot.commands.get('play')[msg.author.language].run(bot, msg, [`https://youtube.com/watch?v=${reses[0].id}`])
                                }
                                try {
                                    await menu.deferUpdate(true);
                                } catch (e) {

                                }
                                collector.stop()
                            })

                            collector.on('end', () => m.delete())
                        })
                    })
                    .on('trackChanged', (oldTrack, newTrack) => {
                        newTrack.startedAT = Date.now()
                        // 播放下一首歌曲時
                        if (bot.gdb.notifysongs?.enable) msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor((newTrack.queue?.autoplay ? "[Autoplaying] " : newTrack.queue?.repeatMode ? "[Playing again] " : "") + 'Now playing:' + newTrack.name, msg.guild.iconURL())
                                    .setImage(newTrack.thumbnail)
                                    .setColor('FFE023')
                                    .addField('Song', `[${newTrack.name}](${newTrack.url})`)
                                    .addField('Duration', newTrack.duration)
                                    .addField('Requested by', newTrack.requestedBy)
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                            ]
                        })

                        if (player.getQueue(msg.guild.id).party) {
                            let f = player.getFilters()
                            player.clearFilters(msg.guild.id)
                                .then(() => {
                                    player.getQueue(msg.guild.id).partyFilterApplied = true
                                    let n = Math.floor(Math.random() * Object.keys(f).length)
                                    let selected = []
                                    for (let i = 0; i < n; i++) {
                                        selected.push(Object.keys(f)[Math.floor(Math.random() * Object.keys(f).length)])
                                    }
                                    selected = selected.filter(function (elem, index, self) {
                                        return index === self.indexOf(elem);
                                    })
                                    let res = {}
                                    for (let _ of selected) {
                                        res[_] = true
                                    }
                                    player.setFilters(msg.guild.id, res)

                                    msg.channel.send({
                                        embeds: [
                                            new MessageEmbed()
                                                .setTitle("Get high!!!")
                                                .setColor('FFEE07')
                                                .addField('Effects below has been enabled:', '```' + selected.join('\n') + '```')
                                                .setFooter(config.footer, bot.user.displayAvatarURL())
                                        ]
                                    })
                                })
                                .catch(console.error)
                        } else if (player.getQueue(msg.guild.id).partyFilterApplied) {
                            player.getQueue(msg.guild.id).partyFilterApplied = false
                            player.clearFilters(msg.guild.id).catch(console.error)
                        }
                    })
                    .on('channelEmpty', () => {
                        // 頻道沒人時....
                        msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setAuthor('🎶 | Channel is empty! qwq...', msg.guild.iconURL())
                                    .setColor('FF2323')
                                    .setFooter(config.footer)
                                    .setImage(
                                        'https://media.discordapp.net/attachments/774291859648020480/774888000345473044/Shiron.gif'
                                    )
                            ]
                        })
                    })
            } else {
                const ql = await player.getQueue(msg.guild.id)
                if (ql.tracks.length > gconf.maxqueue.value && gconf.maxqueue.enable && await isDJPerm({})) {
                    throw new Error('You have reached the maximum songs you can have in the queue!\nDJ permissions can ignore the restriction!')
                }
                const song = await player.addToQueue(
                    msg.guild.id,
                    typeof args[0] === 'string' ? args.join(' ') : args,
                    msg.author.tag
                )
                if (song.type === 'playlist') {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor('🎶 Added to queue', msg.guild.iconURL())
                                .setColor('FFEE23')
                                .setImage(song.tracks[0].thumbnail)
                                .addField('Requested by', song.tracks[0].requestedBy)
                                .addField('Playlist length', song.tracks.length)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                    })
                } else if (song.type === 'list') {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor('🎶 Added to queue', msg.guild.iconURL())
                                .setColor('FFEE23')
                                .setImage(song.tracks[0].thumbnail)
                                .addField('Requested by', song.tracks[0].requestedBy)
                                .addField('Playlist length', song.tracks.length)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                    })
                } else {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor(song.name + ' has been added to queue!', msg.guild.iconURL())
                                .setColor('FFE023')
                                .setImage(song.thumbnail)
                                .addField('Song', `[${song.name}](${song.url})`)
                                .addField('Duration', song.duration)
                                .addField('Requested by', song.requestedBy)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                    })
                }
            }
        } catch (e) {
            msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('❌ Failed', msg.guild.iconURL())
                        .setColor('FF2323')
                        .addField('Error', '```' + e.toString() + '```')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
            throw e // 讓系統知道錯誤發生
        }
    }
}
