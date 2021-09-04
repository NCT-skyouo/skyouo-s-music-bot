const fetch = require("node-fetch");

module.exports =  {
    name: 'Bot List Poster | 機器列表',
	enable: false,
	author: 'NCT skyouo',
	version: '1.0.0',
	api: ['*'],
	support: ['6.0.0'],
	requires: [],
	Plugin: class {
		constructor(bot, api) {
			this.logger = api.getLoggerInstance('插件-機器列表');
			this.status = 'load';
			this.bot = bot;
			this.api = api;
			this.configs = {
                website: "https://top.gg/"
            };
		}
		onLoad() {
			this.status = "active"
		}

		onEnable() {}

		onDisable() {}
    }
}