module.exports = {
  name: 'download',
  description: '[Premium] 下載歌曲, 本人不負任何法律責任',
  aliases: ['local'],
  premium: true,
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, MessageAttachment } = bot
    const ytdl = require('ytdl-core'); const fs = require('fs')
    if (!config.download) {
      const e = 'ConfigError: 擁有者已經關閉該功能'
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('❌ 無法下載', msg.guild.iconURL())
          .setColor('FF2323')
          .addField('錯誤訊息', '```' + e + '```')
          .setFooter('教學機器人', bot.user.displayAvatarURL())
      )
    }
    function download (song) {
      return new Promise((resolve, reject) => {
        msg.channel.send(
          new MessageEmbed()
            .setAuthor('即將下載', msg.guild.iconURL())
            .setImage(song.thumbnail)
            .setColor('FFE023')
            .addField('歌曲', `[${song.name}](${song.url})`)
            .addField('請求者', msg.author.tag)
            .setFooter('音樂, Music.', bot.user.displayAvatarURL())
        )
        const randint = (min, max) => Math.random() * (max - min + 1) + min
        const vid = msg.author.id + '-' + randint(0, 9999999) + '.mp3'
        const fp = bot.path + '/music/resources/' + vid
        const stream = ytdl(song.url, { quality: 'highestaudio' })
        stream.pipe(fs.createWriteStream(fp))
        stream.on('error', e => {
          msg.channel.send(
            new MessageEmbed()
              .setTitle('❌ 無法下載', msg.guild.iconURL())
              .setColor('FF2323')
              .addField('錯誤訊息', '```' + e.toString() + '```')
              .setFooter('教學機器人', bot.user.displayAvatarURL())
          )
          resolve()
        })
        stream.on('end', () => {
          fs.readFile(fp, (err, buffer) => {
            if (err) throw err
            if (buffer.length > 1024 * 1024 * 8) {
              msg.channel.send(`${msg.author}, 檔案過大!!!`).then(() => {
                fs.unlink(fp, function (err) {
                  if (err) throw err
                })
              })
              resolve()
            }
            const attachment = new MessageAttachment(buffer, 'music.mp3')
            msg.channel
              .send(`${msg.author}, 你的音樂已經下載成功!`, attachment)
              .then(() => {
                fs.unlink(fp, function (err) {
                  if (err) throw err
                })
              })
            resolve()
          })
        })
      })
    }
    try {
      const res = await player.searchTracks(args.join(' '))
      if (!res || res.length === 0) throw new Error('找不到該音樂!!')
      if (res.length > 1) {
        download(res[0]).catch(e => {
          throw e
        })
      } else {
        download(res[0]).catch(e => {
          throw e
        })
      }
    } catch (e) {
      return msg.channel.send(
        new MessageEmbed()
          .setTitle('❌ 無法下載', msg.guild.iconURL())
          .setColor('FF2323')
          .addField('錯誤訊息', '```' + e.toString() + '```')
          .setFooter(config.footer, bot.user.displayAvatarURL())
      )
    }
  }
}
