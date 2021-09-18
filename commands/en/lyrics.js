// v13

const { MessageSelectMenu: MessageMenu, MessageActionRow } = require('discord.js');

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'lyrics',
    category: 'music',
    description: 'Gets the lyrics of the current playing song/the query you provided from mojim/genius.com',
    aliases: ['l'],
    slash: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Gets the lyrics of the current playing song/the query you provided from mojim.com/genius.com')
        .addStringOption(option => option.setName('song').setDescription('Shows the lyrics of the current playing song').setRequired(true)),
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, mojim, genius, MessageMenuOption } = bot
        if (!args[0]) {
            return msg.channel.send({ embeds: [
              new MessageEmbed()
                .setTitle("❌ Failed", msg.guild.iconURL())
                .setColor("RED")
                .addField("Message", "\nError: You have to provide song name!\nUsage: " + msg.guild.prefix + "lyrics (Song Name)```\n\n```")
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]})
          }
        const message = await msg.channel.send({
            embeds: [
                new MessageEmbed()
                    .setAuthor('Searching...', msg.guild.iconURL())
                    .setColor('FFEE07')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
        })
        try {
            const queue = await player.getQueue(msg.guild.id)
            let suffix = args.join(' ')
            if (!suffix) {
                if (!queue.playing) return message.edit({ embeds: [new MessageEmbed().setAuthor('No specified song provided!', msg.guild.iconURL()).setColor('FFEE00').setFooter(config.footer, bot.user.displayAvatarURL())] })
                suffix = queue.playing.name
            }
            let q = await mojim.searchBySong(suffix)

            if (q.length < 1) {
                throw new Error('No lyrics found!')
            }

            if (q.length > 20) {
                // 一次只能取 20 筆歌詞
                q = q.slice(0, 20)
            }

            var embed =
                new bot.MessageEmbed()
                    .setTitle("👇 Use the menu below to choose the lyrics you want!")
                    .setColor("RANDOM")
                    .setFooter(bot.config.footer, bot.user.displayAvatarURL())

            const menu = new MessageMenu()
                .setCustomId('lyrics-response')
                .setPlaceholder('Select the search result you think is the closest')
                .setMaxValues(1)
                .setMinValues(1)

            let no_option = new MessageMenuOption()
                .setLabel('Cancel')
                .setEmoji('❌')
                .setValue('no')
                .setDescription('No thanks (I\'m just looking around/None of above is the result I want)')

            menu.addOptions([no_option])

            for (var i in q) {
                let i2 = Number(i) + 1
                let option = new MessageMenuOption()
                    .setLabel(String(i2) + 'results')
                    .setEmoji('🎶')
                    .setValue(String(i2))
                    .setDescription(q[i].title.slice(0, 50))

                menu.addOptions([option])
            }

            message.edit({ embeds: [embed], components: [new MessageActionRow().addComponents(menu)] }).then(m => {
                let collector = m.createMessageComponentCollector({ filter: menu => menu.user.id === msg.author.id, max: 1, time: 30000, errors: ['time'] })
                collector.on('collect', async (menu) => {
                    if (menu.customId !== 'lyrics-response') return;
                    let resByClient = menu.values

                    if (resByClient[0] === 'no') {
                        isNo = true
                        // Yep, Do nothin'
                    } else {
                        let res = await mojim.lyrics(q, parseInt(resByClient[0]) - 1)
                        if (!res) {
                            collector.stop()
                            return msg.channel.send({ embeds: [new MessageEmbed().setAuthor('❌ No lyrics found!!', msg.guild.iconURL()).setColor('FF0007').setFooter(config.footer, bot.user.displayAvatarURL())] })
                            //return menu.reply?.defer(true);
                        }
                        res = mojim.rmUseless(mojim.rmADs(res))
                        if (res.length > 2034) {
                            const cut = res.length - 2020
                            res = res.slice(0, res.length - cut) + '...'
                        }
                        const lyricembed = new MessageEmbed()
                            .setTitle('🎶 ' + q[parseInt(resByClient[0]) - 1].title)
                            .setDescription('**Source: mojim.com**\n' + res.split(/\n{2,4}/g).join('\n\n'))
                            .setColor('00FE37')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                        msg.channel.send({ embeds: [lyricembed] })
                        // reses.forEach(r => bot.commands.get(r).run(bot, msg, args))
                    }

                    try {
                        await menu.deferUpdate(true);
                    } catch (e) {

                    }
                    collector.stop()
                })

                collector.on('end', () => {
                    m.delete()
                })
            })

            /*message.edit(
              new MessageEmbed()
                .setTitle('請選擇 1-' + q.length)
                .setDescription(q.map((a, i) => {
                  return `${i + 1} - ${a.title}`
                }))
                .setColor('FFEE07')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ).then((messa) => {
              messa.channel
                .awaitMessages(
                  me =>
                    me.author.id === msg.author.id &&
                    parseInt(me) > 0 &&
                    parseInt(me) < (q.length + 1),
                  { max: 1, time: 30000, errors: ['time'] }
                )
                .then(async collect => {
                  let res = await mojim.lyrics(q, parseInt(collect.first().content) - 1)
                  try {
                    collect.first().delete()
                  } catch (e) { }
                  if (!res) return messa.edit(new MessageEmbed().setAuthor('找不到該歌曲!!', msg.guild.iconURL()).setColor('FF0007').setFooter(config.footer, bot.user.displayAvatarURL()))
                  res = mojim.rmUseless(mojim.rmADs(res))
                  if (res.length > 2034) {
                    const cut = res.length - 2020
                    res = res.slice(0, res.length - cut) + '...'
                  }
                  const lyricembed = new MessageEmbed()
                    .setTitle(q[parseInt(collect.first().content) - 1].title + ' 的歌詞')
                    .setDescription('**來源: 魔鏡歌詞網**\n' + res)
                    .setColor('00FE37')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
                  messa.edit(lyricembed)
                })
                .catch(e => {
                  throw e
                })
            })
              .catch(e => {
                throw e
              })*/
        } catch (e) {
            if (e.message.includes("No lyrics found!")) {
                try {
                    // { lyrics: lyrics, title: song.title, image: song.description_annotation.annotatable.image_url }
                    var result = await genius.apiCall(args.join(" "), config.genius.key)
                    if (!result.lyrics) {
                        return message.edit({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle('❌ Failed', msg.guild.iconURL())
                                    .setColor('FF2323')
                                    .addField('Error', '```' + e.toString() + '```')
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                    } else {
                        if (result.lyrics.length > 2034) {
                            const cut = result.lyrics.length - 2020
                            result.lyrics = result.lyrics.slice(0, result.lyrics.length - cut) + '...'
                        }
                        const lyricembed = new MessageEmbed()
                            .setTitle('Lyrics for' + result.title)
                            .setThumbnail(result.image)
                            .setDescription('**Source: genius.com**\n' + result.lyrics)
                            .setColor('00FE37')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                        message.edit({ embeds: [lyricembed] })
                    }
                } catch (e) {
                    return message.edit({
                        embeds: [
                            new MessageEmbed()
                                .setTitle('❌ Failed', msg.guild.iconURL())
                                .setColor('FF2323')
                                .addField('Error', '```' + e.toString() + '```')
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                    })
                }
            } else {
                return message.edit({
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
