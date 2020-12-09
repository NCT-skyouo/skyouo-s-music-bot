module.exports = {
  name: 'lyrics',
  description: '從魔鏡歌詞網獲取歌詞',
  aliases: ['l'],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, mojim } = bot
    const message = await msg.channel.send(
      new MessageEmbed()
        .setAuthor('正在搜尋...', msg.guild.iconURL())
        .setColor('FFEE07')
        .setFooter(config.footer, bot.user.displayAvatarURL())
    )
    try {
      const queue = await player.getQueue(msg.guild.id)
      let suffix = args.join(' ')
      if (!suffix) {
        if (!queue.playing) return message.edit(new MessageEmbed().setAuthor('沒有指定歌曲!', msg.guild.iconURL()).setColor('FFEE00').setFooter(config.footer, bot.user.displayAvatarURL()))
        suffix = queue.playing.name
      }
      const q = await mojim.searchByLyrics(suffix)

      if (q.length < 1) {
        throw new Error('找不到該歌曲的歌詞!')
      }

      message.edit(
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
            res = mojim.rmADs(res)
            if (res.length > 2034) {
              const cut = res.length - 2020
              res = res.slice(0, res.length - cut) + '...'
            }
            const lyricembed = new MessageEmbed()
              .setTitle(q[parseInt(collect.first().content) - 1].title + ' 的歌詞')
              .setDescription('**來源: 魔鏡歌詞網**' + res)
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
        })
    } catch (e) {
      bot.botLogger.showErr(e)
      return message.edit(
        new MessageEmbed()
          .setTitle('❌ 無法查詢', msg.guild.iconURL())
          .setColor('FF2323')
          .addField('錯誤訊息', '```' + e.toString() + '```')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    }
  }
}
