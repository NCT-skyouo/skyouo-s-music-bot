const { Permissions } = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { MessageActionRow, MessageButton } = require('discord.js');

// v13

module.exports = {
  name: 'configure',
  category: 'admin',
  description: '調整伺服器設置',
  aliases: ['config', 'conf', 'cfg', 'cf'],
  slash: new SlashCommandBuilder()
    .setName('configure')
    .setDescription('調整伺服器設置')
    .addSubcommandGroup((group) =>
      group
        .setName('dj')
        .setDescription('調整 DJ 權限設置.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('adduser')
            .setDescription('讓一名用戶獲得 DJ 權限.')
            .addUserOption(option => option.setName('目標').setDescription('您想要給予權限的用戶.').setRequired(true))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('addrole')
            .setDescription('讓擁有該身份組的用戶獲得 DJ 權限.')
            .addRoleOption(option => option.setName('目標').setDescription('您想要給予權限的身份組.').setRequired(true))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('removeuser')
            .setDescription('撤銷一名用戶的 DJ 權限.')
            .addUserOption(option => option.setName('目標').setDescription('您想要撤銷權限的用戶.').setRequired(true))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('removerole')
            .setDescription('撤銷該身份組的 DJ 權限.')
            .addRoleOption(option => option.setName('目標').setDescription('您想要撤銷權限的身份組.').setRequired(true))
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('premium')
        .setDescription('調整高級版激活設置.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('enable')
            .setDescription('免費啟用高級版.')
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('prefix')
        .setDescription('調整指令前綴設置.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('personal')
            .setDescription('為您自己設置專屬的前輟 (使用斜線指令可無視該選項).')
            .addStringOption(option => option.setName('指令前綴').setDescription('在指令前面要加的符號/字母 (填 reset 可重置).').setRequired(true))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('guild')
            .setDescription('為伺服器設置默認的前輟 (使用斜線指令可無視該選項).')
            .addStringOption(option => option.setName('指令前綴').setDescription('在指令前面要加的符號/字母 (填 reset 可重置).').setRequired(true))
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('djonly')
        .setDescription('調整 DJ 限定模式設置.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('toggle')
            .setDescription('啟用/禁用 DJ 限定模式.')
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('maxqueue')
        .setDescription('調整隊列長度限制設置.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('toggle')
            .setDescription('啟用/禁用 隊列長度上限.')
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('set')
            .setDescription('設置隊列長度上限.')
            .addIntegerOption(option => option.setName('最大長度').setDescription('該選項將影響待播清單能夠塞下多少歌曲, 擁有 dj 權限的用戶可無視該上限.').setRequired(true))
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('language')
        .setDescription('調整顯示語言設置.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('personal')
            .setDescription('為您自己調整顯示語言.')
            .addStringOption(option => option.setName('語言').setDescription('語言代號 (可為 zh-tw/en).').setRequired(true))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('guild')
            .setDescription('為伺服器調整顯示語言.')
            .addStringOption(option => option.setName('語言').setDescription('語言代號 (可為 zh-tw/en).').setRequired(true).addChoice('繁體中文', 'zh-tw').addChoice('English', 'en'))
        )
    )
    .addSubcommandGroup((group) =>
      group.setName('blacklist')
        .setDescription('調整黑名單設置.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('add')
            .setDescription('加入黑名單.')
            .addChannelOption(option => option.setName('目標').setDescription('您想要加入黑名單的頻道.').setRequired(true))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('remove')
            .setDescription('撤銷黑名單.')
            .addChannelOption(option => option.setName('目標').setDescription('您想要撤銷黑名單的頻道.').setRequired(true))
        )
    ),
  run: async (bot, msg, args) => {
    try {
      const { MessageEmbed, config, db } = bot

      function isAdmin() {
        const member = msg.member
        if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
          msg.channel.send({
            embeds: [new MessageEmbed()
              .setTitle('❌ 權限不足')
              .setColor('FF0230')
              .addField('權限不足', '您必須要有 `ADMINISTRATOR` 或 `MANAGE_GUILD` 才能修改設置!')
              .setFooter(config.footer, bot.user.displayAvatarURL())]
          })
          return false
        }
        return true
      }

      function notFound(any, embed) {
        if (!any) {
          msg.channel.send(
            {
              embeds: [
                embed
                  .setTitle("❌ 找不到該用戶!")
                  .setColor("FF0230")
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            }
          )
          return true
        }
        return false
      }

      function invalid() {
        msg.channel.send({
          embeds: [
            new MessageEmbed()
              .setTitle('❌ 參數錯誤')
              .setColor('FF0230')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          ]
        })
        return true
      }

      function done() {
        return msg.channel.send(
          {
            embeds: [
              new MessageEmbed()
                .setTitle('✅ 設置成功!')
                .setColor('FFEE07')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
      }

      function remove(array, item) {
        const index = array.indexOf(item)
        if (index > -1) {
          array.splice(index, 1)
        }
        return array
      }

      let gconf = await db.get(msg.guild.id)
      if (!gconf) {
        await db.set(msg.guild.id, config.defaultconfig)
      }

      gconf = gconf || config.defaultconfig

      const dpre = msg.guild.prefix
      const gdata = await db.get(msg.guild.id)
      switch (args[0]) {
        case 'prefix':
          if (!args[1]) {
            return msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('🗝️ 前輟 (Prefix)')
                  .setColor('2323F7')
                  .setDescription('```\n前輟, \n通常一個群組有很多機器人, \n為了要辨別機器人, \n所以才要為每個機器人設置專屬的前輟.\n```')
                  .setThumbnail(msg.guild.iconURL())
                  // .addField('目前的 Prefix: ' + msg.guild.prefix, '```\n' + msg.guild.prefix + 'config prefix [prefix]' + '\n```', true)
                  .addField('群組默認 Prefix: ' + (gconf.prefix.guild ? gconf.prefix.guild : "❌ 未自訂"), '```\n' + msg.guild.prefix + 'config prefix guild [prefix]' + '\n```')
                  .addField('個人默認 Prefix: ' + (gconf.prefix.personal[msg.author.id] ? gconf.prefix.personal[msg.author.id] : "❌ 未自訂"), '```\n' + msg.guild.prefix + 'config prefix personal [prefix]' + '\n```')
                  .addField('重置', '```\n' + msg.guild.prefix + 'config prefix [guild/personal] reset' + '\n```')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
            // show the prefix
          } else if (args[1] === 'guild') {
            if (!isAdmin()) return

            if (!args[2]) return invalid()

            if (args[2] === 'reset') {
              delete gconf.prefix.guild
              await db.set(msg.guild.id, gconf)
              return done()
            }
            gdata.prefix.guild = args[2]
            await db.set(msg.guild.id, gdata)
            return done()
          } else if (args[1] === 'personal') {
            if (!isAdmin()) return

            if (!args[2]) return invalid()

            if (args[2] === 'reset') {
              delete gconf.prefix.personal[msg.author.id]
              await db.set(msg.guild.id, gconf)
              return done()
            }

            gdata.prefix.personal[msg.author.id] = args[2]
            await db.set(msg.guild.id, gdata)
            return done()
          }
          break
        case 'dj':
          if (!args[1]) {
            const enable = gdata.dj.enable
            let embed = new MessageEmbed()
              .setTitle('🎶 DJ')
              .setColor('FFEE07')
              .setThumbnail(msg.guild.iconURL())
              .setDescription('```\nDJ 權限, \nDJ 權限相當於本機器人的管理員權限, \n可以使用僅限管理員能用的指令.\n```')
              .addField('狀態', enable ? '⭕ **已開啟**' : '❌ **已關閉**')
              .setFooter(config.footer, bot.user.displayAvatarURL())

            if (enable) {
              embed = embed
                .addField('有DJ權限的人', (gdata.dj.people.length > 0 ? gdata.dj.people.length > 20 ? gdata.dj.people.slice(0, 20).join(', ') + '...' : gdata.dj.people.join(', ') : '暫無') + '```')
                .addField('有DJ權限的身份組', '```' + (gdata.dj.list.length > 0 ? gdata.dj.list.length > 20 ? gdata.dj.list.slice(0, 20).join(', ') + '...' : gdata.dj.list.join(', ') : '暫無') + '```')
            }

            embed = embed.addField('添加(個人)', `\`\`\`\n${msg.guild.prefix}config dj adduser [@user]\n\`\`\``)
            embed = embed.addField('添加(身份組)', `\`\`\`\n${msg.guild.prefix}config dj addrole [@role]\n\`\`\``)
            embed = embed.addField('移除(個人)', `\`\`\`\n${msg.guild.prefix}config dj removeuser [@user]\n\`\`\``)
            embed = embed.addField('移除(身份組)', `\`\`\`\n${msg.guild.prefix}config dj removerole [@role]\n\`\`\``)

            return msg.channel.send({
              embeds: [embed]
            })
          } else {
            if (args[1] === 'adduser') {
              if (!isAdmin()) return;
              const embed = new MessageEmbed()
                .setTitle('❌ 錯誤用法')
                .setColor('FF0230')
                .setDescription('您打的指令並不完整! [@user]')
                .addField('正確用法', `\`\`\`\n${msg.guild.prefix}config dj adduser [@user]\n\`\`\``)
                .setFooter(config.footer, bot.user.displayAvatarURL())
              const user = msg.mentions.users.first()
              if (notFound(user, embed)) return
              if (gdata.dj.people.includes(user.id)) return
              gdata.dj.people.push(user.id)
              gdata.dj.enable = true
              await db.set(msg.guild.id, gdata)
              return done()
            } else if (args[1] === 'addrole') {
              if (!isAdmin()) return;
              const embed = new MessageEmbed()
                .setTitle('❌ 錯誤用法')
                .setColor('FF0230')
                .setDescription('您打的指令並不完整! [@role]')
                .addField('正確用法', `\`\`\`\n${msg.guild.prefix}config dj addrole [@role]\n\`\`\``)
                .setFooter(config.footer, bot.user.displayAvatarURL())
              const roles = msg.mentions.roles.first()
              if (notFound(roles, embed) || msg.mentions.everyone) return
              if (gdata.dj.list.includes(roles.id)) return
              gdata.dj.list.push(roles.id)
              gdata.dj.enable = true
              await db.set(msg.guild.id, gdata)
              return done()
            } else if (args[1] === 'removeuser') {
              if (!isAdmin()) return;
              const embed = new MessageEmbed()
                .setTitle('❌ 錯誤用法')
                .setColor('FF0230')
                .setDescription('您打的指令並不完整! [@user]')
                .addField('正確用法', `\`\`\`\n${msg.guild.prefix}config dj removeuser [@user]\n\`\`\``)
                .setFooter(config.footer, bot.user.displayAvatarURL())
              const user = msg.mentions.users.first()
              if (notFound(user, embed)) return
              if (!gdata.dj.people.includes(user.id)) return
              gdata.dj.people = remove(gdata.dj.people, user.id)
              if (gdata.dj.people.length === 0 && gdata.dj.list.length === 0) gdata.dj.enable = false
              await db.set(msg.guild.id, gdata)
              return done()
            } else if (args[1] === 'removerole') {
              if (!isAdmin()) return;
              const embed = new MessageEmbed()
                .setTitle('❌ 錯誤用法')
                .setColor('FF0230')
                .setDescription('您打的指令並不完整! [@role]')
                .addField('正確用法', `\`\`\`\n${msg.guild.prefix}config dj removerole [@role]\n\`\`\``)
                .setFooter(config.footer, bot.user.displayAvatarURL())
              const roles = msg.mentions.roles.first()
              if (notFound(roles, embed) || msg.mentions.everyone) return
              if (!gdata.dj.list.includes(roles.id)) return
              gdata.dj.list = remove(gdata.dj.list, roles.id)
              if (gdata.dj.people.length === 0 && gdata.dj.list.length === 0) gdata.dj.enable = false
              await db.set(msg.guild.id, gdata)
              return done()
            } else return
          }
        case 'blacklist':
          if (!args[1]) {
            var embed = new MessageEmbed()
              .setTitle('⛔ 頻道黑名單 (Blacklist Channel)')
              .setColor('2323F7')
              .setThumbnail(msg.guild.iconURL())
              .setDescription('```\n該選項用於限定 Kristen 不能進入哪些語音頻道,\n可避免部份惡意人士對您的耳膜進行傷害.\n```')
              .addField('目前 Blacklist Channel 的狀態: ' + (gconf.blacklist.enable ? '⭕ 已開啟' : '❌ 未開啟'), `\`\`\`${dpre}config blacklist toggle\`\`\``, true)

            if (gconf.blacklist.enable) {
              embed = embed
                .addField('目前的黑名單', '```\n' + (gconf.blacklist.channels.length ? (gconf.blacklist.channels.map(c => bot.channels.cache.get(c).name)).join('\n') : "暫無") + '\n```')
            }

            embed = embed.addField('添加頻道', `\`\`\`\n${msg.guild.prefix}config blacklist add [#channel]\n\`\`\``)
              .addField('移除頻道', `\`\`\`\n${msg.guild.prefix}config blacklist remove [#channel]\n\`\`\``)
              .setFooter(config.footer, bot.user.displayAvatarURL())

            return msg.channel.send({
              embeds: [
                embed
              ]
            })
            // show the prefix
          } else if (args[1] === 'toggle') {
            if (!isAdmin()) return

            gdata.blacklist.enable = !gdata.blacklist.enable
            await db.set(msg.guild.id, gdata)
            return done()
          } else if (args[1] === 'add') {
            if (!isAdmin()) return
            const embed = new MessageEmbed()
              .setTitle('❌ 錯誤用法')
              .setColor('FF0230')
              .setDescription('您打的指令並不完整! [#channel]')
              .addField('正確用法', `\`\`\`\n${msg.guild.prefix}config blacklist add [#channel]\n\`\`\``)
              .setFooter(config.footer, bot.user.displayAvatarURL())

            const channel = msg.mentions.channels.first()
            if (notFound(channel, embed)) return
            if (channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE') return msg.channel.send(new MessageEmbed.setTitle('❌ 這個頻道不是語音頻道!').setColor('FF0230').setFooter(config.footer, bot.user.displayAvatarURL()))
            if (gdata.blacklist.channels.includes(channel.id)) return msg.channel.send(new MessageEmbed.setTitle('❌ 這個頻道已經在黑名單中了!').setColor('FF0230').setFooter(config.footer, bot.user.displayAvatarURL()))
            gdata.blacklist.channels.push(channel.id)
            await db.set(msg.guild.id, gdata)
            return done()
          } else if (args[1] === 'remove') {
            if (!isAdmin()) return
            const embed = new MessageEmbed()
              .setTitle('❌ 錯誤用法')
              .setColor('FF0230')
              .setDescription('您打的指令並不完整! [#channel]')
              .addField('正確用法', `\`\`\`\n${msg.guild.prefix}config blacklist remove [#channel]\n\`\`\``)
              .setFooter(config.footer, bot.user.displayAvatarURL())
            const channel = msg.mentions.channels.first()
            if (notFound(channel, embed)) return
            if (channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE') return msg.channel.send(new MessageEmbed.setTitle('❌ 這個頻道不是語音頻道!').setColor('FF0230').setFooter(config.footer, bot.user.displayAvatarURL()))
            if (!gdata.blacklist.channels.includes(channel.id)) return msg.channel.send(new MessageEmbed.setTitle('❌ 這個頻道不在黑名單!').setColor('FF0230').setFooter(config.footer, bot.user.displayAvatarURL()))
            gdata.blacklist.channels = remove(gdata.blacklist.channels, channel.id)
            await db.set(msg.guild.id, gdata)
            return done()
          }
          break
        case 'maxqueue':
          if (!args[1]) {
            return msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('🔄 隊列長度限制 (Max queue size)')
                  .setColor('2323F7')
                  .setThumbnail(msg.guild.iconURL())
                  .setDescription('```\n該選項將會限制群組一次最多能往隊列裡塞多少歌曲, \nDJ/管理員可無視該限制.\n```')
                  .addField('目前 Max Queue size 的狀態: ' + (gconf.maxqueue.enable ? '⭕ 已開啟 - ' + gconf.maxqueue.value + ' 首最大上限' : '❌ 未開啟'), `\`\`\`${dpre}config maxqueue toggle | 開啟\n${dpre}config maxqueue set [歌單上限] | 設置上限\`\`\``, true)
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
            // show the prefix
          } else if (args[1] === 'toggle') {
            if (!isAdmin()) return

            gdata.maxqueue.enable = !gdata.maxqueue.enable
            await db.set(msg.guild.id, gdata)
            return done()
          } else if (args[1] === 'set') {
            if (!isAdmin()) return

            if (isNaN(parseInt(args[2]))) {
              return msg.channel.send({
                embeds: [
                  new MessageEmbed()
                    .setTitle('❌ 無效的設置!')
                    .setColor('FF2307')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
              })
            } else if (Number(args[2]) < 1) {
              return msg.channel.send(
                new MessageEmbed()
                  .setTitle('❌ 無效的設置!')
                  .setColor('FF2307')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              )
            }
            gdata.maxqueue.value.push()
            await db.set(msg.guild.id, gdata)
            return done()
          }
          break
        case 'premium':
          if (!args[1]) {
            return msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('💳 高級版 (Premium)')
                  .setColor('FFEE07')
                  .setThumbnail(msg.guild.iconURL())
                  .setDescription('```\n高級版包含了使用 download, filters, party 等功能的權限, \n倘若您認為有需要開啟這些功能, 請使用下方的指令.\n```')
                  .addField('狀態', (gdata.premium.enable ? '⭕ 已開啟' : '❌ 未開啟'))
                  .addField("開啟", "使用 ``" + msg.guild.prefix + "config premium enable`` 開啟 v6 高級版!")
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
          } else if (args[1] === 'enable') {
            // if (msg.author.id !== config.ownerid) return msg.channel.send('無權限!')
            if (!isAdmin()) return
            if (gdata.premium.enable) return msg.channel.send(new MessageEmbed().setTitle('❌ 您已經開啟了高級版!').setColor('FF0000').setFooter(bot.user.displayAvatarURL(), bot.config.footer))

            gdata.premium.enable = true
            await db.set(msg.guild.id, gdata)
            return msg.channel.send((gdata.premium.enable ? '開啟' : '關閉') + '成功!')
          }
          break
        case 'djonly':
          if (!args[1]) {
            return msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('🚷 DJ 限定 (DJ only)')
                  .setColor('2323F7')
                  .setThumbnail(msg.guild.iconURL())
                  .setDescription('```\n倘若開啟了該選項, \n那麼只有 DJ/管理員 才能使用這台機器人!\n```')
                  .addField('目前 DJ only 的狀態: ' + (gconf.djonly.enable ? '⭕ 已開啟' : '❌ 未開啟'), `\`\`\`${dpre}config djonly toggle\`\`\``, true)
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
            // show the prefix
          } else if (args[1] === 'toggle') {
            if (!isAdmin()) return

            gdata.djonly.enable = !gdata.djonly.enable
            await db.set(msg.guild.id, gdata)
            return done()
          }
          break
        case 'maxqueue':
          if (!args[1]) {
            return msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('🔄 隊列長度限制 (Max queue size)')
                  .setColor('2323F7')
                  .setThumbnail(msg.guild.iconURL())
                  .setDescription('```\n該選項將會限制群組一次最多能往隊列裡塞多少歌曲, \nDJ/管理員可無視該限制.\n```')
                  .addField('目前 Max Queue size 的狀態: ' + (gconf.maxqueue.enable ? '⭕ 已開啟 - ' + gconf.maxqueue.value + ' 首最大上限' : '❌ 未開啟'), `\`\`\`${dpre}config maxqueue toggle | 開啟\n${dpre}config maxqueue set [歌單上限] | 設置上限\`\`\``, true)
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
            // show the prefix
          } else if (args[1] === 'toggle') {
            if (!isAdmin()) return

            gdata.maxqueue.enable = !gdata.maxqueue.enable
            await db.set(msg.guild.id, gdata)
            msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('設置成功!')
                  .setColor('FFEE07')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
          } else if (args[1] === 'set') {
            if (!isAdmin()) return

            if (isNaN(parseInt(args[2]))) {
              return msg.channel.send({
                embeds: [
                  new MessageEmbed()
                    .setTitle('❌ 無效的設置!')
                    .setColor('FF2307')
                    .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
              })
            } else if (Number(args[2]) < 1) {
              return msg.channel.send(
                new MessageEmbed()
                  .setTitle('❌ 無效的設置!')
                  .setColor('FF2307')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              )
            }
            gdata.maxqueue.value = Number(args[2])
            await db.set(msg.guild.id, gdata)
            return done()
          }
          break
        case "notifysongs":
          if (!args[1]) {
            return msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('🔈 顯示歌曲資訊 (Show Songs Infomation)')
                  .setColor('2323F7')
                  .setThumbnail(msg.guild.iconURL())
                  .setDescription('```\n倘若開啟了該選項, \n在歌曲切換時, 會告訴你下一首歌曲的資訊!\n```')
                  .addField('目前 顯示歌曲資訊 的狀態: ' + (gconf.notifysongs.enable ? '⭕ 已開啟' : '❌ 未開啟'), `\`\`\`${dpre}config notifysongstoggle\`\`\``, true)
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
            // show the prefix
          } else if (args[1] === 'toggle') {
            if (!isAdmin()) return
            gdata.notifysongs.enable = !gdata.notifysongs.enable
            await db.set(msg.guild.id, gdata)
            return done()
          }
          break
        case 'language':
          if (!args[1]) {
            return msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('🗺️ Language')
                  .setColor('2323F7')
                  .setThumbnail(msg.guild.iconURL())
                  .setDescription('```\n您可以選擇要 Kristen 對您或您群組顯示的語言.\n可用的語言: zh-tw (繁體中文), en (English)\n```')
                  .addField('群組默認語言: ' + gconf.languages.guild, '```\n' + msg.guild.prefix + 'config language guild [language]' + '\n```')
                  .addField('個人默認語言: ' + (gconf.languages.personal[msg.author.id] ? gconf.languages.personal[msg.author.id] : "❌ 未自訂"), '```\n' + msg.guild.prefix + 'config language personal [language]' + '\n```')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
          } else if (args[1] === 'guild') {
            if (!isAdmin()) return

            if (!['zh-tw', 'en'].includes(args[2])) return invalid()

            gdata.languages.guild = args[2].toLowerCase()
            await db.set(msg.guild.id, gdata)
            return done()
          } else if (args[1] === 'personal') {
            if (!['zh-tw', 'en'].includes(args[2])) return invalid()

            gdata.languages.personal[msg.author.id] = args[2].toLowerCase()
            await db.set(msg.guild.id, gdata)
            return done()
          }
          break
        case "preview":
          if (!args[1]) {
            return msg.channel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle('💎 Preview')
                  .setColor('2323F7')
                  .setThumbnail(msg.guild.iconURL())
                  .setDescription('```\n此選項可開啟 Kristen 的預覽版模式, 以下功能會被啟用:\nSlash Commands,\nContext Menu,\n請注意, Slash Commands 的簡介會受到該伺服器所設置的語言影響!\n```')
                  .addField('狀態: ' + (gdata.preview.enable ? "✅ 已啟用!" : "❌ 未啟用!"), '```\n' + msg.guild.prefix + 'config preview enable' + '\n```')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              ]
            })
          } else if (args[1] === 'enable') {
            if (!isAdmin()) return
            if (gdata.preview.enable) return msg.channel.send(new MessageEmbed().setTitle('\:x: 您無法關閉預覽版, 請聯繫機器人擁有者.').setColor('FF0727').setFooter(config.footer, bot.user.displayAvatarURL()))
            else {
              var promptEmbed = new MessageEmbed()
                .setTitle('🔨 您真的要啟用預覽版嘛? ')
                .setDescription('請注意此操作不可逆, 且我們尚未測試斜線指令的穩定性!')
                .setColor('FFFF07')
                .setFooter(config.footer, bot.user.displayAvatarURL())

              var buttons = [
                new MessageButton()
                  .setLabel('❌ 取消')
                  .setStyle('DANGER')
                  .setCustomId('n'),
                new MessageButton()
                  .setLabel('✅ 確定')
                  .setStyle('SUCCESS')
                  .setCustomId('y')
              ]

              var m = await msg.channel.send({ embeds: [promptEmbed], components: [new MessageActionRow().addComponents(buttons)] })

              const collector = m.createMessageComponentCollector({ filter: menu => menu.user.id === msg.author.id, time: 60000, errors: ['time'] })
              collector.on('collect', async (button) => {
                switch (button.customId) {
                  case 'n':
                    return collector.stop('cancel')
                  case 'y':
                    const rest = new REST({ version: '9' }).setToken(bot.token);
                    const slashes = []
                    const menus = []
                    for (const command of bot.commands.values()) {
                      var rCmd = command[gdata.languages.guild]
                      if (!rCmd.slash) {
                        slashes.push((new SlashCommandBuilder().setName(rCmd.name).setDescription(rCmd.description)).toJSON())
                      } else {
                        slashes.push(rCmd.slash.toJSON())
                      }
                    }

                    var menusInBot = bot.menus.get(gconf.languages.guild)

                    for (const menu of menusInBot) {
                      menus.push({ name: menu.name, type: 3 }) 
                    }

                    await rest.put(
                      Routes.applicationGuildCommands(bot.user.id, msg.guild.id),
                      { body: slashes.concat(menus) }
                    )

                    gdata.preview.enable = true
                    await db.set(msg.guild.id, gdata)
                    await done()
                    return collector.stop('done')
                }
              })
              collector.once('end', () => {
                m.delete()
              })
            }
          }
          break
        default:
          msg.channel.send({
            embeds: [
              new MessageEmbed()
                .setTitle('控制面板')
                .setThumbnail(msg.guild.iconURL())
                .setColor('FFFF23')
                .addFields(
                  { name: '🗝️ Prefix', value: `${((gconf.prefix.personal[msg.author.id] ?? gconf.prefix.value) ? ':o: 已自訂' : ':x: 未自訂')}\n\`${dpre}config prefix\``, inline: true },
                  { name: '🗺️ Language', value: '🇹🇼 繁體中文\n`' + dpre + 'config language`', inline: true },
                  { name: '💳 Premium', value: `${(gconf.premium.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config premium\``, inline: true },
                )
                .addFields(
                  { name: '🎶 DJ', value: `${(gconf.dj.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config dj\``, inline: true },
                  { name: '🚷 DJ Only', value: `${(gconf.djonly.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config djonly\``, inline: true },
                  { name: '🔄 Max Queue length', value: `${(gconf.maxqueue.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config maxqueue\``, inline: true },
                )
                .addFields(
                  { name: '🔈 Show Songs Infomation', value: `${(gconf.notifysongs.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config notifysongs\``, inline: true },
                  { name: '⛔ Blacklist', value: `${(gconf.blacklist.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config blacklist\``, inline: true },
                  { name: '💎 Preview', value: `${(gconf.preview.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config preview\``, inline: true },
                )
                .setFooter(config.footer, bot.user.displayAvatarURL())
            ]
          })
          break
      }
    } catch (e) {
      bot.botLogger.showErr(e)
    }
  }
}
