module.exports = {
  name: "volume",
  aliases: [],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config } = bot;
    try {
			var np = await player.nowPlaying(msg.guild.id);
			if (!args[0])
				throw new Error(`沒有提供歌曲音量!\n用法: ${prefix}volume (音量)`);
			if (!isDJPerm(np)) throw new Error(`沒有權限跳過!`);
			if (isNaN(parseInt(args[0]))) throw new Error('無效的音量, 必須是數字!');
			if (Number(args[0]) > 150 || Number(args[0]) < 0)
				throw new Error('無效的音量, 範圍: 0-150');
			player.setVolume(msg.guild.id, parseInt(args[0]));
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('🎶 成功調整', msg.guild.iconURL())
					.setColor('FFE023')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		} catch (e) {
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 無法調整', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e.toString() + '```')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		}
  }
}