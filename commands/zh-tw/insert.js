// v13 updated

const { Message } = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'insert',
  category: 'music',
  description: '將您想播放的歌曲插入隊列中的第一個位置',
  aliases: ['ins'],
  slash: new SlashCommandBuilder()
    .setName('insert')
    .setDescription('將您想播放的歌曲插入隊列中的第一個位置.')
    .addStringOption(option => option.setName('關鍵字').setDescription('要播放的歌曲網址/關鍵字.').setRequired(true)),
  /**
   * @param {Message} msg
   */
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, gdb, isDJPerm } = bot
    try {
      if (!args[0]) {
        throw new Error(`沒有提供歌曲名稱!\n用法: ${config.prefix}insert (歌曲名稱)`)
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
        throw new Error('沒有播放任何歌曲!')
      } else {
        const ql = await player.getQueue(msg.guild.id)

        var np = await player.nowPlaying(msg.guild.id);

        if (!await isDJPerm(np)) throw new Error('您沒有 DJ 權限!')
        if (ql.tracks.length > gconf.maxqueue.value && gconf.maxqueue.enable && await isDJPerm({})) {
          throw new Error('本群組的歌單已經達到最高上限了!\nDJ 可無視該上限!')
        }
        const song = await player.addToQueue(
          msg.guild.id,
          typeof args[0] === 'string' ? args.join(' ') : args,
          msg.author.tag,
          0
        )
        if (song.type === 'playlist') {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('🎶 已插入', msg.guild.iconURL())
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
                .setAuthor('🎶 已插入', msg.guild.iconURL())
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
                .setAuthor('🎶 ' + song.name + ' 被插入至首位了!', msg.guild.iconURL(8))
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
            .setTitle('❌ 無法插入', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
      throw e // 讓系統知道錯誤發生
    }
  }
}
