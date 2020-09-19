module.exports = {
  name: "skip",
  aliases: [],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config } = bot;
    try {
			var np = await player.nowPlaying(msg.guild.id);
			if (
				!(
					msg.member.hasPermission('MANAGE_ROLES') ||
					(msg.member.voice.channel.members.map(m => m.user.tag).length <= 2 &&
						np.requestedBy === msg.author.tag)
				)
			)
				throw new Error('沒有權限跳過!');
			player.skip(msg.guild.id);
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('🎶 成功跳過', msg.guild.iconURL())
					.setColor('FFE023')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		} catch (e) {
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 無法跳過', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e.toString() + '```')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		}
  }
}