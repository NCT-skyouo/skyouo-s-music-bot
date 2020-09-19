const { Client, MessageEmbed, MessageAttachment } = require('discord.js');
const config = require('./music/config/config.json');
const bot = new Client({ disableEveryone: true });
const { Player } = require('./discord-player/index.js'); // npm i discord-player @discordjs/opus --save
const player = new Player(bot);
const fs = require('fs');
const ytdl = require('ytdl-core');

bot.on('ready', () => {
	console.log(bot.user.username + ' 已经上线了！');
});

bot.on('message', async msg => {
	const prefix = 'tut!';
	const isDJPerm = np =>
		msg.member.hasPermission('MANAGE_ROLES') ||
		msg.member.voice.channel.members.map(m => m.user.tag).length <= 2 ||
		np.requestedBy === msg.author.tag;
	const cmd = msg.content
		.toLowerCase()
		.slice(prefix.length)
		.split(' ')[0];

	const args = msg.content.split(' ').slice(1);
	if (!msg.content.startsWith(prefix) || !msg.guild || msg.author.bot) return;
	if (cmd === 'help') {
		return msg.channel.send(
			'Hello ' + msg.author.username + ', 目前这台机器人没有指令哦！'
		);
	} else if (cmd === 'play') {
		try {
			if (!args[0]) {
				throw new Error(`沒有提供歌曲名稱!\n用法: ${prefix}play (歌曲名稱)`);
			} else if (!msg.member.voice.channel) {
				throw new Error(`您尚未加入任何一個語音頻道!`);
			} else if (
				msg.member.voice.channel &&
				msg.guild.me.voice.channel &&
				msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
			) {
				throw new Error('您必須要與機器人在同一個語音頻道!');
			} // 如果用戶不在和機器人相同的語音頻道

			if (!player.isPlaying(msg.guild.id)) {
				const song = await player.play(
					msg.member.voice.channel,
					args.join(' '),
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
								.setAuthor('目前播放:' + newTrack.name, msg.guild.iconURL())
								.setImage(newTrack.thumbnail)
								.setColor('FFE023')
								.addField('歌曲名稱', `[${newTrack.name}](${newTrack.url})`)
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
						.setAuthor(song.name + ' 已經被添加至隊列了!', msg.guild.iconURL())
						.setColor('FFE023')
						.setImage(song.thumbnail)
						.addField('歌曲', `[${song.name}](${song.url})`)
						.addField('時長', song.duration)
						.addField('請求者', song.requestedBy)
						.setFooter(config.footer, bot.user.displayAvatarURL())
				);
			}
		} catch (e) {
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 無法播放', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e.toString() + '```')
					.setFooter(config.footer, bot.user.displayAvatarURL())
			);
		}
	} else if (cmd === 'stop') {
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
	} else if (cmd === 'skip') {
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
	} else if (cmd === 'volume') {
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
	} else if (cmd === 'search') {
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
	} else if (cmd === 'download') {
		if (!config.download) {
			const e = `ConfigError: 擁有者已經關閉該功能`;
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 無法下載', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e + '```')
					.setFooter('教學機器人', bot.user.displayAvatarURL())
			);
		}
		function download(song) {
			return new Promise((res, rej) => {
				msg.channel.send(
					new MessageEmbed()
						.setAuthor(`即將下載`, msg.guild.iconURL())
						.setImage(song.thumbnail)
						.setColor('FFE023')
						.addField('歌曲', `[${song.name}](${song.url})`)
						.addField('請求者', msg.author.tag)
						.setFooter('音樂, Music.', bot.user.displayAvatarURL())
				);
				const randint = (min, max) => Math.random() * (max - min + 1) + min;
				let vid = msg.author.id + '-' + randint(0, 9999999) + '.mp3';
				let fp = __dirname + '/music/resources/' + vid;
				const stream = ytdl(song.url, { quality: 'highestaudio' });
				stream.pipe(fs.createWriteStream(fp));
				stream.on('error', e => {
					return msg.channel.send(
						new MessageEmbed()
							.setTitle('❌ 無法下載', msg.guild.iconURL())
							.setColor('FF2323')
							.addField('錯誤訊息', '```' + e.toString() + '```')
							.setFooter('教學機器人', bot.user.displayAvatarURL())
					);
					res();
				});
				stream.on('end', () => {
					fs.readFile(fp, (err, buffer) => {
						if (err) throw err;
						if (buffer.length > 1024 * 1024 * 8) {
							msg.channel.send(`${msg.author}, 檔案過大!!!`).then(() => {
								fs.unlink(fp, function(err) {
									if (err) throw err;
								});
							});
							res();
							return;
						}
						const attachment = new MessageAttachment(buffer, 'music.mp3');
						msg.channel
							.send(`${msg.author}, 你的音樂已經下載成功!`, attachment)
							.then(() => {
								fs.unlink(fp, function(err) {
									if (err) throw err;
								});
							});
						res();
					});
				});
			});
		}
		try {
			const res = await player.searchTracks(args.join(' '));
			if (!res || res.length === 0) throw new Error('找不到該音樂!!');
			if (res.length > 1) {
				download(res[0]).catch(e => {
					throw e;
				});
			} else {
				download(res[0]).catch(e => {
					throw e;
				});
			}
		} catch (e) {
			return msg.channel.send(
				new MessageEmbed()
					.setTitle('❌ 無法下載', msg.guild.iconURL())
					.setColor('FF2323')
					.addField('錯誤訊息', '```' + e.toString() + '```')
					.setFooter('教學機器人', bot.user.displayAvatarURL())
			);
		}
	} else if (cmd === 'seek') {
		player
			.seek(msg.guild.id, args[0])
			.then(() => {
				msg.channel.send('成功!');
			})
			.catch(() => {});
	}
	return undefined;
});
bot.login(config.token);
