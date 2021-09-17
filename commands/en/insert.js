// v13 updated

const { Message } = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'insert',
  category: 'music',
  description: 'Insert a song to the front of the queue with the given query or URL',
  aliases: ['ins'],
  slash: new SlashCommandBuilder()
    .setName('insert')
    .setDescription('Insert a song to the front of the queue with the given query or URL.')
    .addStringOption(option => option.setName('keyword').setDescription('Query or URL.').setRequired(true)),
  /**
   * @param {Message} msg
   */
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, gdb, isDJPerm } = bot
    try {
        if (!args[0]) {
            throw new Error(`Invalid usage!\nUsage: ${config.prefix}play (query / URL)`)
        }
        if (!msg.member.voice.channel) {
            throw new Error('You need to connect to a voice channel to use this command!')
        } else if (
            msg.member.voice.channel &&
            msg.guild.me.voice.channel &&
            msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
        ) {
            throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
        }

        const gconf = gdb

        if (gconf.djonly.enable && !await isDJPerm({})) {
            throw new Error('The owner of the server has enabled DJ only mode!\n')
        }

        if (gdb.blacklist.enable && gdb.blacklist.channels.includes(msg.member.voice.channel.id) && !await isDJPerm({})) {
            throw new Error('This channel is in blacklist!')
        }


      if (!player.isPlaying(msg.guild.id)) {
        throw new Error('Nothing playing in the server!')
      } else {
        const ql = await player.getQueue(msg.guild.id)

        var np = await player.nowPlaying(msg.guild.id);

        if (!await isDJPerm(np)) throw new Error('You don\'t have permission to use this command!!')
        if (ql.tracks.length > gconf.maxqueue.value && gconf.maxqueue.enable && await isDJPerm({})) {
          throw new Error('You have reached the maximum songs you can have in the queue!\nDJ permissions can ignore the restriction!')
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
                .setAuthor('🎶 Successfully insert', msg.guild.iconURL())
                .setColor('FFEE23')
                .setImage(song.tracks[0].thumbnail)
                .addField('Requested by', song.tracks[0].requestedBy)
                .addField('Playlist length', song.tracks.length)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        } else if (song.type === 'list') {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('🎶 Successfully insert', msg.guild.iconURL())
                .setColor('FFEE23')
                .setImage(song.tracks[0].thumbnail)
                .addField('Requested by', song.tracks[0].requestedBy)
                .addField('Playlist length', song.tracks.length)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        } else {
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setAuthor('🎶 ' + song.name + ' is inserted to the front of the queue!', msg.guild.iconURL(8))
                .setColor('FFE023')
                .setImage(song.thumbnail)
                .addField('Song', `[${song.name}](${song.url})`)
                .addField('Duration', song.duration)
                .addField('Requested by', song.requestedBy)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
        }
      }
    } catch (e) {
      msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ Failed', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('Error message', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
      throw e // 讓系統知道錯誤發生
    }
  }
}
