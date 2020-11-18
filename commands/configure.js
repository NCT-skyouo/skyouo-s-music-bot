module.exports = {
  name: 'configure',
  description: '調整伺服器設置',
  aliases: ['config', 'conf', 'cfg', 'cf'],
  run: async (bot, msg, args) => {
    try {
      const { MessageEmbed, config, db } = bot

      function isAdmin () {
        const member = msg.member
        if (!member.hasPermission('ADMINISTRATOR') && !member.hasPermission('MANAGE_GUILD')) {
          msg.channel.send(
            new MessageEmbed()
              .setTitle('權限不足')
              .setColor('FF0230')
              .addField('權限不足', '你必須要有 `ADMINISTRATOR` 或 `MANAGE_GUILD` 才能修改設置!')
              .setFooter(config.footer, bot.user.displayAvatarURL())
          )
          return false
        }
        return true
      }

      function notFound (any, embed) {
        if (!any) {
          msg.channel.send(
            embed
              .setTitle("找不到該用戶!")
              .setColor("FF0230")
              .setFooter(config.footer, bot.user.displayAvatarURL())
          )
          return true
        }
        return false
      }

      function done () {
        return msg.channel.send(
          new MessageEmbed()
            .setTitle('設置成功!')
            .setColor('FFEE07')
            .setFooter(config.footer, bot.user.displayAvatarURL())
        )
      }

      Array.prototype.remove = function (item) {
        const index = this.indexOf(item)
        if (index > -1) {
          this.splice(index, 1)
        }
        return this
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
            return msg.channel.send(
              new MessageEmbed()
                .setTitle('前輟 (Prefix)')
                .setColor('2323F7')
                .setThumbnail(msg.guild.iconURL())
                .addField('目前的 Prefix: ' + msg.guild.prefix, '`' + msg.guild.prefix + 'config prefix [prefix]' + '`', true)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            )
            // show the prefix
          } else {
            if (!isAdmin()) return

            gdata.prefix.value = args[1].toLowerCase()
            await db.set(msg.guild.id, gdata)
            msg.channel.send(
              new MessageEmbed()
                .setTitle('設置成功!')
                .setColor('FFEE07')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            )
          }
          break
        case 'dj':

          if (!args[1]) {
            const enable = gdata.dj.enable
            let embed = new MessageEmbed()
              .setTitle('DJ')
              .setColor('FFEE07')
              .setThumbnail(msg.guild.iconURL())
              .setDescription('DJ 權限, \n可以讓有權限的人強制執行任何操作, \n因此請不要輕易給他人權限!')
              .addField('狀態', enable ? '開啟' : '關閉')

            if (enable) {
              embed = embed
                .addField('有DJ權限的人', (gdata.dj.people.length > 0 ? gdata.dj.people.length > 20 ? gdata.dj.people.slice(0, 20).join(', ') + '...' : gdata.dj.people.join(', ') : '暫無') + '```')
                .addField('有DJ權限的身份組', '```' + (gdata.dj.list.length > 0 ? gdata.dj.list.length > 20 ? gdata.dj.list.slice(0, 20).join(', ') + '...' : gdata.dj.list.join(', ') : '暫無') + '```')
            }

            embed = embed.addField('添加(個人)', `\`${msg.guild.prefix}config dj add user [@user]\``)
            embed = embed.addField('添加(身份組)', `\`${msg.guild.prefix}config dj add role [@role]\``)
            embed = embed.addField('移除(個人)', `\`${msg.guild.prefix}config dj remove user [@user]\``)
            embed = embed.addField('移除(身份組)', `\`${msg.guild.prefix}config dj remove role [@role]\``)

            return msg.channel.send(embed)
          } else {
            if (args[1] === 'add') {
              if (!isAdmin()) return
              if (args[2] === 'user') {
                const embed = new MessageEmbed()
                  .setTitle('錯誤用法')
                  .setColor('FF0230')
                  .setDescription('你打的指令並不完整! [@user]')
                  .addField('正確用法', `\`${msg.guild.prefix}config dj add user [@user]\``)
                const user = msg.mentions.users.first()
                if (notFound(user, embed)) return
                if (gdata.dj.people.includes(user.id)) return
                gdata.dj.people.push(user.id)
                gdata.dj.enable = true
                await db.set(msg.guild.id, gdata)
                return done()
              } else if (args[2] === 'role') {
                const embed = new MessageEmbed()
                  .setTitle('錯誤用法')
                  .setColor('FF0230')
                  .setDescription('你打的指令並不完整! [@role]')
                  .addField('正確用法', `\`${msg.guild.prefix}config dj add role [@role]\``)
                const roles = msg.mentions.role.first()
                if (notFound(roles, embed) || msg.mentions.everyone) return
                if (gdata.dj.list.includes(roles.id)) return
                gdata.dj.list.push(roles.id)
                gdata.dj.enable = true
                await db.set(msg.guild.id, gdata)
                return done()
              } else return
            } else if (args[1] === 'remove') {
              if (!isAdmin()) return
              if (args[2] === 'user') {
                const embed = new MessageEmbed()
                  .setTitle('錯誤用法')
                  .setColor('FF0230')
                  .setDescription('你打的指令並不完整! [@user]')
                  .addField('正確用法', `\`${msg.guild.prefix}config dj remove user [@user]\``)
                const user = msg.mentions.users.first()
                if (notFound(user, embed)) return
                if (!gdata.dj.people.includes(user.id)) return
                gdata.dj.people.remove(user.id)
                if (gdata.dj.people.length === 0 && gdata.dj.list.length === 0) gdata.dj.enable = false
                await db.set(msg.guild.id, gdata)
                return done()
              } else if (args[2] === 'role') {
                const embed = new MessageEmbed()
                  .setTitle('錯誤用法')
                  .setColor('FF0230')
                  .setDescription('你打的指令並不完整! [@role]')
                  .addField('正確用法', `\`${msg.guild.prefix}config dj remove role [@role]\``)
                const roles = msg.mentions.role.first()
                if (notFound(roles, embed) || msg.mentions.everyone) return
                if (!gdata.dj.list.includes(roles.id)) return
                gdata.dj.list.remove(roles.id)
                if (gdata.dj.people.length === 0 && gdata.dj.list.length === 0) gdata.dj.enable = false
                await db.set(msg.guild.id, gdata)
                return done()
              } else return
            }
          }
        case 'blacklist':
          return
        case 'bl':
          return
        case 'premium':
          if (!args[1]) {
            return msg.channel.send(
              new MessageEmbed()
                .setTitle('高級版')
                .setColor('FFEE07')
                .setDescription('高級版包含了 8d, bass, karaoke, subboost, nightcore 等混聲, \n還有 download 高級功能, \n購買高級版也是對作者的一大支持, \n倘若您覺得這台機器人有幫助到你, \n您可以將該機器人分享給朋友或者購買高級版')
                .addField('狀態', (gdata.premium.enable ? '⭕ 已開啟' : '❌ 未開啟'))
            )
          } else if (args[1] === 'toggle') {
            if (msg.author.id !== config.ownerid) return msg.channel.send('無權限!')

            gdata.premium.enable = !gdata.premium.enable
            await db.set(msg.guild.id, gdata)
            return msg.channel.send((gdata.premium.enable ? '開啟' : '關閉') + '成功!')
          }
          break
        case 'djonly':
          if (!args[1]) {
            return msg.channel.send(
              new MessageEmbed()
                .setTitle('DJ 限定 (DJ only)')
                .setColor('2323F7')
                .setThumbnail(msg.guild.iconURL())
                .addField('目前 DJ only 的狀態: ' + (gconf.djonly.enable ? ':o: 已開啟' : ':x: 未開啟'), `\`\`\`${dpre}config djonly toggle\`\`\``, true)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            )
            // show the prefix
          } else if (args[1] === 'toggle') {
            if (!isAdmin()) return

            gdata.djonly.enable = !gdata.djonly.enable
            awaitdb.set(msg.guild.id, gdata)
            msg.channel.send(
              new MessageEmbed()
                .setTitle('設置成功!')
                .setColor('FFEE07')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            )
          }
          break
        case 'maxqueue':
          if (!args[1]) {
            return msg.channel.send(
              new MessageEmbed()
                .setTitle('最大隊列 (Max queue size)')
                .setColor('2323F7')
                .setThumbnail(msg.guild.iconURL())
                .addField('目前 Max Queue size 的狀態: ' + (gconf.maxqueue.enable ? ':o: 已開啟 - ' + gconf.maxqueue.value + ' 首最大上限' : ':x: 未開啟'), `\`\`\`${dpre}config maxqueue toggle | 開啟\n${dpre}config maxqueue set [歌單上限] | 設置上限\`\`\``, true)
                .setFooter(config.footer, bot.user.displayAvatarURL())
            )
            // show the prefix
          } else if (args[1] === 'toggle') {
            if (!isAdmin()) return

            gdata.maxqueue.enable = !gdata.maxqueue.enable
            await db.set(msg.guild.id, gdata)
            msg.channel.send(
              new MessageEmbed()
                .setTitle('設置成功!')
                .setColor('FFEE07')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            )
          } else if (args[1] === 'set') {
            if (!isAdmin()) return

            if (isNaN(parseInt(args[2]))) {
              return msg.channel.send(
                new MessageEmbed()
                  .setTitle('無效的設置!')
                  .setColor('FF2307')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              )
            } else if (Number(args[2]) < 1) {
              return msg.channel.send(
                new MessageEmbed()
                  .setTitle('無效的設置!')
                  .setColor('FF2307')
                  .setFooter(config.footer, bot.user.displayAvatarURL())
              )
            }
            gdata.maxqueue.value = Number(args[2])
            await db.set(msg.guild.id, gdata)
            msg.channel.send(
              new MessageEmbed()
                .setTitle('設置成功!')
                .setColor('FFEE07')
                .setFooter(config.footer, bot.user.displayAvatarURL())
            )
          }
          break
        default:
          msg.channel.send(
            new MessageEmbed()
              .setTitle('控制面板')
              .setThumbnail(msg.guild.iconURL())
              .setColor('FFFF23')
              .addFields(
                { name: '🎶 DJ', value: `${(gconf.dj.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config dj\``, inline: true },
                { name: '💳 Premium', value: `${(gconf.premium.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config premium\``, inline: true },
                { name: '🗝️ Prefix', value: `${(gconf.prefix.value ? ':o: 已自訂' : ':x: 未自訂')}\n\`${dpre}config prefix\``, inline: true }
              )
              .addFields(
                { name: '🚷 DJ Only', value: `${(gconf.djonly.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config djonly\``, inline: true },
                { name: '🔄 Max Queue length', value: `${(gconf.maxqueue.enable ? ':o: 已開啟' : ':x: 未開啟')}\n\`${dpre}config maxqueue\``, inline: true },
                { name: '🗺️ Language (即將到來)', value: '繁體中文\n`' + dpre + 'config language`', inline: true }
              )
              .setFooter(config.footer, bot.user.displayAvatarURL())
          )
          break
      }
    } catch (e) {
      bot.botLogger.showErr(e)
    }
  }
}
