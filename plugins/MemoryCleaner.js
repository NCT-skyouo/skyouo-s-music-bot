module.exports = {
    name: "Memory Cleaner",
    id: "memory-cleaner",
    description: "想強制釋放記憶體嗎? MemoryCleaner 是您的不二選擇!",
    enable: true,
    author: "NCT skyouo",
    version: "1.0.1",
    api: ['*'],
    support: ['*'],
    requires: [],
    Plugin: class {
      constructor(bot, api) {
        this.logger = api.getLoggerInstance('插件-釋放資源')
        this.status = "load"
        this.bot = bot
        this.api = api
        this.configs = {
          plan: 0
           /*
           plan: 激進程度, 可填 0 到 5
           數字越小執行 GC 的速度越快,
           若填的不是 0 到 5 之間的數字,
           將會進行自動調適
          */
        }
      }
      onLoad() {
        const os = require('os')

        if (!global.gc) {
            require("v8").setFlagsFromString('--expose_gc')
            global.gc = require("vm").runInNewContext('gc')

            if (!global.gc) {
                this.logger.error("無法載入 GC!")
                return
            }
        }

        var task;

        switch (this.configs.plan) {
            case 0:
                task = setInterval(global.gc, 0.5 * 60 * 1000)
                break;
            case 1:
                task = setInterval(global.gc, 1 * 60 * 1000)  
                break;
            case 2:
                task = setInterval(global.gc, 5 * 60 * 1000)
                break;
            case 3:
                task = setInterval(global.gc, 10 * 60 * 1000)
                break;
            case 4:
                task = setInterval(global.gc, 30 * 60 * 1000)  
                break;
            case 5:
                task = setInterval(global.gc, 60 * 60 * 1000)
                break;
            default:
                // 
                task = setInterval(global.gc, Math.floor((1.1 - Math.round((os.totalmem() - os.freemem()) / os.totalmem())) * 5 * 60 * 1000))
                setInterval(() => {
                    if (task) clearInterval(task)
                    task = setInterval(global.gc, Math.floor((1.1 - Math.round((os.totalmem() - os.freemem()) / os.totalmem())) * 5 * 60 * 1000))
                }, 120 * 1000)
                break;
        }
        this.status = "active"
      }
  
      onEnable() {
        if (this.status === "active") this.logger.info("啟動成功!")
      }
  
      onDisable() { }
    }
  }