module.exports = {
  name: 'filters',
  description: '[Premium] 切換特效',
  aliases: [],
  premium: true,
  run: async (bot, msg, args) => {
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
      var message = await msg.channel.send(
        new bot.MessageEmbed()
        .setTitle("特效清單")
        .setDescription(":one: nightcore\n:two: bassboost\n:three: karaoke\n:four: subboost\n:five: 8D\n:six: vaporwave\n:seven: shadow\n:eight: echo\n:nine: mountain\n:ten: metal")
        .setColor("RANDOM")
        .setFooter(bot.config.footer, bot.user.displayAvatarURL())
      )

      await message.react("❌")
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
            bot.commands.get("nightcore").run(bot, msg, args)
            break
          case "2️⃣":
            bot.commands.get("bass").run(bot, msg, args)
            break
          case "3️⃣":
            bot.commands.get("karaoke").run(bot, msg, args)
            break
          case "4️⃣":
            bot.commands.get("subboost").run(bot, msg, args)
            break
          case "5️⃣":
            bot.commands.get("8d").run(bot, msg, args)
            break
          case "6️⃣":
            bot.commands.get("vaporwave").run(bot, msg, args)
            break
          case "7️⃣":
            bot.commands.get("shadow").run(bot, msg, args)
            break
          case "8️⃣":
            bot.commands.get("echo").run(bot, msg, args)
            break
          case "9️⃣":
            bot.commands.get("mountain_echo").run(bot, msg, args)
            break
          case "🔟":
            bot.commands.get("metal").run(bot, msg, args)
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
      })

    } catch (e) {

    }
  }
}