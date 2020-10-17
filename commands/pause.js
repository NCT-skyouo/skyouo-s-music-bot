module.exports = {
  name: "pause",
  description: "暫停隊列",
  aliases: ["ps"],
  run: async (bot, msg, args) => {
    try {
      const { player, MessageEmbed, config, isDJPerm } = bot;
      const queue = await player.getQueue(msg.guild.id);
      if (!queue.playing || !player.isPlaying) {
        throw new Error("目前沒有播放中的歌曲!")
      }
      if (!msg.member.voice.channel) {
				throw new Error(`您尚未加入任何一個語音頻道!`);
			} else if (
				msg.member.voice.channel &&
				msg.guild.me.voice.channel &&
				msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
			) {
				throw new Error('您必須要與機器人在同一個語音頻道!');
			}
			var np = await player.nowPlaying(msg.guild.id);
			if (
				!isDJPerm(np)
			)
				throw new Error('沒有權限暫停播放!');
			player.pause(msg.guild.id);
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('🎶 成功暫停播放', msg.guild.iconURL())
					.setColor('FFE023')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		} catch (e) {
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 無法暫停播放', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e.toString() + '```')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		}
  }
}