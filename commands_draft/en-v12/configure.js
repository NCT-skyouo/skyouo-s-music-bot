module.exports = {
    name: 'configure',
    category: 'admin',
    description: 'Configure your server\'s settings',
    aliases: ['config', 'conf', 'cfg', 'cf'],
    run: async (bot, msg, args) => {
        try {
            const { MessageEmbed, config, db } = bot

            function isAdmin() {
                const member = msg.member
                if (!member.hasPermission('ADMINISTRATOR') && !member.hasPermission('MANAGE_GUILD')) {
                    msg.channel.send(
                        new MessageEmbed()
                            .setTitle('❌ Missing permission')
                            .setColor('FF0230')
                            .addField('Missing permission', 'You need `ADMINISTRATOR` or `MANAGE_GUILD` to config server settings!')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    )
                    return false
                }
                return true
            }

            function notFound(any, embed) {
                if (!any) {
                    msg.channel.send(
                        embed
                            .setTitle('❌ User not found!')
                            .setColor('FF0230')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    )
                    return true
                }
                return false
            }

            function invalid() {
                msg.channel.send(
                    new MessageEmbed()
                        .setTitle('❌ Invalid input!')
                        .setColor('FF0230')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                )
                return true
            }

            function done() {
                return msg.channel.send(
                    new MessageEmbed()
                        .setTitle('✅ Succesfully changed!')
                        .setColor('FFEE07')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                )
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
                      return msg.channel.send(
                        new MessageEmbed()
                          .setTitle('🗝️ Prefix')
                          .setColor('2323F7')
                          .setDescription('```\nPrefix, \nUsually a guild will invite some bots, \nin order to identify the bot, \nit\'s necessary to set an unique preifix for each bot.\n```')
                          .setThumbnail(msg.guild.iconURL())
                          // .addField('目前的 Prefix: ' + msg.guild.prefix, '```\n' + msg.guild.prefix + 'config prefix [prefix]' + '\n```', true)
                          .addField('群組默認 Prefix: ' + (gconf.prefix.guild ? gconf.prefix.guild : "❌ 未自訂") , '```\n' + msg.guild.prefix + 'config prefix guild [prefix]' + '\n```')
                          .addField('個人默認 Prefix: ' + (gconf.prefix.personal[msg.author.id] ? gconf.prefix.personal[msg.author.id] : "❌ 未自訂") , '```\n' + msg.guild.prefix + 'config prefix personal [prefix]' + '\n```')
                          .addField('重置', '```\n' + msg.guild.prefix + 'config prefix [guild/personal] reset' + '\n```')
                          .setFooter(config.footer, bot.user.displayAvatarURL())
                      )
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
                            .setDescription(`\`\`\`\nDJ permission, \nDJ permission grants users more access to ${bot.user.username}, \nthey can use commands that can only be used by administrators.\n\`\`\``)
                            .addField('Status', enable ? '⭕ **Enabled**' : '❌ **Disabled**')
                            .setFooter(config.footer, bot.user.displayAvatarURL())

                        if (enable) {
                            embed = embed
                                .addField('Users with DJ permission', (gdata.dj.people.length > 0 ? gdata.dj.people.length > 20 ? gdata.dj.people.slice(0, 20).join(', ') + '...' : gdata.dj.people.join(', ') : 'None') + '```')
                                .addField('Roles with DJ permission', '```' + (gdata.dj.list.length > 0 ? gdata.dj.list.length > 20 ? gdata.dj.list.slice(0, 20).join(', ') + '...' : gdata.dj.list.join(', ') : 'None') + '```')
                        }

                        embed = embed.addField('Add (User)', `\`\`\`\n${msg.guild.prefix}config dj add user [@user]\n\`\`\``)
                        embed = embed.addField('Add (Role)', `\`\`\`\n${msg.guild.prefix}config dj add role [@role]\n\`\`\``)
                        embed = embed.addField('Remove (User)', `\`\`\`\n${msg.guild.prefix}config dj remove user [@user]\n\`\`\``)
                        embed = embed.addField('Remove (Role)', `\`\`\`\n${msg.guild.prefix}config dj remove role [@role]\n\`\`\``)

                        return msg.channel.send(embed)
                    } else {
                        if (args[1] === 'add') {
                            if (!isAdmin()) return
                            if (args[2] === 'user') {
                                const embed = new MessageEmbed()
                                    .setTitle('❌ Invalid usage')
                                    .setColor('FF0230')
                                    .setDescription('The command you provided is incomplete! [@user]')
                                    .addField('Usage', `\`\`\`\n${msg.guild.prefix}config dj add user [@user]\n\`\`\``)
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                                const user = msg.mentions.users.first()
                                if (notFound(user, embed)) return
                                if (gdata.dj.people.includes(user.id)) return
                                gdata.dj.people.push(user.id)
                                gdata.dj.enable = true
                                await db.set(msg.guild.id, gdata)
                                return done()
                            } else if (args[2] === 'role') {
                                const embed = new MessageEmbed()
                                    .setTitle('❌ Invalid usage')
                                    .setColor('FF0230')
                                    .setDescription('The command you provided is incomplete! [@role]')
                                    .addField('Usage', `\`\`\`\n${msg.guild.prefix}config dj add role [@role]\n\`\`\``)
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                                const roles = msg.mentions.roles.first()
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
                                    .setTitle('❌ Invalid usage')
                                    .setColor('FF0230')
                                    .setDescription('The command you provided is incomplete! [@user]')
                                    .addField('Usage', `\`\`\`\n${msg.guild.prefix}config dj remove user [@user]\n\`\`\``)
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                                const user = msg.mentions.users.first()
                                if (notFound(user, embed)) return
                                if (!gdata.dj.people.includes(user.id)) return
                                gdata.dj.people = remove(gdata.dj.people, user.id)
                                if (gdata.dj.people.length === 0 && gdata.dj.list.length === 0) gdata.dj.enable = false
                                await db.set(msg.guild.id, gdata)
                                return done()
                            } else if (args[2] === 'role') {
                                const embed = new MessageEmbed()
                                    .setTitle('❌ Invalid usage')
                                    .setColor('FF0230')
                                    .setDescription('The command you provided is incomplete! [@role]')
                                    .addField('Usage', `\`\`\`\n${msg.guild.prefix}config dj remove role [@role]\n\`\`\``)
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
                    }
                case 'blacklist':
                    return
                case 'bl':
                    return
                case 'premium':
                    if (!args[1]) {
                        return msg.channel.send(
                            new MessageEmbed()
                                .setTitle('💳 Premium')
                                .setColor('FFEE07')
                                .setThumbnail(msg.guild.iconURL())
                                .setDescription('```\nPremium gives awesome perks such as (download, filters, party), \nif you\'re interested to subscribe to premium, use the commands below.\n```')
                                .addField('Status', (gdata.premium.enable ? '⭕ Enabled' : '❌ Disabled'))
                                .addField('Usage', '``' + msg.guild.prefix + 'config premium enable`` to enable v6 premium!')
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        )
                    } else if (args[1] === 'enable') {
                        // if (msg.author.id !== config.ownerid) return msg.channel.send('無權限!')
                        if (!isAdmin()) return
                        if (gdata.premium.enable) return msg.channel.send(new MessageEmbed().setTitle('❌ The server have turned on premium!').setColor('FF0000').setFooter(bot.user.displayAvatarURL(), bot.config.footer))

                        gdata.premium.enable = true
                        await db.set(msg.guild.id, gdata)
                        return done()
                    }
                    break
                case 'djonly':
                    if (!args[1]) {
                        return msg.channel.send(
                            new MessageEmbed()
                                .setTitle('🚷 DJ only')
                                .setColor('2323F7')
                                .setThumbnail(msg.guild.iconURL())
                                .setDescription(`\`\`\`\nIf you enable this option, only users with Administrator or DJ permission can use ${bot.user.username}!\n\`\`\``)
                                .addField('Status: ' + (gconf.djonly.enable ? '⭕ Enabled' : '❌ Disabled'), `\`\`\`${dpre}config djonly toggle\`\`\``, true)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        )
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
                        return msg.channel.send(
                            new MessageEmbed()
                                .setTitle('🔄 Max queue size')
                                .setColor('2323F7')
                                .setThumbnail(msg.guild.iconURL())
                                .setDescription('```\nThis option can change the max queue size of the server, users with Administrator or DJ permission can ignore this restriction.\n```')
                                .addField('Status: ' + (gconf.maxqueue.enable ? '⭕ Enabled - ' + gconf.maxqueue.value + ' songs limit' : '❌ Disabled'), `\`\`\`${dpre}config maxqueue toggle | To enable\n${dpre}config maxqueue set [max queue size] | set max limit\`\`\``, true)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        )
                        // show the prefix
                    } else if (args[1] === 'toggle') {
                        if (!isAdmin()) return

                        gdata.maxqueue.enable = !gdata.maxqueue.enable
                        await db.set(msg.guild.id, gdata)
                        return done()
                    } else if (args[1] === 'set') {
                        if (!isAdmin()) return

                        if (isNaN(parseInt(args[2]))) {
                            return msg.channel.send(
                                new MessageEmbed()
                                    .setTitle('❌ Invalid settings!')
                                    .setColor('FF2307')
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                            )
                        } else if (Number(args[2]) < 1) {
                            return msg.channel.send(
                                new MessageEmbed()
                                    .setTitle('❌ Invalid settings!')
                                    .setColor('FF2307')
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                            )
                        }
                        gdata.maxqueue.value = Number(args[2])
                        await db.set(msg.guild.id, gdata)
                        return done()
                    }
                    break
                case 'notifysongs':
                    if (!args[1]) {
                        return msg.channel.send(
                            new MessageEmbed()
                                .setTitle('🔈 Show Songs Infomation')
                                .setColor('2323F7')
                                .setThumbnail(msg.guild.iconURL())
                                .setDescription('```\nIf this option is enabled, \nwhen track changed, the bot will send the informations of new track!\n```')
                                .addField('Status: ' + (gconf.notifysongs.enable ? '⭕ Enabled' : '❌ Disabled'), `\`\`\`${dpre}config notifysongstoggle\`\`\``, true)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        )
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
                        return msg.channel.send(
                            new MessageEmbed()
                                .setTitle('🗺️ Language')
                                .setColor('2323F7')
                                .setThumbnail(msg.guild.iconURL())
                                .setDescription('```\nThe preferred language of guild/personal,\n You can use what language should be displayed to you / entire guild.\nValid Options: zh-tw (繁體中文), en (English)\n```')
                                .addField('Guild Default Language: ' + gconf.languages.guild, '```\n' + msg.guild.prefix + 'config language guild [language]' + '\n```')
                                .addField('Personal Perferred Language: ' + (gconf.languages.personal[msg.author.id] ? gconf.languages.personal[msg.author.id] : "❌ Not customized") , '```\n' + msg.guild.prefix + 'config language personal [language]' + '\n```')
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        )
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
                default:
                    msg.channel.send(
                        new MessageEmbed()
                            .setTitle('Control panel')
                            .setThumbnail(msg.guild.iconURL())
                            .setColor('FFFF23')
                            .addFields(
                                { name: '🎶 DJ', value: `${(gconf.dj.enable ? ':o: Enabled' : ':x: Disabled')}\n\`${dpre}config dj\``, inline: true },
                                { name: '💳 Premium', value: `${(gconf.premium.enable ? ':o: Enabled' : ':x: Disabled')}\n\`${dpre}config premium\``, inline: true },
                                { name: '🗝️ Prefix', value: `${(gconf.prefix.value ? ':o: Customized' : ':x: Not Customized')}\n\`${dpre}config prefix\``, inline: true }
                            )
                            .addFields(
                                { name: '🚷 DJ Only', value: `${(gconf.djonly.enable ? ':o: Enabled' : ':x: Disabled')}\n\`${dpre}config djonly\``, inline: true },
                                { name: '🔄 Max Queue length', value: `${(gconf.maxqueue.enable ? ':o: Enabled' : ':x: Disabled')}\n\`${dpre}config maxqueue\``, inline: true },
                                { name: '🗺️ Language', value: '🇺🇸 English\n`' + dpre + 'config language`', inline: true }
                            )
                            .addFields(
                                { name: '🔈 Show Songs Infomation', value: `${(gconf.notifysongs.enable ? ':o: Enabled' : ':x: Disabled')}\n\`${dpre}config notifysongs\``, inline: true }
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
