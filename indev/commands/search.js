module.exports = {
  name: "search",
  aliases: [],
  run: async(bot, msg, args) => {
    const { player, MessageEmbed, config } = bot;
    try {
			if (!args[0]) {
				throw new Error(`沒有提供歌曲名稱!\n用法: ${prefix}search (歌曲名稱)`);
			} else if (!msg.member.voice.channel) {
				throw new Error(`您尚未加入任何一個語音頻道!`);
			} else if (
				msg.member.voice.channel &&
				msg.guild.me.voice.channel &&
				msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
			) {
				throw new Error('您必須要與機器人在同一個語音頻道!');
			}
			let res = await player.searchTracks(args.join(' '), true);
			res = res.slice(0, 10);
			let randint = (x, y) => {
				return Math.floor(Math.random() * (y - x + 1)) + x;
			};
			let embed = new MessageEmbed()
			  .setAuthor("請輸入 1-10 來選擇你想要的歌曲", msg.guild.iconURL())
			  .setColor("FFE007")
			  .setDescription("```" + res.map((track, i) => {
			    return `${i+1}. ${track.name}`
			  }).join("\n") + "```")
			  .setFooter(config.footer, bot.user.displayAvatarURL())
			msg.channel.send(embed).then(m => {
				msg.channel
					.awaitMessages(
						me =>
							me.author.id === msg.author.id &&
							parseInt(me) > 0 &&
							parseInt(me) < 11,
						{ max: 1, time: 30000, errors: ['time'] }
					)
					.then(async collected => {
						if (!player.isPlaying(msg.guild.id)) {
							const song = await player.play(
								msg.member.voice.channel,
								res[(parseInt(collected.first().content) - 1)],
								msg.author.tag
							); // 播放音樂

							if (song.type === 'playlist') {
								msg.channel.send(
									new MessageEmbed()
										.setAuthor('🎶 目前播放', msg.guild.iconURL())
										.setColor('FFEE23')
										.setImage(song.tracks[0].thumbnail)
										.addField(
											'目前播放',
											`[${song.tracks[0].name}](${song.tracks[0].url})`
										)
										.addField('歌曲時長', song.tracks[0].duration)
										.addField('請求者', song.tracks[0].requestedBy)
										.addField('清單長度', song.tracks.length)
										.setFooter(config.footer, bot.user.displayAvatarURL())
								);
							} else {
								msg.channel.send(
									new MessageEmbed()
										.setAuthor('🎶 目前播放', msg.guild.iconURL())
										.setColor('FFEE23')
										.setImage(song.thumbnail)
										.addField('目前播放', `[${song.name}](${song.url})`)
										.addField('歌曲時長', song.duration)
										.addField('請求者', song.requestedBy)
										.setFooter(config.footer, bot.user.displayAvatarURL())
								);
							}

							player
								.getQueue(msg.guild.id)
								.on('end', () => {
									// 結束所有播放時...
									msg.channel.send(
										new MessageEmbed()
											.setAuthor('🎶 | 播放完畢!', msg.guild.iconURL())
											.setColor('FF2323')
											.setFooter(config.footer)
											.setImage(
												'https://cdn.discordapp.com/attachments/689072112069247026/754530841631260692/bye-bye-pikachu-icegif.gif'
											)
									);
								})
								.on('trackChanged', (oldTrack, newTrack) => {
									// 播放下一首歌曲時
									msg.channel.send(
										new MessageEmbed()
											.setAuthor(
												'目前播放:' + newTrack.name,
												msg.guild.iconURL()
											)
											.setImage(newTrack.thumbnail)
											.setColor('FFE023')
											.addField(
												'歌曲名稱',
												`[${newTrack.name}](${newTrack.url})`
											)
											.addField('歌曲時長', newTrack.duration)
											.addField('請求者', newTrack.requestedBy)
											.setFooter(config.footer, bot.user.displayAvatarURL())
									);
								})
								.on('channelEmpty', () => {
									// 頻道沒人時....
									msg.channel.send('沒人了qwq');
								});
						} else {
							const song = await player.addToQueue(
								msg.guild.id,
								args.join(' '),
								msg.author.tag
							);

							msg.channel.send(
								new MessageEmbed()
									.setAuthor(
										song.name + ' 已經被添加至隊列了!',
										msg.guild.iconURL()
									)
									.setColor('FFE023')
									.setImage(song.thumbnail)
									.addField('歌曲', `[${song.name}](${song.url})`)
									.addField('時長', song.duration)
									.addField('請求者', song.requestedBy)
									.setFooter(config.footer, bot.user.displayAvatarURL())
							);
						}
					})
					.catch(() => {
						m.edit(
							new MessageEmbed()
								.setAuthor('已失效', msg.guild.iconURL())
								.setColor('FF0023')
								.setFooter(config.footer, bot.user.displayAvatarURL())
						);
						return;
					});
			});
		} catch (e) {
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 無法播放', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e.toString() + '```')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		}
  }
}