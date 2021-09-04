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
  description: '播放您最愛的歌曲',
  aliases: ['p'],
  slash: new SlashCommandBuilder()
    .setName('play')
    .setDescription('播放您最愛的歌曲.')
    .addStringOption(option => option.setName('關鍵字').setDescription('要播放的歌曲網址/關鍵字.').setRequired(true)),
  /**
   * @param {Message} msg
   */
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, db, gdb, isDJPerm, MessageMenuOption } = bot
    try {
      if (!args[0]) {
        throw new Error(`沒有提供歌曲名稱!\n用法: ${config.prefix}play (歌曲名稱)`)
      } else if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel &&
        msg.guild.me.voice.channel &&
        msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      } // 如果用戶不在和機器人相同的語音頻道

      const gconf = gdb

      if (gconf.djonly.enable && !await isDJPerm({})) {
        throw new Error('服主已經開啟 DJ 限定模式!\n')
      }

      if (gconf.blacklist.enable && gconf.blacklist.channels.includes(msg.member.voice.channel.id) && !await isDJPerm({})) {
        throw new Error('這個頻道已經在黑名單裡!')
      }

      if (!player.isPlaying(msg.guild.id)) {
        const song = await player.play(
          msg.member.voice.channel,
          typeof args[0] === 'string' ? args.join(' ') : args,
          msg.author.tag,
          msg.channel
        ).catch(e => { throw e });// 播放音樂

        if (!song) throw new Error('找不到')

        if (song.type === 'playlist') {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('🎶 目前播放', msg.guild.iconURL())
                .setColor('FFEE23')
                .setImage(song.tracks[0].thumbnail)
                .addField(
                  '目前播放',
                  `[${song.tracks[0].name}](${song.tracks[0].url})`
                )
                .addField('歌曲時長', song.tracks[0].duration)
                .addField('請求者', song.tracks[0].requestedBy)
                .addField('清單長度', String(song.tracks.length))
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        } else if (song.type === 'list') {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('🎶 目前播放', msg.guild.iconURL())
                .setDescription((song.tracks.length - 1) ? '**還有 x 首歌曲被加入了隊列中...**'.replace('x', song.tracks.length - 1) : '')
                .setColor('FFEE23')
                .setImage(song.tracks[0].thumbnail)
                .addField('目前播放', `[${song.tracks[0].name}](${song.tracks[0].url})`)
                .addField('歌曲時長', song.tracks[0].duration)
                .addField('請求者', song.tracks[0].requestedBy)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        } else {
          msg.channel.send({
            embeds: [new MessageEmbed()
              .setAuthor('🎶 目前播放', msg.guild.iconURL())
              .setColor('FFEE23')
              .setImage(song.thumbnail)
              .addField('目前播放', `[${song.name}](${song.url})`)
              .addField('歌曲時長', song.duration)
              .addField('請求者', song.requestedBy)
              .setFooter(config.footer, bot.user.displayAvatarURL())]
          })
        }

        player
          .getQueue(msg.guild.id)
          .on('end', async (t) => {
            // 結束所有播放時...
            var embed = new MessageEmbed()
              .setAuthor('🎶 | 播放完畢!', msg.guild.iconURL())
              .setDescription((t.fromYoutube) ? "**👇 可以使用下面的選單執行一些功能**" : "👋 感謝您使用 v6!")
              .setColor('FF2323')
              .setFooter(config.footer)

            embed = t.fromYoutube ? embed : embed.setImage(
              'https://media.discordapp.net/attachments/774291859648020480/774888000345473044/Shiron.gif')

            if (!t.fromYoutube) return msg.channel.send({
              embeds: [embed]
            });
            // const video = await YouTube.getVideo(t.url, reqOpt);
            const video = await ytdl.getInfo(t.url, reqOpt)
            if (!video.related_videos?.length) return msg.channel.send({ embeds: [embed.setDescription("👋 感謝您使用 v6!")] });

            if (t.queue.autoplay) {
              args = [video.related_videos[0].id]
              return bot.commands.get("play")[msg.author.language].run(bot, msg, args)
            }

            video.related_videos = video.related_videos.slice(0, 25)

            const menu = new MessageMenu()
              .setCustomId('final-play-response')
              .setPlaceholder('請選擇您想要執行的選項!')
              .setMaxValues(1)
              .setMinValues(1)

            let no_option = new MessageMenuOption()
              .setLabel('不用了')
              .setEmoji('❌')
              .setValue('no')
              .setDescription('不用了謝謝 (不需要/上面沒我想要的歌曲)')

            menu.addOptions([no_option])

            for (var i in video.related_videos) {
              let i2 = Number(i) + 1
              let option = new MessageMenuOption()
                .setLabel('播放推薦歌曲')
                .setEmoji('🎶')
                .setValue(String(i2))
                .setDescription('我想播放 ' + video.related_videos[i].title?.slice(0, 45))

              menu.addOptions([option])
            }

            let play_again_option = new MessageMenuOption()
              .setLabel('重聽一次')
              .setEmoji('⏪')
              .setValue('play-again')
              .setDescription('重聽一次剛剛的歌曲')

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
                  .setAuthor((newTrack.queue?.autoplay ? "[自動播放] " : newTrack.queue?.repeatMode ? "[重複播放] " : "") + '目前播放:' + newTrack.name, msg.guild.iconURL())
                  .setImage(newTrack.thumbnail)
                  .setColor('FFE023')
                  .addField('歌曲名稱', `[${newTrack.name}](${newTrack.url})`)
                  .addField('歌曲時長', newTrack.duration)
                  .addField('請求者', newTrack.requestedBy)
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
                        .setTitle("嗨起來!!!")
                        .setColor('FFEE07')
                        .addField('以下音效被開啟了:', '```' + selected.join('\n') + '```')
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
                  .setAuthor('🎶 | 頻道沒人了! qwq...', msg.guild.iconURL())
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
          throw new Error('本群組的歌單已經達到最高上限了!\nDJ 可無視該上限!')
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
                .setAuthor('🎶 已添加', msg.guild.iconURL())
                .setColor('FFEE23')
                .setImage(song.tracks[0].thumbnail)
                .addField('請求者', song.tracks[0].requestedBy)
                .addField('清單長度', song.tracks.length)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        } else if (song.type === 'list') {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('🎶 已添加', msg.guild.iconURL())
                .setColor('FFEE23')
                .setImage(song.tracks[0].thumbnail)
                .addField('請求者', song.tracks[0].requestedBy)
                .addField('歌單長度', song.tracks.length)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        } else {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('🎶 ' + song.name + ' 已經被添加至隊列了!', msg.guild.iconURL())
                .setColor('FFE023')
                .setImage(song.thumbnail)
                .addField('歌曲', `[${song.name}](${song.url})`)
                .addField('時長', song.duration)
                .addField('請求者', song.requestedBy)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        }
      }
    } catch (e) {
      msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 無法播放', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
      throw e // 讓系統知道錯誤發生
    }
  }
}
