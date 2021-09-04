const { MessageEmbed, Permissions } = require("discord.js")
const { FakeMessage } = require('../libs/discord-js-v12-v13/index')

module.exports = async (bot, interaction) => {
    if (!interaction.isCommand() && !interaction.isContextMenu()) return;
    var msg = new FakeMessage(interaction)
    if (msg.author.bot) return
    if (!msg.guild) return /*await msg.author.send("別私訊我啦 uwu, 我會... 害羞 (,,・ω・,,)")*/;
    let gdb = await bot.db.get(msg.guild.id)
    if (!gdb) {
        await bot.db.set(msg.guild.id, bot.config.defaultconfig)
        gdb = bot.config.defaultconfig
    }

    msg.guild.prefix = (gdb.prefix.personal[msg.author.id] || gdb.prefix.guild) ?? bot.config.prefix

    bot.gdb = gdb

    let preferredLanguage = gdb.languages.personal[msg.author.id] ? gdb.languages.personal[msg.author.id] : gdb.languages.guild
    msg.author.language = msg.member.language = preferredLanguage

    if (interaction.isContextMenu()) {
        var realMsg = interaction.options?.getMessage('message')
        try {
            bot.menus.get(preferredLanguage).find(m => m.name === interaction.commandName).run(bot, msg, realMsg)
        } catch (e) {
            bot.botLogger.warn(`發生錯誤, 在執行指令 ${interaction.commandName} 的時候發生錯誤!!!`)
            bot.botLogger.notice('該錯誤不會影響機器人進程!')
            bot.botLogger.showErr(e)
        }
        return;
    }

    const args = msg.content.split(/ +/)
    const commandName = args.shift().toLowerCase()

    let command = (bot.commands.get(commandName) || bot.commands.find(cmd => cmd[preferredLanguage]?.aliases && cmd[preferredLanguage]?.aliases?.includes(commandName)))

    if (!command) return

    bot.isDJPerm = np =>
        msg.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES) ||
        msg.guild.me.voice.channel.members.map(m => m.user.tag).length <= 2 ||
        np.requestedBy === msg.author.tag ||
        gdb.dj.people.includes(msg.author.id) ||
        gdb.dj.list.some(r => msg.member.roles.map(r_ => r_.id).includes(r))

    command = command[preferredLanguage]

    if (command.premium && !gdb.premium.enable && msg.author.id !== bot.config.ownerid) {
        return msg.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle('高級版限定')
                    .setColor('FF0230')
                    .setDescription(`目前這個指令是**__高級版__**限定喔, 使用 \`${msg.guild.prefix}config premium\` 來了解更多!`)
                    .setFooter(
                        bot.config.footer, bot.user.displayAvatarURL()
                    )
            ]
        })
    }

    if (command.ownerOnly && msg.author.id !== bot.config.ownerid) {
        return msg.channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle('存取遭拒')
                    .setColor('FF0230')
                    .setDescription(`該功能只能由擁有者使用!`)
                    .setFooter(
                        bot.config.footer, bot.user.displayAvatarURL()
                    )
            ]
        })
    }

    const cooldowns = bot.cooldowns

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new bot.Collection())
    }

    const now = Date.now()
    const timestamps = cooldowns.get(command.name)
    const cooldownAmount = (command.cooldown || 3) * 1000

    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000
            return msg.channel.send({
                content: msg.author.toString(),
                embeds: [
                    new MessageEmbed()
                        .setTitle("⛔ Woah, 您好像有點太快了...")
                        .setColor("RED")
                        .setDescription(`\`\`\`\n為了避免濫用情況發生, \n該指令有 ${(cooldownAmount / 1000).toFixed(1)} 秒冷卻時間, \n\n只不過沒關係, \n您在 ${timeLeft.toFixed(1)} 秒後可以再次執行該指令!\n\`\`\``)
                        .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                ]
            })
        }
    }

    timestamps.set(msg.author.id, now)
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount)

    try {
        command.run(bot, msg, args)
    } catch (e) {
        bot.botLogger.warn(`發生錯誤, 在執行指令 ${commandName} 的時候發生錯誤!!!`)
        bot.botLogger.notice('該錯誤不會影響機器人進程!')
        bot.botLogger.showErr(e)
    }
}