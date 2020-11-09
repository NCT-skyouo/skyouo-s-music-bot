module.exports = {
  name: 'now-playing',
  description: '獲取目前播放',
  aliases: ['np'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config } = bot
    const isPlaying = await player.isPlaying(msg.guild.id)
    try {
      if (!isPlaying) throw new Error('沒有正在播放的歌曲')

      const np = await player.nowPlaying(msg.guild.id)

      const queue = await player.getQueue(msg.guild.id)

      function ms2mmss (ms) {
        const minutes = Math.floor(ms / 60000)
        const seconds = ((ms % 60000) / 1000).toFixed(0)
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
      }
      // Stream time of the dispatcher
      const currentStreamTime = queue.voiceConnection.dispatcher
        ? queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime
        : 0
        // Total stream time
      // const total = queue.playing.ms()
      var message = await msg.channel.send(
        new MessageEmbed()
          .setAuthor('目前播放: ' + np.name, msg.guild.iconURL())
          .setURL(np.url)
          .setColor('FFEE07')
          .setDescription('```css\n' + ms2mmss(currentStreamTime) + '/' + np.duration + '\n\n\n' + player.createProgressBar(msg.guild.id) + '```')
          .setFooter(config.footer)
      )

      if (!msg.guild.me.hasPermission("MANAGE_MESSAGES")) {
        msg.channel.send("本群未提供 `MANAGE_MESSAGES` 給我, 所以您必須自己移除表情符號!")
      }

      await message.react("⏪") // preivous
      await message.react("⏸️") // pause
      await message.react("▶️") // remuse
      await message.react("⏩") // skip
      await message.react("🔀") // shuffle
      await message.react("⏹️") // stop
      await message.react("🔁") // queueloop
      await message.react("🔂") // loop
      await message.react("📤") // export

      const collector = message.createReactionCollector((r, usr) => usr === msg.author, { time: 30000 })
      
      collector.on("collect", async (r) => {
        try {
          await r.users.remove(msg.author.id).catch(e => { throw e })
        } catch (e) {}
        switch (r.emoji.name) {
          case "❌":
            bot.commands.get("preivous").run(bot, msg, args)
            break
          case "⏸️":
            bot.commands.get("pause").run(bot, msg, args)
            break
          case "▶️":
            bot.commands.get("resume").run(bot, msg, args)
            break
          case "⏩":
            bot.commands.get("skip").run(bot, msg, args)
            break
          case "⏹️":
            bot.commands.get("stop").run(bot, msg, args)
            break
          case "🔀":
            bot.commands.get("shuffle").run(bot, msg, args)
            break
          case "🔁":
            bot.commands.get("queueloop").run(bot, msg, args)
            break
          case "🔂":
            bot.commands.get("repeat").run(bot, msg, args)
            break
          case "📤":
            var mes = await msg.channel.send("請輸入要新建的清單名稱")
            try {
              var res = await mes.channel.awaitMessages(m => msg.author.id === m.author.id, { max: 1, time: 6000, errors: ['time']}).catch(e => { throw e })
              bot.commands.get("export").run(bot, res.first(), res.first().content.split(" ").slice(1))
            } catch (e) {}
            break
        }
      })
      
      collector.on("end", async () => {
        try { await message.reactions.removeAll() } catch (e) {}
        await message.edit(
          new MessageEmbed()
          .setColor("FFEE07")
          .setDescription("已關閉")
          .setFooter(bot.user.tag, bot.user.displayAvatarURL())
        )
      })

    } catch (e) {
      bot.botLogger.showErr(e)
    }
  }
}
