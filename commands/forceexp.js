module.exports = {
  name: "forceexport",
  description: "強制用目前的隊列創建自製歌單",
  aliases: ["forceExp", "forceexp", "fexp"],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config, sdb } = bot;
    try {
      if (!player.isPlaying(msg.guild.id)) throw new Error('目前沒有正在播放的歌曲!');
      if (!msg.member.voice.channel) {
				throw new Error(`您尚未加入任何一個語音頻道!`);
			} else if (
				msg.member.voice.channel &&
				msg.guild.me.voice.channel &&
				msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
			) {
				throw new Error('您必須要與機器人在同一個語音頻道!');
			}
			if (!args[0]) {
			  throw new Error(`錯誤的用法!\n正確用法: ${msg.guild.prefix}export [歌單名稱]`)
			}
			let q = await player.getQueue(msg.guild.id)
			var allInfo = q.tracks.map(t => t.getAllInfo) || [];
			allInfo.unshift(q.playing.getAllInfo);
			sdb.set(`${msg.author.id}-${args[0]}`, allInfo);
			return msg.channel.send
			  (
			    new MessageEmbed()
			    .setTitle("⭕ 匯出成功!")
			    .setColor("FFEE07")
			    .setFooter(config.footer, bot.user.displayAvatarURL())
			 )
		} catch (e) {
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 在匯出時期發生錯誤', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e.toString() + '```')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		}
  }
}