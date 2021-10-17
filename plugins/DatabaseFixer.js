module.exports = {
    name: "DatabaseFixer",
    id: "database-fixer",
    description: "什麼? 你說資料庫不兼容新版 v6? 立刻安排!",
    enable: true,
    author: "NCT skyouo",
    version: "1.0.0",
    api: ['*'],
    support: ['*'],
    requires: [],
    Plugin: class {
        constructor(bot, api) {
            this.logger = api.getLoggerInstance('插件-資料修復')
            this.status = "load"
            this.bot = bot
            this.api = api
            this.configs = {}
        }
        async onLoad() {
            var versionNum = this.api.version.split(".").reverse().map((v, i) => v ** (i * i)).reduce((a, b) => a + b)

            try {
                if (versionNum >= 17) { // api version >= 2.0.0
                    if (!this.api.hasPermissions(['allowDatabaseAccess', 'allowImportantConfigsAccess'])) {
                        this.logger.error("您需要先開啟 'allowDatabaseAccess', 'allowImportantConfigsAccess' 才能使用該插件!")
                        throw new Error("您需要先開啟 'allowDatabaseAccess', 'allowImportantConfigsAccess' 才能使用該插件!")
                    }
                }

                if (await this.bot.db.get("_DatabaseFixerLastestCheckVersion") >= versionNum) {
                    this.logger.info("資料庫已經是最新版本!")
                    throw new Error("資料庫已經是最新版本!")
                }

                var cdbAll = await this.bot.db.all()

                for (let k of Object.keys(cdbAll)) {
                    const v = cdbAll[k]
                    for (let o of Object.keys(this.bot.config.defaultconfig)) {
                        if (v[o] === undefined) {
                            this.logger.warn(`${k} 缺少 ${o}`)
                            v[o] = this.bot.config.defaultconfig[o]
                        }                    
                    }

                    this.bot.db.set(k, v)
                }

                this.bot.db.set("_DatabaseFixerLastestCheckVersion", versionNum)

                this.status = "active"
            } catch (e) {
                this.logger.showErr(e)
            }

        }


        onEnable() {
            if (this.status === "active") this.logger.info("啟動成功!")
        }

        onDisable() { }
    }
}