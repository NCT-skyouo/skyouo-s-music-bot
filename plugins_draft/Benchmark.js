const fs = require('fs')
const crypto = require('crypto')
const { Worker } = require('worker_threads');

module.exports = {
	name: 'Benchmark | 基準測試',
	enable: false,
	author: 'NCT skyouo',
	version: '1.0.0',
	api: ['1.2.0'],
	support: ['6.0.0'],
	requires: [],
	Plugin: class {
		constructor(bot, api) {
			this.logger = api.getLoggerInstance('插件-基準測試');
			this.status = 'load';
			this.bot = bot;
			this.api = api;
			this.configs = {};
		}
		onLoad() {
            const result = {}
            // Hash test
            //result["md5"] = this.hashTest("md5", 1000000)
            //result["sha1"] =  this.hashTest("sha1", 1000000)
            //result["sha256"] =  this.hashTest("sha256", 1000000)
            //result["sha512"] =  this.hashTest("sha512", 1000000)
            // Multi Thread test
            // AES/RSA test
            // FFmpeg test (10 songs)
			this.status = "active"
		}

		onEnable() {}

		onDisable() {}

        hashTest(hashType, times) {
            let start = Date.now()
            while (times) {
                const hash = crypto.createHash(hashType)
                hash.update(crypto.randomBytes(512).toString("hex"))
                times--;
            }
            let end = Date.now()
            return Math.round(end - start)
        }

        workerTest() {
            const worker_counts = require("os").cpus().length
        }
	}
};

if (!module.parent) {
    new this.Plugin({}, { getLoggerInstance: () => {} })
}