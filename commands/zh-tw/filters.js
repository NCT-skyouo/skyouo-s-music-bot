// v13

const { MessageSelectMenu: MessageMenu, MessageActionRow } = require('discord.js')

module.exports = {
  name: 'filters',
  category: 'filter',
  description: '[Premium] 切換特效',
  aliases: [],
  premium: true,
  run: async (bot, msg, args) => {
    var { MessageMenuOption } = bot
    try {
      if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('目前沒有正在播放的歌曲!') }
      if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel && msg.guild.me.voice.channel &&	msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      }
      const np = await bot.player.nowPlaying(msg.guild.id)
      if (!await bot.isDJPerm(np)) throw new Error('沒有權限!!')
      let active_filters = ["nightcore", "bass", "karaoke", "subboost", "8d", "vaporwave", "shadow", "echo", "mountain_echo", "metal"]
      /*var message = await msg.channel.send(
        new bot.MessageEmbed()
        .setTitle("特效清單")
        .setDescription(":one: nightcore\n:two: bassboost\n:three: karaoke\n:four: subboost\n:five: 8D\n:six: vaporwave\n:seven: shadow\n:eight: echo\n:nine: mountain\n:ten: metal")
        .setColor("RANDOM")
        .setFooter(bot.config.footer, bot.user.displayAvatarURL())
      )*/

      var embed =
        new bot.MessageEmbed()
        .setTitle("👇 可以使用下面的選單選擇音效!")
        // .setDescription(":one: nightcore\n:two: bassboost\n:three: karaoke\n:four: subboost\n:five: 8D\n:six: vaporwave\n:seven: shadow\n:eight: echo\n:nine: mountain\n:ten: metal")
        .setColor("RANDOM")
        .setFooter(bot.config.footer, bot.user.displayAvatarURL())

        const menu = new MessageMenu()
        .setCustomId('filter-response')
        .setPlaceholder('請選擇您想要開啟/關閉的音效! (可複選, 一次最多三個)')
        .setMaxValues(3)
        .setMinValues(1)

        let no_option = new MessageMenuOption()
              .setLabel('不用了')
              .setEmoji('❌')
              .setValue('no')
              .setDescription('不用了謝謝 (我只是看看/上面沒有我想要的音效)')

        menu.addOptions([no_option])
  
        for (var i in active_filters) {
          let i2 = Number(i) + 1
          let option = new MessageMenuOption()
            .setLabel("音效 " + String(i2))
            .setEmoji('🎶')
            .setValue(String(i2))
            .setDescription(active_filters[i] + ' 音效')
  
            menu.addOptions([option])
        }
        
        msg.channel.send({ embeds: [embed], components: [new MessageActionRow().addComponents(menu)] }).then(m => {
          let collector = m.createMessageComponentCollector({ filter: menu => menu.user.id === msg.author.id, max: 1, time: 30000, errors: ['time'] })
          collector.on('collect', async (menu) => {
            if (menu.customId !== 'filter-response') return;
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

            try {
              await menu.deferUpdate(true);
            } catch (e) {

            }
            collector.stop()
          })
  
          collector.on('end', () => m.delete())
        })
      

      /*await message.react("❌")
      await message.react("1️⃣")
      await message.react("2️⃣")
      await message.react("3️⃣")
      await message.react("4️⃣")
      await message.react("5️⃣")
      await message.react("6️⃣")
      await message.react("7️⃣")
      await message.react("8️⃣")
      await message.react️("9️⃣")
      await message.react("🔟")

      const collector = message.createReactionCollector((r, usr) => usr === msg.author, { time: 30000 })

      collector.on("collect", async (r) => {
        try {
          await r.users.remove(msg.author.id).catch(e => { throw e })
        } catch (e) {}
        if (!bot.player.getQueue(msg.guild.id).playing) return
        switch (r.emoji.name) {
          case "❌":
            collector.stop()
            break
          case "1️⃣":
            bot.commands.get("nightcore")[msg.author.language].run(bot, msg, args)
            break
          case "2️⃣":
            bot.commands.get("bass")[msg.author.language].run(bot, msg, args)
            break
          case "3️⃣":
            bot.commands.get("karaoke")[msg.author.language].run(bot, msg, args)
            break
          case "4️⃣":
            bot.commands.get("subboost")[msg.author.language].run(bot, msg, args)
            break
          case "5️⃣":
            bot.commands.get("8d")[msg.author.language].run(bot, msg, args)
            break
          case "6️⃣":
            bot.commands.get("vaporwave")[msg.author.language].run(bot, msg, args)
            break
          case "7️⃣":
            bot.commands.get("shadow")[msg.author.language].run(bot, msg, args)
            break
          case "8️⃣":
            bot.commands.get("echo")[msg.author.language].run(bot, msg, args)
            break
          case "9️⃣":
            bot.commands.get("mountain_echo")[msg.author.language].run(bot, msg, args)
            break
          case "🔟":
            bot.commands.get("metal")[msg.author.language].run(bot, msg, args)
            break
        }
      })
      
      collector.on("end", async () => {
        try { await message.reactions.removeAll() } catch (e) {}
        await message.edit(
          new bot.MessageEmbed()
          .setColor("FFEE07")
          .setDescription("已關閉")
          .setFooter(bot.user.tag, bot.user.displayAvatarURL())
        )
      })*/

    } catch (e) {
      return msg.channel.send({
        embeds: [
          new bot.MessageEmbed()
          .setTitle('❌ 調整失敗', msg.guild.iconURL())
          .setColor('FF2323')
          .addField('錯誤訊息', '```' + e.toString() + '```')
          .setFooter(bot.config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}