const { MessageActionRow, MessageButton } = require('discord.js');

const buttons = {
	'zh-tw': {
		'start': [
			new MessageButton()
				.setStyle('DANGER')
				.setLabel('❌')
				.setCustomId('end'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('🏠')
				.setCustomId('home')
				.setDisabled(true),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('◀️')
				.setCustomId('previous')
				.setDisabled(true),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('▶️')
				.setCustomId('next'),
		],
		'middle': [
			new MessageButton()
				.setStyle('DANGER')
				.setLabel('❌')
				.setCustomId('end'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('🏠')
				.setCustomId('home'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('◀️')
				.setCustomId('previous'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('▶️')
				.setCustomId('next'),
		],
		'final_page': [
			new MessageButton()
				.setStyle('DANGER')
				.setLabel('❌')
				.setCustomId('end'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('🏠')
				.setCustomId('home'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('◀️')
				.setCustomId('previous'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('▶️')
				.setCustomId('next')
				.setDisabled(true),
		]
	},
	'en': {
		'start': [
			new MessageButton()
				.setStyle('DANGER')
				.setLabel('❌')
				.setCustomId('end'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('🏠')
				.setCustomId('home')
				.setDisabled(true),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('◀️')
				.setCustomId('previous'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('▶️')
				.setCustomId('next'),
		],
		'middle': [
			new MessageButton()
				.setStyle('DANGER')
				.setLabel('❌')
				.setCustomId('end'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('🏠')
				.setCustomId('home'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('◀️')
				.setCustomId('previous'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('▶️')
				.setCustomId('next'),
		],
		'final_page': [
			new MessageButton()
				.setStyle('DANGER')
				.setLabel('❌')
				.setCustomId('end'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('🏠')
				.setCustomId('home'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('◀️')
				.setCustomId('previous'),
			new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('▶️')
				.setCustomId('next')
				.setDisabled(true),
		]
	}
}


module.exports = {
	name: 'BetterHelp',
	id: 'better-help',
	description: "讓您的 v6 機器人的幫助選單不再那麼古板, 單調,\n使用可操作式的選單, 確保用戶不會需要打數次指令才能瀏覽完 Kristen 的指令列表.",
	enable: true,
	author: 'NCT skyouo',
	version: '1.3.0',
	api: ['2.0.0'],
	support: ['6.0.0', '6.0.0 Preview', '6.0.1'],
	requires: ['discord.js'],
	Plugin: class {
		constructor(bot, api) {
			this.logger = api.getLoggerInstance('插件-幫助選單');
			this.status = 'load';
			this.bot = bot;
			this.api = api;
			this.configs = {};
		}
		onLoad() {
			var self = this;
			if (!this.bot.commands || !this.bot.config) {
				this.logger.warn("您必須要開啟設置 'allowCommandAccess', 'allowImportantConfigsAccess' 才能使用該插件!");
				this.status = 'fail';
				return;
			}
			if (!this.bot.config.help) {
				this.logger.warn("由於沒有在設定中啟用 'help', 所以該插件無法啟動!");
				this.status = 'fail';
				return;
			}
			this.api.unregisterCommand('help');
			var help = async (bot, msg, args) => {
				var temp = {};
				bot.commands.map(cmd => {
					temp[cmd[msg.author.language].category]
						? temp[cmd[msg.author.language].category].push(cmd[msg.author.language])
						: (temp[cmd[msg.author.language].category] = [cmd[msg.author.language]]);
					return cmd;
				});
				const embed = new bot.MessageEmbed()
					.setColor('RANDOM')
					.setFooter(bot.config.footer, bot.user.displayAvatarURL());

				var 全頁面 = /*Object.keys(temp)*/ this.api.getCategories();

				var 總頁數 = 全頁面.length;

				var 初始頁面 = 1;

				var 目前頁面 = 1;

				var 目前內容 = temp[全頁面[初始頁面 - 1]];

				目前內容.forEach(cmd => {
					embed.addField(msg.guild.prefix + cmd.name, cmd.description);
				});

				embed.setTitle(全頁面[目前頁面 - 1])

				// var message = await msg.channel.send(embed);

				const start = new MessageActionRow().addComponents(...buttons[msg.author.language]['start'])
				const middle = new MessageActionRow().addComponents(...buttons[msg.author.language]['middle'])
				const final_page = new MessageActionRow().addComponents(...buttons[msg.author.language]['final_page'])

				var message = await msg.channel.send(
					{ embeds: [embed], components: [start] }
				)

				const collector = message.createMessageComponentCollector({ filter: menu => menu.user.id === msg.author.id, time: 60000, errors: ['time'] })

				collector.on('collect', async (button) => {
					await button.deferUpdate();
					embed.fields = [];
					switch (button.customId) {
						case 'end':
							collector.stop('用戶要求停止');
							break;
						case 'home':
							目前頁面 = 初始頁面;
							目前內容 = temp[全頁面[初始頁面 - 1]];

							目前內容.forEach(cmd => {
								embed.addField(msg.guild.prefix + cmd.name, cmd.description);
							});

							embed.setTitle(全頁面[目前頁面 - 1])

							await message.edit({ embeds: [embed], components: [start] });
							break;
						case 'next':
							if (目前頁面 + 1 > 總頁數) return;
							目前頁面++;
							目前內容 = temp[全頁面[目前頁面 - 1]];

							目前內容.forEach(cmd => {
								embed.addField(msg.guild.prefix + cmd.name, cmd.description);
							});

							embed.setTitle(全頁面[目前頁面 - 1])

							if (目前頁面 === 總頁數) {
								await message.edit({ embeds: [embed], components: [final_page] });
							} else {
								await message.edit({ embeds: [embed], components: [middle] });
							}
							break;
						case 'previous':
							if (目前頁面 - 1 < 初始頁面) return;
							目前頁面--;
							目前內容 = temp[全頁面[目前頁面 - 1]];

							目前內容.forEach(cmd => {
								embed.addField(msg.guild.prefix + cmd.name, cmd.description);
							});

							embed.setTitle(全頁面[目前頁面 - 1])

							if (目前頁面 === 初始頁面) {
								await message.edit({ embeds: [embed], components: [start] });
							} else {
								await message.edit({ embeds: [embed], components: [middle] });
							}
							break;
					}
				})

				collector.on('end', async () => {
					await message.delete()
				})
			};
			this.api.registerCommand(
				'help',
				{
					category: 'utility',
					description: '獲得指令幫助!',
					aliases: []
				},
				help,
				"zh-tw"
			);
			this.api.registerCommand(
				'help',
				{
					category: 'utility',
					description: 'Show the help menu!',
					aliases: []
				},
				help,
				"en"
			);
			this.status = "active"
		}

		onEnable() { }

		onDisable() { }
	}
};
