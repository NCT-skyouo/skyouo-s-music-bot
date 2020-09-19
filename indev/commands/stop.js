module.exports = {
  name: "stop",
  aliases: [],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config } = bot;
    try {
			if (!player.isPlaying(msg.guild.id))
				throw new Error('目前沒有正在播放的歌曲!');
			player.stop(msg.guild.id).catch(e => {
				throw e;
			});
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('🎶 暫停成功', msg.guild.iconURL())
					.setColor('FFE023')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		} catch (e) {
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 無法暫停', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e.toString() + '```')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		}
  }
}