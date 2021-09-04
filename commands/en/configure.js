const { Permissions } = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');

// v13

module.exports = {
    name: 'configure',
    category: 'admin',
    description: 'Adjusts server settings',
    aliases: ['config', 'conf', 'cfg', 'cf'],
    slash: new SlashCommandBuilder()
        .setName('configure')
        .setDescription('Adjusts server settings')
        .addSubcommandGroup((group) =>
            group
                .setName('dj')
                .setDescription('Adjusts DJ permission settings.')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('adduser')
                        .setDescription('Grants a user DJ permission.')
                        .addUserOption(option => option.setName('user').setDescription('User you want to grant DJ permission to.').setRequired(true))
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('addrole')
                        .setDescription('Grants a role DJ permission.')
                        .addRoleOption(option => option.setName('role').setDescription('Role you want to grant DJ permission to.').setRequired(true))
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('removeuser')
                        .setDescription('Revoke a user\'s DJ permission.')
                        .addUserOption(option => option.setName('user').setDescription('User you want to revoke DJ permission to.').setRequired(true))
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('removerole')
                        .setDescription('Revoke a role\'s DJ permission.')
                        .addRoleOption(option => option.setName('role').setDescription('Role you want to revoke DJ pemrission to.').setRequired(true))
                )
        )
        .addSubcommandGroup((group) =>
            group
                .setName('premium')
                .setDescription('Adjusts the activation for premium version.')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('enable')
                        .setDescription('Enable premium version for free.')
                )
        )
        .addSubcommandGroup((group) =>
            group
                .setName('prefix')
                .setDescription('Changes the prefix of the server.')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('personal')
                        .setDescription('Set a unique prefix for yourself (Ignore this if you are using slash command).')
                        .addStringOption(option => option.setName('prefix').setDescription('Prefix (\'reset\' to reset the prefix).').setRequired(true))
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('guild')
                        .setDescription('Changes the server prefix (Ignore this if you are using slash command).')
                        .addStringOption(option => option.setName('prefix').setDescription('Prefix (\'reset\' to reset the prefix).').setRequired(true))
                )
        )
        .addSubcommandGroup((group) =>
            group
                .setName('djonly')
                .setDescription('Adjusts DJ only mode')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('toggle')
                        .setDescription('Toggles DJ only mode')
                )
        )
        .addSubcommandGroup((group) =>
            group
                .setName('maxqueue')
                .setDescription('Limit the maximum songs size of the queue')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('toggle')
                        .setDescription('Toggles enable/disable max queue size')
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('set')
                        .setDescription('Any amount above 1')
                        .addIntegerOption(option => option.setName('size').setDescription('This can limit the max tracks of queue, \nusers with DJ permissions will not be affected.').setRequired(true))
                )
        )
        .addSubcommandGroup((group) =>
            group
                .setName('language')
                .setDescription('Changes language for the server/personal')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('personal')
                        .setDescription('Changes your personal language')
                        .addStringOption(option => option.setName('language').setDescription('zh-tw/en').setRequired(true).addChoice('繁體中文', 'zh-tw').addChoice('English', 'en'))
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('guild')
                        .setDescription('Changes server language')
                        .addStringOption(option => option.setName('language').setDescription('zh-tw/en').setRequired(true).addChoice('繁體中文', 'zh-tw').addChoice('English', 'en'))
                )
        )
        .addSubcommandGroup((group) =>
            group.setName('blacklist')
                .setDescription('Manage blacklist for server.')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('add')
                        .setDescription('Add channel to blacklist.')
                        .addChannelOption(option => option.setName('target').setDescription('The channel you want to add to blacklist.').setRequired(true))
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('remove')
                        .setDescription('Remove channel from blacklist.')
                        .addChannelOption(option => option.setName('target').setDescription('The channel you want to remove from blacklist.').setRequired(true))
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
                            .setTitle('❌ Missing permissions')
                            .setColor('FF0230')
                            .addField('Missing permissions', 'You need `ADMINISTRATOR` or `MANAGE_GUILD` permission to change才能修改設置!')
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
                                    .setTitle("❌ User not found!")
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
                            .setTitle('❌ Invalid arguments')
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
                                .setTitle('✅ Successfully changed!')
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
                                    .setTitle('🗝️ Prefix')
                                    .setColor('2323F7')
                                    .setDescription('```\nPrefix, \nUsually there are many bots in a server. \nIn order to identify the bots, \n, it is necessary to set a unique prefix for each bot.\n```')
                                    .setThumbnail(msg.guild.iconURL())
                                    // .addField('目前的 Prefix: ' + msg.guild.prefix, '```\n' + msg.guild.prefix + 'config prefix [prefix]' + '\n```', true)
                                    .addField('Server prefix: ' + (gconf.prefix.guild ? gconf.prefix.guild : "❌ None"), '```\n' + msg.guild.prefix + 'config prefix guild [prefix]' + '\n```')
                                    .addField('Personal prefix: ' + (gconf.prefix.personal[msg.author.id] ? gconf.prefix.personal[msg.author.id] : "❌ None"), '```\n' + msg.guild.prefix + 'config prefix personal [prefix]' + '\n```')
                                    .addField('Reset', '```\n' + msg.guild.prefix + 'config prefix [guild/personal] reset' + '\n```')
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
                            .setDescription('```\nDJ permission, \nDJ permission grants user more access to the bot.\n```')
                            .addField('Current status', enable ? '⭕ **Enabled**' : '❌ **Not enabled**')
                            .setFooter(config.footer, bot.user.displayAvatarURL())

                        if (enable) {
                            embed = embed
                                .addField('Users with DJ permission', (gdata.dj.people.length > 0 ? gdata.dj.people.length > 20 ? gdata.dj.people.slice(0, 20).join(', ') + '...' : gdata.dj.people.join(', ') : 'None') + '```')
                                .addField('Roles with DJ permission', '```' + (gdata.dj.list.length > 0 ? gdata.dj.list.length > 20 ? gdata.dj.list.slice(0, 20).join(', ') + '...' : gdata.dj.list.join(', ') : 'None') + '```')
                        }

                        embed = embed.addField('Add (User)', `\`\`\`\n${msg.guild.prefix}config dj adduser [@user]\n\`\`\``)
                        embed = embed.addField('Add (Role)', `\`\`\`\n${msg.guild.prefix}config dj addrole [@role]\n\`\`\``)
                        embed = embed.addField('Remove (User)', `\`\`\`\n${msg.guild.prefix}config dj removeuser [@user]\n\`\`\``)
                        embed = embed.addField('Remove (Role)', `\`\`\`\n${msg.guild.prefix}config dj removerole [@role]\n\`\`\``)

                        return msg.channel.send({
                            embeds: [embed]
                        })
                    } else {
                        if (args[1] === 'adduser') {
                            if (!isAdmin()) return;
                            const embed = new MessageEmbed()
                                .setTitle('❌ Invalid usage')
                                .setColor('FF0230')
                                .setDescription('The command provided is incomplete! [@user]')
                                .addField('Usage', `\`\`\`\n${msg.guild.prefix}config dj adduser [@user]\n\`\`\``)
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
                                .setTitle('❌ Invalid usage')
                                .setColor('FF0230')
                                .setDescription('The command provided is incomplete! [@role]')
                                .addField('Usage', `\`\`\`\n${msg.guild.prefix}config dj addrole [@role]\n\`\`\``)
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
                                .setTitle('❌ Invalid usage')
                                .setColor('FF0230')
                                .setDescription('The command provided is incomplete! [@user]')
                                .addField('Usage', `\`\`\`\n${msg.guild.prefix}config dj removeuser [@user]\n\`\`\``)
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
                                .setTitle('❌ Invalid usage')
                                .setColor('FF0230')
                                .setDescription('The command provided is incomplete! [@role]')
                                .addField('Usage', `\`\`\`\n${msg.guild.prefix}config dj removerole [@role]\n\`\`\``)
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
                    return
                case 'bl':
                    return
                case 'premium':
                    if (!args[1]) {
                        return msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle('💳 Premium')
                                    .setColor('FFEE07')
                                    .setThumbnail(msg.guild.iconURL())
                                    .setDescription('```\nPremium gives awesome perks such as download, filters, party mode and many more. If you want to subscribe to premium, use the command below.\n```')
                                    .addField('Current status', (gdata.premium.enable ? '⭕ Enabled' : '❌ Not enabled'))
                                    .addField("Enable", "Use ``" + msg.guild.prefix + "config premium enable`` to subscribe Kristen v6!")
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                    } else if (args[1] === 'enable') {
                        // if (msg.author.id !== config.ownerid) return msg.channel.send('無權限!')
                        if (!isAdmin()) return
                        if (gdata.premium.enable) return msg.channel.send(new MessageEmbed().setTitle('❌ You have enabled premium!').setColor('FF0000').setFooter(bot.user.displayAvatarURL(), bot.config.footer))

                        gdata.premium.enable = true
                        await db.set(msg.guild.id, gdata)
                        return msg.channel.send('Successfully ' + (gdata.premium.enable ? 'enabled' : 'disabled') + ' premium!')
                    }
                    break
                case 'djonly':
                    if (!args[1]) {
                        return msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle('🚷 DJ only')
                                    .setColor('2323F7')
                                    .setThumbnail(msg.guild.iconURL())
                                    .setDescription('```\nWhen DJ only is enabled, only users with DJ permission/administratos can use the bot!\n```')
                                    .addField('Current DJ only status: ' + (gconf.djonly.enable ? '⭕ Enabled' : '❌ Not enabled'), `\`\`\`${dpre}config djonly toggle\`\`\``, true)
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
                                    .setTitle('🔄 Max queue size')
                                    .setColor('2323F7')
                                    .setThumbnail(msg.guild.iconURL())
                                    .setDescription('```\nThis command can limit the max songs size of the queue, \nusers with DJ permission/administrators will not be affected.\n```')
                                    .addField('Current Max Queue size status: ' + (gconf.maxqueue.enable ? '⭕ Enabled - ' + gconf.maxqueue.value + ' songs' : '❌ Not enabled'), `\`\`\`${dpre}config maxqueue toggle | enable\n${dpre}config maxqueue set [max queue limit] | to change the max queue size\`\`\``, true)
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
                                    .setTitle('Successfully changed!')
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
                                        .setTitle('❌ Invalid settings!')
                                        .setColor('FF2307')
                                        .setFooter(config.footer, bot.user.displayAvatarURL())
                                ]
                            })
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
                case "notifysongs":
                    if (!args[1]) {
                        return msg.channel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle('🔈 Show Songs Infomation')
                                    .setColor('2323F7')
                                    .setThumbnail(msg.guild.iconURL())
                                    .setDescription('```\nIf this option was enabled, when track changes, the bot will notify the song informations!\n```')
                                    .addField('Current Show Songs Information status: ' + (gconf.notifysongs.enable ? '⭕ Enabled' : '❌ Not enabled'), `\`\`\`${dpre}config notifysongstoggle\`\`\``, true)
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
                                    .setDescription('```\nYou can choose the language you want Kristen to show to you/server.\nAvailable languages: zh-tw (繁體中文), en (English)\n```')
                                    .addField('Server language: ' + gconf.languages.guild, '```\n' + msg.guild.prefix + 'config language guild [language]' + '\n```')
                                    .addField('Personal language: ' + (gconf.languages.personal[msg.author.id] ? gconf.languages.personal[msg.author.id] : "❌ None"), '```\n' + msg.guild.prefix + 'config language personal [language]' + '\n```')
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                    } else if (args[1] === 'guild') {
                        if (!isAdmin()) return

                        if (!['zh-tw', 'en'].includes(args[2])) return invalid()

                        gdata.languages.guild = /*args[2].toLowerCase()*/ 'zh-tw'
                        await db.set(msg.guild.id, gdata)
                        return done()
                    } else if (args[1] === 'personal') {
                        if (!['zh-tw', 'en'].includes(args[2])) return invalid()

                        gdata.languages.personal[msg.author.id] = /*args[2].toLowerCase()*/ 'zh-tw'
                        await db.set(msg.guild.id, gdata)
                        return done()
                    }
                    break
                case 'blacklist':
                    if (!args[1]) {
                        var embed = new MessageEmbed()
                            .setTitle('⛔ Blacklist Channel')
                            .setColor('2323F7')
                            .setThumbnail(msg.guild.iconURL())
                            .setDescription('```\nThis settings prevent Kristen from entering specific voice channel.\n```')
                            .addField('Current Blacklist Channel Status: ' + (gconf.blacklist.enable ? '⭕ Enabled' : '❌ Disabled'), `\`\`\`${dpre}config blacklist toggle\`\`\``, true)

                        if (gconf.blacklist.enable) {
                            embed = embed
                                .addField('Blacklisted Channels', '```\n' + (gconf.blacklist.channels.length ? (gconf.blacklist.channels.map(c => bot.channels.cache.get(c).name)).join('\n') : "Empty") + '\n```')
                        }

                        embed = embed.addField('Add channel to blacklist', `\`\`\`\n${msg.guild.prefix}config blacklist add [#channel]\n\`\`\``)
                            .addField('Remove channel from blacklist', `\`\`\`\n${msg.guild.prefix}config blacklist remove [#channel]\n\`\`\``)
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
                            .setTitle('❌ Invalid Usage')
                            .setColor('FF0230')
                            .addField('Usage', `\`\`\`\n${msg.guild.prefix}config blacklist add [#channel]\n\`\`\``)
                            .setFooter(config.footer, bot.user.displayAvatarURL())

                        const channel = msg.mentions.channels.first()
                        if (notFound(channel, embed)) return
                        if (channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE') return msg.channel.send(new MessageEmbed.setTitle('❌ This channel is not a voice channel or a stage channel!').setColor('FF0230').setFooter(config.footer, bot.user.displayAvatarURL()))
                        if (gdata.blacklist.channels.includes(channel.id)) return msg.channel.send(new MessageEmbed.setTitle('❌ This channel is already in blacklist!').setColor('FF0230').setFooter(config.footer, bot.user.displayAvatarURL()))
                        gdata.blacklist.channels.push(channel.id)
                        await db.set(msg.guild.id, gdata)
                        return done()
                    } else if (args[1] === 'remove') {
                        if (!isAdmin()) return
                        const embed = new MessageEmbed()
                            .setTitle('❌ Invalid Usage')
                            .setColor('FF0230')
                            .addField('Usage', `\`\`\`\n${msg.guild.prefix}config blacklist remove [#channel]\n\`\`\``)
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                        const channel = msg.mentions.channels.first()
                        if (notFound(channel, embed)) return
                        if (channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE') return msg.channel.send(new MessageEmbed.setTitle('❌ This channel is not a voice channel or a stage channel!').setColor('FF0230').setFooter(config.footer, bot.user.displayAvatarURL()))
                        if (!gdata.blacklist.channels.includes(channel.id)) return msg.channel.send(new MessageEmbed.setTitle('❌ This channel is not in blacklist!').setColor('FF0230').setFooter(config.footer, bot.user.displayAvatarURL()))
                        gdata.blacklist.channels = remove(gdata.blacklist.channels, channel.id)
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
                                    .setDescription('```\This options can enable some experiment features, The following features will be enable:\nSlash Commands,\nContext Menu.\n```')
                                    .addField('Status: ' + (gdata.preview.enable ? "✅ Enabled!" : "❌ Not Enabled!"), '```\n' + msg.guild.prefix + 'config preview enable' + '\n```')
                                    .setFooter(config.footer, bot.user.displayAvatarURL())
                            ]
                        })
                    } else if (args[1] === 'enable') {
                        if (!isAdmin()) return
                        if (gdata.preview.enable) return msg.channel.send(new MessageEmbed().setTitle('\:x: You cannot disable that, please contact bot owner .').setColor('FF0727').setFooter(config.footer, bot.user.displayAvatarURL()))
                        else {
                            var promptEmbed = new MessageEmbed()
                                .setTitle('🔨 Do you really want to enable experiment mode? ')
                                .setDescription('Please note that you cannot disable experiment mode after you enable it!')
                                .setColor('FFFF07')
                                .setFooter(config.footer, bot.user.displayAvatarURL())

                            var buttons = [
                                new MessageButton()
                                    .setLabel('❌ Cancel')
                                    .setStyle('DANGER')
                                    .setCustomId('n'),
                                new MessageButton()
                                    .setLabel('✅ Confirm')
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
                                .setTitle('Control panel')
                                .setThumbnail(msg.guild.iconURL())
                                .setColor('FFFF23')
                                .addFields(
                                    { name: '🎶 DJ', value: `${(gconf.dj.enable ? ':o: Enabled' : ':x: Not enabled')}\n\`${dpre}config dj\``, inline: true },
                                    { name: '💳 Premium', value: `${(gconf.premium.enable ? ':o: Enabled' : ':x: Not enabled')}\n\`${dpre}config premium\``, inline: true },
                                    { name: '🗝️ Prefix', value: `${((gconf.prefix.personal[msg.author.id] ?? gconf.prefix.value) ? ':o: Enabled' : ':x: Not enabled')}\n\`${dpre}config prefix\``, inline: true }
                                )
                                .addFields(
                                    { name: '🚷 DJ Only', value: `${(gconf.djonly.enable ? ':o: Enabled' : ':x: Not enabled')}\n\`${dpre}config djonly\``, inline: true },
                                    { name: '🔄 Max Queue length', value: `${(gconf.maxqueue.enable ? ':o: Enabled' : ':x: Not enabled')}\n\`${dpre}config maxqueue\``, inline: true },
                                    { name: '🗺️ Language', value: '`English`\n' + dpre + 'config language`', inline: true }
                                )
                                .addFields(
                                    { name: '🔈 Show Songs Infomation', value: `${(gconf.notifysongs.enable ? ':o: Enabled' : ':x: Not enabled')}\n\`${dpre}config notifysongs\``, inline: true }
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
