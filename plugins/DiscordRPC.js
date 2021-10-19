const util = require('util')

const RPC = require('discord-rpc');
const client = new RPC.Client({ transport: 'ipc' });

module.exports = {
	name: 'Discord RPC',
	id: 'discord-rpc',
	description: "想要讓大家知道您正在使用 Kristen 嘛?\n那麼使用 Discord RPC 吧!",
	enable: true,
	author: 'NCT skyouo',
	version: '1.2.0',
	api: ['*'],
	support: ['6.0.0', '6.0.1'],
	requires: ['discord-rpc'],
	Plugin: class {
		constructor(bot, api) {
			this.logger = api.getLoggerInstance('插件-狀態顯示');
			this.status = 'load';
			this.bot = bot;
			this.api = api;
			this.configs = {
				'id': '744117844236828713',
				'locale': 'zh'
			};

			this.locales = {
				'en': {
					'rpc.start.details': 'Playing %s',
					'rpc.start.state': '%s',
					'rpc.start.LIT': 'Kristen v6',
					'rpc.start.SIT': 'Playing',
					'rpc.start.button.1': 'Click to watch/listen',
					'rpc.idle.details': 'Idling',
					'rpc.idle.state': 'Waiting to play next track...',
					'rpc.idle.SIT': 'Idling',
					'rpc.pause.details': 'Pausing',
					'rpc.pause.state': 'Playing %s (Pausing)',
					'rpc.pause.SIT': 'Pausing'
				},
				'zh': {
					'rpc.start.details': '正在播放 %s',
					'rpc.start.state': '%s',
					'rpc.start.LIT': 'Kristen v6',
					'rpc.start.SIT': '正在播放',
					'rpc.start.button.1': '點擊以 觀看/聆聽',
					'rpc.idle.details': '閒置中',
					'rpc.idle.state': '正在等待下一首曲目...',
					'rpc.idle.SIT': '閒置中',
					'rpc.pause.details': '暫停中',
					'rpc.pause.state': '%s (已暫停)',
					'rpc.pause.SIT': '暫停播放'
				}
			}
		}
		onLoad() {
			let startTime;

			if (!this.bot.player || !this.bot.users || !this.bot.config) {
				this.logger.warn("您必須要開啟設置 'allowImportantConfigsAccess', 'allowCacheAccess', 'allowListenEvents' 才能使用該插件!");
				this.status = 'fail';
				return;
			}

			let self = this;
			let bot = this.bot;
			self.bot.player.on('start', (q, t) => {
				startTime = Math.round(Date.now() / 1000);
				let connection = q.voiceConnection
				if (bot.channels.cache.get(connection.joinConfig.channelId).members.has(bot.config.ownerid)) {
					client.setActivity({
						details: util.format(self.locales[self.configs.locale]['rpc.start.details'], self.bot.player.extractor.getId(t.url).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')),
						state: util.format(self.locales[self.configs.locale]['rpc.start.state'], t.name),
						largeImageKey: 'dj-disk',
						smallImageKey: 'playing',
						largeImageText: self.locales[self.configs.locale]['rpc.start.LIT'],
						smallImageText: self.locales[self.configs.locale]['rpc.start.SIT'],
						startTimestamp: startTime,
						endTimestamp: t.durationMS != 0 ? startTime + Math.round(t.durationMS / 1000) : undefined,
						buttons: [
							{ label: self.locales[self.configs.locale]['rpc.start.button.1'], url: t.url }
						]
					})
				}
			})

			self.bot.player.on('trackChanged', (q, _, t) => {
				startTime = Math.round(Date.now() / 1000);
				let connection = q.voiceConnection
				if (bot.channels.cache.get(connection.joinConfig.channelId).members.has(bot.config.ownerid)) {
					client.setActivity({
						details: util.format(self.locales[self.configs.locale]['rpc.start.details'], self.bot.player.extractor.getId(t.url).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')),
						state: util.format(self.locales[self.configs.locale]['rpc.start.state'], t.name),
						largeImageKey: 'dj-disk',
						smallImageKey: 'playing',
						largeImageText: self.locales[self.configs.locale]['rpc.start.LIT'],
						smallImageText: self.locales[self.configs.locale]['rpc.start.SIT'],
						startTimestamp: startTime,
						endTimestamp: t.durationMS != 0 ? startTime + Math.round(t.durationMS / 1000) : undefined,
						buttons: [
							{ label: self.locales[self.configs.locale]['rpc.start.button.1'], url: t.url }
						]
					})
				}
			})

			self.bot.player.on('pause', onPause)
			self.bot.player.on('resume', onResume)

			self.bot.player.on('stop', onEnd)
			self.bot.player.on('end', onEnd)

			function onPause(queue, track) {
				startTime = Math.round(Date.now() / 1000);
				let connection = queue.voiceConnection
				if (bot.channels.cache.get(connection.joinConfig.channelId).members.has(bot.config.ownerid)) {
					const currentStreamTime = Math.round((queue.voiceConnection.dispatcher ? 
					queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime : 0) / 1000)

					const totalTime = track.durationMS
					client.setActivity({
						details: util.format(self.locales[self.configs.locale]['rpc.pause.details'], self.bot.player.extractor.getId(track.url).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')),
						state: util.format(self.locales[self.configs.locale]['rpc.pause.state'], track.name),
						largeImageKey: 'dj-disk',
						smallImageKey: 'pausing',
						largeImageText: self.locales[self.configs.locale]['rpc.start.LIT'],
						smallImageText: self.locales[self.configs.locale]['rpc.pause.SIT'],
						startTimestamp: startTime,
						buttons: [
							{ label: self.locales[self.configs.locale]['rpc.start.button.1'], url: track.url }
						]
					})
				}
			}

			function onResume(queue, track) {
				startTime = Math.round(Date.now() / 1000);
				let connection = queue.voiceConnection
				if (bot.channels.cache.get(connection.joinConfig.channelId).members.has(bot.config.ownerid)) {
					const currentStreamTime = Math.round((queue.voiceConnection.dispatcher ? 
						queue.voiceConnection.dispatcher.streamTime + queue.additionalStreamTime : 0) / 1000)
					const totalTime = track.durationMS
					client.setActivity({
						details: util.format(self.locales[self.configs.locale]['rpc.start.details'], self.bot.player.extractor.getId(track.url).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')),
						state: util.format(self.locales[self.configs.locale]['rpc.start.state'], track.name),
						largeImageKey: 'dj-disk',
						smallImageKey: 'playing',
						largeImageText: self.locales[self.configs.locale]['rpc.start.LIT'],
						smallImageText: self.locales[self.configs.locale]['rpc.start.SIT'],
						startTimestamp: startTime + (currentStreamTime),
						endTimestamp: startTime + (totalTime / 1000),
						buttons: [
							{ label: self.locales[self.configs.locale]['rpc.start.button.1'], url: track.url }
						]
					})
				}
			}

			function onEnd() {
				startTime = Math.round(Date.now() / 1000);
				client.setActivity({
					details: self.locales[self.configs.locale]['rpc.idle.details'],
					state: self.locales[self.configs.locale]['rpc.idle.state'],
					largeImageKey: 'dj-disk',
					smallImageKey: 'idle',
					largeImageText: self.locales[self.configs.locale]['rpc.start.LIT'],
					smallImageText: self.locales[self.configs.locale]['rpc.idle.SIT'],
					startTimestamp: startTime
				})
			}

			client.login({ clientId: this.configs.id }).then(onEnd)
			self.status = "active"
		}

		onEnable() { }

		onDisable() { }
	}
}