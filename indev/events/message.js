module.exports = (bot, msg) => {
  const prefix = msg.guild.prefix || "tut!"
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

	const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	
	if (!command) return;

  var cooldowns = bot.cooldowns;
	
	if (!cooldowns.has(command.name)) {
	  cooldowns.set(command.name, new bot.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(msg.author.id)) {
	  const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

	if (now < expirationTime) {
		  const timeLeft = (expirationTime - now) / 1000;
		  return msg.reply(`請等待 ${timeLeft.toFixed(1)} 秒後才能執行該指令.`);
	  }
  }
  
  timestamps.set(msg.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		bot.commands.get(command).run(bot, msg, args)
	} catch (e) {
	  bot.botLogger.warn(`發生錯誤, 在執行指令 ${commandName} 的時候發生錯誤!!!`)
	  bot.botLogger.notice(`該錯誤不會影響機器人進程!`)
	  bot.botLogger.showErr(e)
	}
}