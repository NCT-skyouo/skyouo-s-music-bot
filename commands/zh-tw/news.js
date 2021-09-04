// v13

function calcTime(offset) {
  var d = new Date();
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  var nd = new Date(utc + (3600000 * offset));
  return nd
}


var Discord = require('discord.js')

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  name: 'news',
  category: 'utility',
  description: '觀看新聞.',
  aliases: [],
  slash: new SlashCommandBuilder()
    .setName('news')
    .setDescription('觀看新聞.')
    .addStringOption(option => option.setName('新聞編號').setDescription('想播放的新聞的編號 (可選).')),
  /**
   * @param {Discord.Client} bot
   * @param {Discord.Message} msg
   * @param {Discord.Message[]} args
   */
  run: async (bot, msg, args) => {
    try {
      if (bot.player.isPlaying(msg.guild.id)) { throw new Error('目前隊列裡還有正在播放的歌曲!!') }
      if (!msg.member.voice.channel) {
        throw new Error('您尚未加入任何一個語音頻道!')
      } else if (
        msg.member.voice.channel && msg.guild.me.voice.channel && msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
      ) {
        throw new Error('您必須要與機器人在同一個語音頻道!')
      }

      const config = bot.config

      if (!args[0]) {
        return msg.channel.send({
          embeds: [
            new bot.MessageEmbed()
              .setTitle('新聞頻道列表')
              .setColor('RANDOM')
              .setDescription('**以下頻道皆與本機器人無關, 本機器人不對下列頻道的言論負責**\n```\n57 為東森財經, 與日常新聞較無關, 故未在本機器人上提供觀看.\n另外, 2021 年 4 月, 因 3+11 政策失當而爆發新一波本土新冠肺炎疫情, 故此本機器人提供收看防疫記者會之服務.\n```')
              .addField('防疫記者會 (3+11)', `使用指令 \`${msg.guild.prefix}news 3+11\` 播放`)
              .addField('年代新聞 (50)', `**未提供 YouTube 直播觀看**`)
              .addField('東森新聞 (51)', `[點我可在 YouTube 觀看](https://www.youtube.com/c/newsebc/live)\n或者使用指令 \`${msg.guild.prefix}news 51\` 播放`)
              .addField('中天新聞 (52)', `[點我可在 YouTube 觀看](https://www.youtube.com/watch?v=lu_BJKxqGnk)\n或者使用指令 \`${msg.guild.prefix}news 52\` 播放`)
              .addField('民視新聞 (53)', `[點我可在 YouTube 觀看](https://www.youtube.com/watch?v=XxJKnDLYZz4)\n或者使用指令 \`${msg.guild.prefix}news 53\` 播放`)
              .addField('三立新聞 (54)', `[點我可在 YouTube 觀看](https://www.youtube.com/watch?v=pJ0VgJloR9E))\n或者使用指令 \`${msg.guild.prefix}news 54\` 播放`)
              .addField('TVBS 新聞 (55)', `[點我可在 YouTube 觀看](https://www.youtube.com/watch?v=V0WxUakDV7M)\n或者使用指令 \`${msg.guild.prefix}news 55\` 播放`)
              .addField('TVBS 國際 (56)', `[點我可在 YouTube 觀看](https://www.youtube.com/watch?v=hP6_jfCFxyQ)\n或者使用指令 \`${msg.guild.prefix}news 56\` 播放`)
              .addField('非凡新聞 (58)', '**未提供 YouTube 直播觀看**')
              .setFooter(bot.config.footer, bot.user.displayAvatarURL())
          ]
        })
      }

      if (args[0]) {
        var news;
        switch (args[0]) {
          case '50':
          case '58':
            return msg.channel.send(':x: **很抱歉, 您選擇的新聞頻道未提供 YouTube 直播源.**')
          case '3+11':
            let time = calcTime(8)
            bot.commands.get('play')[msg.author.language].run(bot, msg, [`防疫記者會 ${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`])
            break
          case '51':
            bot.commands.get('play')[msg.author.language].run(bot, msg, [`https://www.youtube.com/c/newsebc/live`])
            break
          case '52':
            bot.commands.get('play')[msg.author.language].run(bot, msg, [`https://www.youtube.com/watch?v=lu_BJKxqGnk`])
            break
          case '53':
            bot.commands.get('play')[msg.author.language].run(bot, msg, [`https://www.youtube.com/watch?v=XxJKnDLYZz4`])
            break
          case '54':
            bot.commands.get('play')[msg.author.language].run(bot, msg, [`https://www.youtube.com/watch?v=pJ0VgJloR9E`])
            break
          case '55':
            bot.commands.get('play')[msg.author.language].run(bot, msg, [`https://www.youtube.com/watch?v=V0WxUakDV7M`])
            break
          case '56':
            bot.commands.get('play')[msg.author.language].run(bot, msg, [`https://www.youtube.com/watch?v=hP6_jfCFxyQ`])
            break
          case '57':
            return msg.channel.send(':x: **很抱歉, 57 東森財經與日常新聞較無關, 故未在本機器人上提供觀看.**')
          default:
            return msg.channel.send(':x: **很抱歉, 請輸入一個有效的代碼.**')
        }
      }
    } catch (e) {
      return msg.channel.send({
        embeds:
          [new bot.MessageEmbed()
            .setTitle('❌ 無法播放', msg.guild.iconURL())
            .setColor('FF2323')
            .addField('錯誤訊息', '```' + e.toString() + '```')
            .setFooter(bot.config.footer, bot.user.displayAvatarURL())
          ]
      })
    }
  }
}