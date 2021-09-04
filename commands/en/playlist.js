// v13

const Track = require("../../libs/v5-core/src/Track")

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'playlist',
    category: 'list',
    description: 'Plays the specified playlist you saved',
    aliases: ['playls', 'pls'],
    slash: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Plays the specified playlist you saved')
        .addStringOption(option => option.setName('name').setDescription('Playlist you saved.').setRequired(true)),
    run: async (bot, msg, args) => {
        const { config, MessageEmbed, sdb, player, isDJPerm, db } = bot
        if (!args[0]) {
            return msg.channel.send(
                new MessageEmbed()
                    .setTitle('Invalid usage')
                    .setColor('RANDOM')
                    .addField('Usage', '```' + msg.guild.prefix + 'playlist [playlist name]```')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            )
        }
        const all = await sdb.all()
        const list = []
        for (const key in all) {
            const tmp = all[key]
            all[key] = {}
            all[key].key = key
            all[key].list = tmp
            list.push(all[key])
        }
        const userlist = list.filter(list => list.key === msg.author.id + '-' + args[0])
        if (userlist.length === 0) {
            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('Playlist not found!')
                        .setColor('RANDOM')
                        .setFooter(`${msg.guild.prefix}export [playlist name] to create a playlist!`)
                ]
            })
        } else {
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
                const gconf = await db.get(msg.guild.id)

                if (gconf.djonly.enable && !await isDJPerm({})) {
                    throw new Error('The owner of the server has enabled DJ only mode!\n')
                }
                const isPlaying = player.isPlaying(msg.guild.id)
                if (isPlaying) throw new Error('Please let the song in the queue finish first!')
                for (const index in userlist[0].list) {
                    userlist[0].list[index].fromPlaylist = false
                    userlist[0].list[index] = Track.listInfoToTrack(userlist[0].list[index]) // Avoid Errors, Converts to Track Object
                    /*if (index == 0) {
                      await player.play(msg.member.voice.channel, userlist[0].list[index], msg.author.tag)
                    } else {
                      if ((index + 1) > gconf.maxqueue.value && gconf.maxqueue.enable && await isDJPerm({})) {
                        msg.channel.send(
                          new MessageEmbed()
                            .setTitle('已達歌曲上限!')
                            .setColor('FFEE07')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                        )
                        break
                      }
                      await player.addToQueue(msg.guild.id, userlist[0].list[index], msg.author.tag)
                    }*/
                }

                if (userlist[0].list.length > gconf.maxqueue.value && gconf.maxqueue.enable && await isDJPerm({})) {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle('⚠️ Shortening playlist due to reaching the maximum songs you can queue!')
                                .setColor('FFEE07')
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                    })
                    userlist[0].list = userlist[0].list.slice(0, gconf.maxqueue.value)
                }
                bot.commands.get('play')[msg.author.language].run(bot, msg, userlist[0].list)
                /*setTimeout(() => {
                  const song = userlist[0].list[0]
                  msg.channel.send(
                    new MessageEmbed()
                      .setAuthor('🎶 目前播放', msg.guild.iconURL())
                      .setColor('FFEE23')
                      .setImage(song.thumbnail)
                      .addField('目前播放', `[${song.name}](${song.url})`)
                      .addField('歌曲時長', song.duration)
                      .addField('請求者', song.requestedBy)
                      .setFooter(config.footer, bot.user.displayAvatarURL())
                  ).then(() => {
                    player
                      .getQueue(msg.guild.id)
                      .on('end', () => {
                        // 結束所有播放時...
                        msg.channel.send(
                          new MessageEmbed()
                            .setAuthor('🎶 | 播放完畢!', msg.guild.iconURL())
                            .setColor('FF2323')
                            .setFooter(config.footer)
                            .setImage(
                              'https://media.discordapp.net/attachments/689072112069247026/754530841631260692/bye-bye-pikachu-icegif.gif'
                            )
                        )
                      })
                      .on('trackChanged', (oldTrack, newTrack) => {
                        newTrack.startedAT = Date.now()
                        // 播放下一首歌曲時
                        msg.channel.send(
                          new MessageEmbed()
                            .setAuthor('目前播放:' + newTrack.name, msg.guild.iconURL())
                            .setImage(newTrack.thumbnail)
                            .setColor('FFE023')
                            .addField('歌曲名稱', `[${newTrack.name}](${newTrack.url})`)
                            .addField('歌曲時長', newTrack.duration)
                            .addField('請求者', newTrack.requestedBy)
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                        )
                      })
                      .on('channelEmpty', () => {
                        // 頻道沒人時....
                        msg.channel.send('沒人了qwq')
                      })
                  })
                }, 5000)*/
            } catch (e) {
                bot.botLogger.showErr(e)
                msg.channel.send({
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
}
