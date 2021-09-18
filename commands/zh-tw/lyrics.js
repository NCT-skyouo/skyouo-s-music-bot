// v13

const { MessageSelectMenu: MessageMenu, MessageActionRow } = require('discord.js');

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'lyrics',
  category: 'music',
  description: '從 魔鏡歌詞網/genius.com 獲取歌詞',
  aliases: ['l'],
  slash: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('從 魔鏡歌詞網/genius.com 獲取歌詞.')
    .addStringOption(option => option.setName('歌曲名稱').setDescription('想搜索歌詞的歌曲名稱.').setRequired(true)),
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, mojim, genius, MessageMenuOption } = bot
    if (!args[0]) {
      return msg.channel.send({ embeds: [
        new MessageEmbed()
          .setTitle("❌ 錯誤", msg.guild.iconURL())
          .setColor("RED")
          .addField("錯誤訊息", "\nError: 沒有提供歌曲名稱!\n用法: " + msg.guild.prefix + "lyrics (歌曲名稱)```\n\n```")
          .setFooter(config.footer, bot.user.displayAvatarURL())
      ]})
    }
    const message = await msg.channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor('正在搜尋...', msg.guild.iconURL())
          .setColor('FFEE07')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      ]
    })
    try {
      const queue = await player.getQueue(msg.guild.id)
      let suffix = args.join(' ')
      if (!suffix) {
        if (!queue.playing) return message.edit({ embeds: [new MessageEmbed().setAuthor('沒有指定歌曲!', msg.guild.iconURL()).setColor('FFEE00').setFooter(config.footer, bot.user.displayAvatarURL())] })
        suffix = queue.playing.name
      }
      let q = await mojim.searchBySong(suffix)

      if (q.length < 1) {
        throw new Error('找不到該歌曲的歌詞!')
      }

      if (q.length > 20) {
        // 一次只能取 20 筆歌詞
        q = q.slice(0, 20)
      }

      var embed =
        new bot.MessageEmbed()
          .setTitle("👇 可以使用下面的選單選擇歌詞!")
          // .setDescription(":one: nightcore\n:two: bassboost\n:three: karaoke\n:four: subboost\n:five: 8D\n:six: vaporwave\n:seven: shadow\n:eight: echo\n:nine: mountain\n:ten: metal")
          .setColor("RANDOM")
          .setFooter(bot.config.footer, bot.user.displayAvatarURL())

      const menu = new MessageMenu()
        .setCustomId('lyrics-response')
        .setPlaceholder('請選擇您認為最接近的搜索結果!')
        .setMaxValues(1)
        .setMinValues(1)

      let no_option = new MessageMenuOption()
        .setLabel('不用了')
        .setEmoji('❌')
        .setValue('no')
        .setDescription('不用了謝謝 (我只是看看/上面沒有我想要的結果)')

      menu.addOptions([no_option])

      for (var i in q) {
        let i2 = Number(i) + 1
        let option = new MessageMenuOption()
          .setLabel("結果 " + String(i2))
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
              return msg.channel.send({ embeds: [new MessageEmbed().setAuthor('❌ 找不到該歌曲的歌詞!!', msg.guild.iconURL()).setColor('FF0007').setFooter(config.footer, bot.user.displayAvatarURL())] })
              //return menu.reply?.defer(true);
            }
            res = mojim.rmUseless(mojim.rmADs(res))
            if (res.length > 2034) {
              const cut = res.length - 2020
              res = res.slice(0, res.length - cut) + '...'
            }
            const lyricembed = new MessageEmbed()
              .setTitle('🎶 ' + q[parseInt(resByClient[0]) - 1].title)
              .setDescription('**來源: 魔鏡歌詞網**\n' + res.split(/\n{2,4}/g).join('\n\n'))
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
      if (e.message.includes("找不到該歌曲的歌詞!")) {
        try {
          // { lyrics: lyrics, title: song.title, image: song.description_annotation.annotatable.image_url }
          var result = await genius.apiCall(args.join(" "), config.genius.key)
          if (!result.lyrics) {
            return message.edit({
              embeds: [
                new MessageEmbed()
                  .setTitle('❌ 無法查詢', msg.guild.iconURL())
                  .setColor('FF2323')
                  .addField('錯誤訊息', '```' + e.toString() + '```')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
          } else {
            if (result.lyrics.length > 2034) {
              const cut = result.lyrics.length - 2020
              result.lyrics = result.lyrics.slice(0, result.lyrics.length - cut) + '...'
            }
            const lyricembed = new MessageEmbed()
              .setTitle(result.title + ' 的歌詞')
              .setThumbnail(result.image)
              .setDescription('**來源: genius.com**\n' + result.lyrics)
              .setColor('00FE37')
              .setFooter(config.footer, bot.user.displayAvatarURL())
            message.edit({ embeds: [lyricembed] })
          }
        } catch (e) {
          return message.edit({
            embeds: [
              new MessageEmbed()
                .setTitle('❌ 無法查詢', msg.guild.iconURL())
                .setColor('FF2323')
                .addField('錯誤訊息', '```' + e.toString() + '```')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        }
      } else {
        return message.edit({
          embeds: [
            new MessageEmbed()
              .setTitle('❌ 無法查詢', msg.guild.iconURL())
              .setColor('FF2323')
              .addField('錯誤訊息', '```' + e.toString() + '```')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
        })
      }
    }
  }
}
