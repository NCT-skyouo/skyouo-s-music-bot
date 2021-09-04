// v13

const { MessageSelectMenu: MessageMenu, MessageActionRow } = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'search',
  category: 'music',
  description: '搜尋歌曲並播放',
  aliases: ['youtube', 'find'],
  slash: new SlashCommandBuilder()
    .setName('search')
    .setDescription('搜尋歌曲並播放.')
    .addStringOption(option => option.setName('關鍵字').setDescription('要搜尋的歌曲網址/關鍵字.').setRequired(true)),
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, db, config, isDJPerm, MessageMenuOption } = bot
    try {
      if (!args[0]) {
        throw new Error(`沒有提供歌曲名稱!\n用法: ${msg.guild.prefix}search (歌曲名稱)`)
      } else if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel &&
        msg.guild.me.voice.channel &&
        msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      }
      const gconf = await db.get(msg.guild.id)

      if (gconf.djonly.enable && !await isDJPerm({})) {
        throw new Error('服主已經開啟 DJ 限定模式!\n')
      }
      let res = await player.searchTracks(args.join(' '), true, true)
      res = res.slice(0, 10)

      const menu = new MessageMenu()
        .setCustomId('search-response')
        .setPlaceholder('請選擇 1 - ' + res.length + ' 來選擇你想要的歌曲')
        .setMaxValues(res.length)
        .setMinValues(1)

      for (var i in res) {
        let i2 = Number(i) + 1
        let option = new MessageMenuOption()
          .setLabel(String(i2))
          .setEmoji('🎶')
          .setValue(String(i2))
          .setDescription(res[i].name.slice(0, 50))

        menu.addOptions([option])
      }

      const embed = new bot.MessageEmbed()
        .setTitle('👇 請使用以下的選單選擇您想要聆聽的歌曲 (可複選)')
        .setColor('FFE007')
        .setFooter(config.footer, bot.user.displayAvatarURL())

      msg.channel.send({
        embeds: [embed],
        components: [new MessageActionRow().addComponents(menu)]
      }).then(async m => {
        let collector = m.createMessageComponentCollector({ filter: menu => menu.user.id === msg.author.id, max: 1, time: 30000, errors: ['time'] })
        collector.on('collect', async (menu) => {
          if (menu.customId !== 'search-response') return;
          let reses = []
          menu.values.forEach(SIndex => {
            reses.push(res[parseInt(SIndex) - 1])
          })
          bot.commands.get('play')[msg.author.language].run(bot, msg, reses)
          try {
            await menu.deferUpdate(true);
          } catch (e) {

          }
          collector.stop()
        })

        collector.on('end', () => m.delete())
      })
    } catch (e) {
      return msg.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('❌ 無法播放', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
      })
    }
  }
}
