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
  mountain: "aecho=0.85:0.95:560:0.6",
  metal: "aecho=0.8:0.88:8:0.8"
}

module.exports = {
  name: 'download',
  description: '[Premium] 下載歌曲, 本人不負任何法律責任',
  aliases: ['local'],
  premium: true,
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, MessageAttachment } = bot
    const fs = require('fs')
    const dytdl = require('discord-ytdl-core');
    const ytdl = require('ytdl-core');

    if (!config.download) {
      const e = 'ConfigError: 擁有者已經關閉該功能'
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('❌ 無法下載', msg.guild.iconURL())
          .setColor('FF2323')
          .addField('錯誤訊息', '```' + e + '```')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    }
    function download(song, options = {}) {
      return new Promise((resolve, reject) => {
        msg.channel.send(
          new MessageEmbed()
            .setAuthor('即將下載', msg.guild.iconURL())
            .setImage(song.thumbnail)
            .setColor('FFE023')
            .addField('歌曲', `[${song.name}](${song.url})`)
            .addField('請求者', msg.author.tag)
            .setFooter(config.footer, bot.user.displayAvatarURL())
        )
        const randint = (min, max) => Math.random() * (max - min + 1) + min
        const vid = msg.author.id + '-' + randint(0, 9999999) + '.mp3'
        const fp = bot.path + '/music/resources/' + vid;
        var stream
        if (options.encoderArgs) {
          stream = dytdl(song.url, options)
        } else {
          stream = ytdl(song.url, options)
        }
        stream.pipe(fs.createWriteStream(fp))
        stream.on('error', e => {
          msg.channel.send(
            new MessageEmbed()
              .setTitle('❌ 無法下載', msg.guild.iconURL())
              .setColor('FF2323')
              .addField('錯誤訊息', '```' + e.toString() + '```')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          )
          resolve()
        })
        stream.on('end', () => {
          fs.readFile(fp, (err, buffer) => {
            if (err) throw err
            if (buffer.length > 1024 * 1024 * 8) {
              if (config.web.enable) {
                var url = new URL('/music/' + vid, config.web.url).href
                var Message = new MessageEmbed()
                .setTitle("")
                msg.channel.send(`${msg.author}, 檔案過大!!!\n> 然而, 您依舊可以從網站下載音樂\n> ${url}`).then(() => {
                  setTimeout(() => {
                    fs.unlink(fp, function(err) {
                      if (err) throw err
                    })
                  }, 30 * 60 * 1000)
                })
              } else {
                msg.channel.send(`${msg.author}, 檔案過大!!!`).then(() => {
                    fs.unlink(fp, function(err) {
                      if (err) throw err
                    })
                })
              }
              resolve()
            }
            const attachment = new MessageAttachment(buffer, 'music.mp3')
            msg.channel
              .send(`${msg.author}, 你的音樂已經下載成功!`, attachment)
              .then(() => {
                fs.unlink(fp, function(err) {
                  if (err) throw err
                })
              })
            resolve()
          })
        })
      })
    }
    try {
      var prompt1 = await msg.channel.send(
        new bot.MessageEmbed()
          .setTitle("下載選項")
          .addField("1️⃣ 一般下載", "該選項將下載原始的檔案, 較為快速.")
          .addField("2️⃣ 混音下載", "該選項讓您可以使用 v5 內部的音效混音至您想下載的歌曲")
          .setColor("RANDOM")
          .setFooter(bot.config.footer, bot.user.displayAvatarURL())
      )

      await prompt1.react("❌")
      await prompt1.react("1️⃣")
      await prompt1.react("2️⃣")

      const collector = prompt1.createReactionCollector((r, usr) => usr === msg.author, { time: 30000 })

      collector.on("collect", async (r) => {
        try {
          await r.users.remove(msg.author.id).catch(e => { throw e })
        } catch (e) { }
        switch (r.emoji.name) {
          case "❌":
            collector.stop()
            break
          case "1️⃣":
            collector.stop()
            var res1
            if (ytdl.validateURL(args[0])) {
              res1 = await player.searchTracks(ytdl.getURLVideoID(args[0]))
            } else {
              res1 = await player.searchTracks(args.join(' '))
            }
            
            if (!res1 || res1.length === 0) throw new Error('找不到該音樂!!')
            download(res1[0], {
              filter: "audioonly",
              quality: "highestaudio"
            })
            break
          case "2️⃣":
            collector.stop()
            var res
            if (ytdl.validateURL(args[0])) {
              res = await player.searchTracks(ytdl.getURLVideoID(args[0]))
            } else {
              res = await player.searchTracks(args.join(' '))
            }
            if (!res || res.length === 0) throw new Error('找不到該音樂!!')
            var fargs = []
            var fstats = {}
            var originMessage = new bot.MessageEmbed()
              .setTitle("特效清單")
              .setDescription(":one: nightcore\n:two: bassboost\n:three: karaoke\n:four: subboost\n:five: 8D\n:six: vaporwave\n:seven: shadow\n:eight: echo\n:nine: mountain\n:keycap_ten: metal")
              .setColor("RANDOM")
              .setFooter(bot.config.footer, bot.user.displayAvatarURL())
            var message = await msg.channel.send(
              originMessage
            );

            await message.react("✅").catch(e => { throw e });
            await message.react("1️⃣").catch(e => { throw e });
            await message.react("2️⃣").catch(e => { throw e });
            await message.react("3️⃣").catch(e => { throw e });
            await message.react("4️⃣").catch(e => { throw e });
            await message.react("5️⃣").catch(e => { throw e });
            await message.react("6️⃣").catch(e => { throw e });
            await message.react("7️⃣").catch(e => { throw e });
            await message.react("8️⃣").catch(e => { throw e });
            await message.react("9️⃣").catch(e => { throw e });
            await message.react("🔟").catch(e => { throw e });

            const collector2 = message.createReactionCollector((r, usr) => usr === msg.author, { time: 90000 })

            collector2.on("collect", async (r) => {
              var copyOfFstats = JSON.parse(JSON.stringify({ object: fstats })).object
              try {
                await r.users.remove(msg.author.id).catch(e => { throw e })
              } catch (e) { }
              switch (r.emoji.name) {
                case "✅":
                  collector2.stop()
                  break
                case "1️⃣":
                  fstats.nightcore = fstats.nightcore ? false : true
                  break
                case "2️⃣":
                  fstats.bassboost = fstats.bassboost ? false : true
                  break
                case "3️⃣":
                  fstats.ok = fstats.ok ? false : true
                  break
                case "4️⃣":
                  fstats.subboost = fstats.subboost ? false : true
                  break
                case "5️⃣":
                  fstats['8D'] = fstats['8D'] ? false : true
                  break
                case "6️⃣":
                  fstats.vaporwave = fstats.vaporwave ? false : true
                  break
                case "7️⃣":
                  fstats.shadow = fstats.shadow ? false : true
                  break
                case "8️⃣":
                  fstats.echo = fstats.echo ? false : true
                  break
                case "9️⃣":
                  fstats.mountain = fstats.mountain ? false : true
                  break
                case "🔟":
                  fstats.metal = fstats.metal ? false : true
                  break
              }
              if (copyOfFstats !== fstats && r.emoji.name !== "✅") {
                var newMessage = new bot.MessageEmbed(originMessage)
                  .addField('目前特效', '```\n' + Object.keys(fstats).map(k => fstats[k] ? 'O | ' + k : 'X | ' + k).join('\n') + '\n```')
                message.edit(newMessage)
              }
            })

            collector2.on("end", async () => {
              try { await message.reactions.removeAll() } catch (e) { }
              await message.edit(
                new bot.MessageEmbed()
                  .setColor("FFEE07")
                  .setDescription("已關閉")
                  .setFooter(bot.user.tag, bot.user.displayAvatarURL())
              )
              if (Object.values(fstats).some(k => k === true)) {
                Object.keys(fstats).forEach((k) => {
                  if (fstats[k] === true) {
                    fargs.push(filters[k])
                  }
                })
                download(res[0], {
                  filter: "audioonly",
                  quality: "highestaudio",
                  fmt: "mp3",
                  encoderArgs: ['-af', fargs.join(',')]
                })
              } else {
                return;
              }
            })
            break
        }
      })

      collector.on("end", async () => {
        try { await prompt1.reactions.removeAll() } catch (e) { }
        await prompt1.edit(
          new MessageEmbed()
            .setColor("FFEE07")
            .setDescription("> 已失效, 感謝您使用 " + bot.user.username + "!")
            .setFooter(bot.user.tag, bot.user.displayAvatarURL())
        )
      })
    } catch (e) {
      console.log(e.stack)
    }
  }
}