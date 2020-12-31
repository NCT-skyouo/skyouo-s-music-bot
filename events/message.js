module.exports = async (bot, msg) => {
  let gdb = await bot.db.get(msg.guild.id)
  if (!gdb) {
    await bot.db.set(msg.guild.id, bot.config.defaultconfig)
    gdb = bot.config.defaultconfig
  }
  const preset = gdb.prefix || bot.config.defaultconfig.prefix
  msg.guild.prefix = preset.value || bot.config.prefix
  const prefix = msg.guild.prefix || bot.config.prefix

  bot.isDJPerm = np =>
    msg.member.hasPermission('MANAGE_ROLES') ||
    msg.guild.me.voice.channel.members.map(m => m.user.tag).length <= 2 ||
    np.requestedBy === msg.author.tag ||
    gdb.dj.people.includes(msg.author.id) ||
    gdb.dj.list.some(r => msg.member.role.map(r_ => r_.id).includes(r))

  if (msg.mentions.users.first() === bot.user && !bot.config.disableMentionForPrefix) {
    return msg.channel.send(
      new bot.MessageEmbed()
        .setTitle(bot.config.mentionForPrefixTitle)
        .setColor('FFE027')
        .setDescription('🎵 **我在這群的前輟是** `' + prefix + '`')
        .setFooter(bot.config.footer, bot.user.displayAvatarURL())
    )
  }
  if (!msg.content.toLowerCase().startsWith(prefix)) return
  const args = msg.content.slice(prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) return

  if (command.premium && !gdb.premium.enable && msg.author.id !== bot.config.ownerid) {
    return msg.channel.send(
      new bot.MessageEmbed()
        .setTitle('高級版限定')
        .setColor('FF0230')
        .setDescription(`目前這個指令是**__高級版__**限定喔, 使用 \`${msg.guild.prefix}config premium\` 來了解更多!`)
        .setFooter(
          bot.config.footer, bot.user.displayAvatarURL()
        )
    )
  }

  if (command.ownerOnly && msg.author.id !== bot.config.ownerid) {
    return msg.channel.send(
      new bot.MessageEmbed()
        .setTitle('存取遭拒')
        .setColor('FF0230')
        .setDescription(`該功能只能由擁有者使用!`)
        .setFooter(
          bot.config.footer, bot.user.displayAvatarURL()
        )
    )
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
      return msg.reply(`請等待 ${timeLeft.toFixed(1)} 秒後才能執行該指令.`)
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
