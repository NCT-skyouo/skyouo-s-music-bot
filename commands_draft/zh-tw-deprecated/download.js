const filters = {
  bassboost: 'bass=g=12,dynaudnorm=f=250',
  '8D': 'apulsator=hz=0.08',
  vaporwave: 'aresample=48000,asetrate=48000*0.8',
  nightcore: 'aresample=48000,asetrate=48000*1.25',
  phaser: 'aphaser=in_gain=0.4',
  tremolo: 'tremolo',
  vibrato: 'vibrato=f=6.5',
  reverse: 'areverse',
  treble: 'treble=g=5',
  normalizer: 'dynaudnorm=f=200',
  surrounding: 'surround',
  pulsator: 'apulsator=hz=1',
  subboost: 'asubboost',
  karaoke: 'stereotools=mlev=0.015625,stereotools=mode=lr>rr',
  flanger: 'flanger',
  gate: 'agate',
  haas: 'haas',
  mcompand: 'mcompand',
  ok: 'pan=stereo|c0=c0|c1=-1*c1',
  echo: 'aecho=0.8:0.88:220:0.4',
  shadow: 'aecho=0.8:0.88:110:0.4',
  mountain_echo: "aecho=0.85:0.95:560:0.6",
  metal: "aecho=0.8:0.88:8:0.8"
}

const fs = require('fs')
const dytdl = require('discord-ytdl-core');
const ytdl = require('youtube-dl-exec').raw;
const ytdl_ = require('ytdl-core')
const { MessageSelectMenu: MessageMenu, MessageActionRow } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'download',
  category: 'utility',
  description: '[Premium] 下載您喜歡的音樂, 並存在手機/電腦裡隨時收聽.',
  aliases: ['local'],
  premium: true,
  slash: new SlashCommandBuilder()
    .setName('download')
    .setDescription('[Premium] 下載您喜歡的音樂, 並存在手機/電腦裡隨時收聽.')
    .addStringOption(option => option.setName('關鍵字').setDescription('要下載的歌曲網址/關鍵字.').setRequired(true)),
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, MessageAttachment, MessageMenuOption } = bot

    if (!config.download) {
      const e = 'ConfigError: 擁有者已經關閉該功能'
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 無法下載', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
    function download(song, options = {}) {
      return new Promise(async (resolve, reject) => {
        msg.channel.send({
          embeds: [
            new MessageEmbed()
              .setAuthor('即將下載', msg.guild.iconURL())
              .setImage(song.thumbnail)
              .setColor('FFE023')
              .addField('歌曲', `[${song.name}](${song.url})`)
              .addField('請求者', msg.author.tag)
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
        })

        const randint = (min, max) => Math.random() * (max - min + 1) + min
        const vid = msg.author.id + '-' + randint(0, 9999999) + '.mp3'
        const fp = bot.path + '/music/resources/' + vid;
        // var stream = await player.extractStream(song, options)
        if (options.encoderArgs) {
          var Astream;
          if (song.fromYoutube) {
            Astream = ytdl(song.url, {
              o: '-',
              q: '',
              f: 'bestaudio[ext=webm+asr=48000]/bestaudio',
              audioQuality: "192K"
            })

            Astream = Astream.stdout
          } else {
            Astream = ytdl(song.url, {
              o: '-',
              q: '',
            })

            Astream = Astream.stdout
          }

          stream = dytdl.arbitraryStream(Astream, { encoderArgs: ["-af"].concat(options.encoderArgs.map(e => { return filters[e] })) })
        } else {
          if (song.fromYoutube) {
            stream = ytdl(song.url, {
              o: '-',
              q: '',
              f: 'bestaudio[ext=webm+asr=48000]/bestaudio',
              audioQuality: "192K"
            })

            stream = stream.stdout
          } else {
            stream = ytdl(song.url, {
              o: '-',
              q: '',
            })

            stream = stream.stdout
          }
        }
        stream.pipe(fs.createWriteStream(fp))
        stream.on('error', e => {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setTitle('❌ 無法下載', msg.guild.iconURL())
                .setColor('FF2323')
                .addField('錯誤訊息', '```' + e.toString() + '```')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
          resolve()
        })
        stream.on('end', () => {
          fs.readFile(fp, (err, buffer) => {
            if (err) throw err
            if (buffer.length > 1024 * 1024 * 8) {
              if (config.web.enable) {
                var url = new URL('/music/' + vid, config.web.url).href
                /*var Message = new MessageEmbed()
                  .setTitle("")*/
                msg.channel.send(`${msg.author}, 檔案過大!!!\n> 然而, 您依舊可以從網站下載音樂\n> ${url}`).then(() => {
                  setTimeout(() => {
                    fs.unlink(fp, function (err) {
                      if (err) throw err
                    })
                  }, 30 * 60 * 1000)
                })
              } else {
                msg.channel.send(`${msg.author}, 檔案過大!!!`).then(() => {
                  fs.unlink(fp, function (err) {
                    if (err) throw err
                  })
                })
              }
              resolve()
            }
            const attachment = new MessageAttachment(buffer, 'music.mp3')
            msg.channel
              .send({
                content: `${msg.author}, 你的音樂已經下載成功!`,
                files: [
                  attachment
                ]
              })
              .then(() => {
                fs.unlink(fp, function (err) {
                  if (err) throw err
                })
              })
            resolve()
          })
        })

        resolve()
      })
    }

    try {

      if (args.length === 0) {
        if (!player.isPlaying(msg.guild.id)) {
          throw new Error('ArgumentError: 必須指定歌曲')
        } else {
          args = [player.getQueue(msg.guild.id).playing.url]
        }
      }

      const menu = new MessageMenu()
        .setCustomId('dl-response')
        .setPlaceholder('請選擇您想要執行的選項!')
        .setMaxValues(1)
        .setMinValues(1)
      let option1 = new MessageMenuOption()
        .setLabel('取消執行')
        .setEmoji('❌')
        .setValue('no')
        .setDescription('不用了謝謝 (我只是看看)')
      let option2 = new MessageMenuOption()
        .setLabel('一般下載')
        .setEmoji('1️⃣')
        .setValue('one')
        .setDescription('該選項將下載原始的檔案, 較為快速.')
      let option3 = new MessageMenuOption()
        .setLabel('混音下載')
        .setEmoji('2️⃣')
        .setValue('two')
        .setDescription('該選項讓您可以使用 v6 內部的音效混音至您想下載的歌曲.')

      menu.addOptions(option1, option2, option3)

      var prompt1 = await msg.channel.send({
        embeds: [
          new bot.MessageEmbed()
            .setTitle("下載選項")
            .addField("一般下載", "該選項將下載原始的檔案, 較為快速.")
            .addField("混音下載", "該選項讓您可以使用 v6 內部的音效混音至您想下載的歌曲")
            .setColor("RANDOM")
            .setFooter(bot.config.footer, bot.user.displayAvatarURL())
        ],
        components: [new MessageActionRow().addComponents(menu)]
      })

      /*await prompt1.react("❌")
      await prompt1.react("1️⃣")
      await prompt1.react("2️⃣")*/

      const collector = prompt1.createMessageComponentCollector(menu => menu.id === msg.author.id, { max: 1, time: 30000, errors: ['time'] })
      /*const collector = prompt1.createReactionCollector((r, usr) => usr === msg.author, { time: 30000 })*/

      collector.on("collect", async (r) => {
        try {
          await r.deferUpdate(true);
        } catch (e) {

        }
        switch (r.values[0]) {
          case "no":
            collector.stop()
            break
          case "one":
            collector.stop()
            var res1
            if (ytdl_.validateURL(args[0])) {
              res1 = await player.searchTracks(ytdl_.getURLVideoID(args[0]))
            } else {
              res1 = await player.searchTracks(args.join(' '))
            }

            if (!res1 || !res1.length) throw new Error('找不到該音樂!!')
            download(res1[0], {
              filters: []
            })
            break
          case "two":
            collector.stop()
            var res
            if (ytdl_.validateURL(args[0])) {
              res = await player.searchTracks(ytdl_.getURLVideoID(args[0]))
            } else {
              res = await player.searchTracks(args.join(' '))
            }
            if (!res || !res.length) throw new Error('找不到該音樂!!')
            var fargs = []

            let active_filters = ["nightcore", "bassboost", "karaoke", "subboost", "8D", "vaporwave", "shadow", "echo", "mountain_echo", "metal"]

            var embed = new bot.MessageEmbed()
              .setTitle("👇 可以使用下面的選單選擇音效!")
              // .setDescription(":one: nightcore\n:two: bassboost\n:three: karaoke\n:four: subboost\n:five: 8D\n:six: vaporwave\n:seven: shadow\n:eight: echo\n:nine: mountain\n:ten: metal")
              .setColor("RANDOM")
              .setFooter(bot.config.footer, bot.user.displayAvatarURL())

            const menu = new MessageMenu()
              .setCustomId('dl-filter-response')
              .setPlaceholder('請選擇您想要開啟/關閉的音效! (可複選)')
              .setMaxValues(active_filters.length)
              .setMinValues(1)

            let no_option = new MessageMenuOption()
              .setLabel('不用了')
              .setEmoji('❌')
              .setValue('no')
              .setDescription('不用了謝謝 (我只是看看)')

            menu.addOptions(no_option)

            for (var i in active_filters) {
              let i2 = Number(i) + 1
              let option = new MessageMenuOption()
                .setLabel("音效 " + String(i2))
                .setEmoji('🎶')
                .setValue(String(i2))
                .setDescription(active_filters[i] + ' 音效')

              menu.addOptions([option])
            }

            msg.channel.send({
              embeds: [embed],
              components: [new MessageActionRow().addComponents(menu)]
            }).then(m => {
              let collector = m.createMessageComponentCollector({ filter: menu => menu.user.id === msg.author.id, max: 1, time: 30000, errors: ['time'] })
              collector.on('collect', async (menu) => {
                if (menu.customId !== 'dl-filter-response') return;
                let reses = []
                let no = false
                menu.values.forEach(SIndex => {
                  if (SIndex === 'no') no = true
                  reses.push(active_filters[parseInt(SIndex) - 1])
                })

                if (no) {
                  message.edit(
                    new bot.MessageEmbed()
                      .setColor("FFEE07")
                      .setDescription("已關閉")
                      .setFooter(bot.user.tag, bot.user.displayAvatarURL())
                  )
                  // Yep, Do nothin'
                } else {
                  // reses.forEach(r => bot.commands.get(r).run(bot, msg, args))
                  // reses.forEach(r => fargs.push(filters[r]))
                  download(res[0], {
                    filters: reses
                  })
                }

                try {
                  await menu.deferUpdate(true);
                } catch (e) {
                  collector.stop()
                }
              })

              collector.on('end', () => m.delete())
            })
            break
        }
      })

      collector.on("end", async () => {
        // try { await prompt1.reactions.removeAll() } catch (e) { }
        /*await prompt1.edit(
          new MessageEmbed()
            .setColor("FFEE07")
            .setDescription("> 已失效, 感謝您使用 " + bot.user.username + "!")
            .setFooter(bot.user.tag, bot.user.displayAvatarURL())
        )*/
        await prompt1.delete()
      })
    } catch (e) {
      console.log(e.stack)
    }
  }
}