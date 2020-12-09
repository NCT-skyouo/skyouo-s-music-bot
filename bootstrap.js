const major = '0'
var minor = '6'
const patch = '0'
const commit = '0'
const version = `v5.${minor}.${patch}-c${commit}`
const codename = `Kristen`
global["v5"] = { version: version, codename: codename }
const config = require('./config/config.json')
const fetch = require('node-fetch')
const Logger = require('./libs/logger.js')
const Store = require("./libs/better-storing/index.js")()

const coreLogger = new Logger('核心進程', config.debug, config.ignore)

// 待做, 檢查資料夾
for (const folder of ['music/', 'music/resources/', 'music/local/', 'config/', 'config/databases/']) {
  const path = require('path').resolve(__dirname, folder)
  if (!require('fs').existsSync(path)) {
    coreLogger.notice('偵測到資料夾 ' + path + ' 尚未創建, 將會為您創建一個...')
    require('fs').mkdirSync(path)
  }
}
// 待做, 檢查依賴
let err = 0; let lacked = []
for (const dep of ['fs', 'discord.js', './config/config.json', './libs/logger.js', './libs/v5-core/index.js', 'ytdl-core', 'ytpl', 'ytsr', 'time-stamp']) {
  try {
    require(dep)
  } catch (e) {
    err++
    lacked.push(dep)
    coreLogger.showErr(e)
  }
}

if (err) { // 如果出現錯誤
  coreLogger.fatal('未安裝依賴!!')
  for (const line of lacked) coreLogger.error('缺少依賴: ' + line)
  process.exit(0)
}
// 待做, 檢查設置
let i = 0
lacked = []
let isAPIenable
for (const _ in config) {
  if (config[_] === undefined || config[_] === '') {
    i++
    lacked.push(_)
  }
  if (_ === 'searchProvider') {
    if (!(['API', 'Scraping'].includes(config[_]))) {
      coreLogger.error("\n設置錯誤! searchProvider 請填入 \n-\t'API' (使用 Google YouTube API v3)\n-\t'Scraping' (使用匿名抓取資料)")
      process.exit(1)
    }
    if (_ === 'API') isAPIenable = true
  }
  if (_ === 'APIKEY') {
    if (isAPIenable) {
      if (!config[_] || config[_] === '') {
        coreLogger.error('設置錯誤! APIKEY 請填入 API key 陣列!')
        process.exit(1)
      } else if (config[_].length === 0) {
        coreLogger.error('設置錯誤! APIKEY 不得為空陣列!')
        process.exit(1)
      }
    }
  }
}
if (i) {
  coreLogger.fatal('設置不完全!!')
  for (const line of lacked) coreLogger.error('缺少設置: ' + line)
  process.exit(1)
}
async function updater () {
  try {
    const res = await fetch('https://raw.githubusercontent.com/NCT-skyouo/skyouo-s-music-bot/master/version.json').catch((e) => { throw e })
    const info = await res.json().catch((e) => { throw e })
    const fetchedVer = `v5.${info.latest.minor}.${info.latest.patch}-c${info.latest.commit}`
    coreLogger.info("============= 更新日誌 =============")
    if (Number(info.latest.major) > Number(major)) {
      coreLogger.warn('該版本已嚴重過時! 請更新!!!')
      coreLogger.info('URL: https://github.com/NCT-skyouo/skyouo-s-music-bot')
      coreLogger.info('目前版本: ' + version)
      coreLogger.info('最新版本: ' + fetchedVer)
      coreLogger.info('新版內容: ' + info.latest.update_message)
    } else if (parseInt(info.latest.minor) > parseInt(minor)) {
      coreLogger.notice('該版本已過時! 請更新!')
      coreLogger.info('URL: https://github.com/NCT-skyouo/skyouo-s-music-bot')
      coreLogger.info('目前版本: ' + version)
      coreLogger.info('最新版本: ' + fetchedVer)
      coreLogger.info('新版內容: ' + info.latest.update_message)
    } else if (Number(info.latest.patch) > Number(patch) && Number(info.minor) <= Number(minor)) {
      coreLogger.info('有新版本! 請更新!')
      coreLogger.info('URL: https://github.com/NCT-skyouo/skyouo-s-music-bot')
      coreLogger.info('目前版本: ' + version)
      coreLogger.info('最新版本: ' + fetchedVer)
      coreLogger.info('新版內容: ' + info.latest.update_message)
    } else {
      coreLogger.info('目前已更新到最新版!!')
    }
    coreLogger.info("====================================")
  } catch (e) {
    coreLogger.showErr(e)
    coreLogger.warn('檢查版本失敗!')
  }
}
// 待做, 檢查版本
if (version.includes('dev')) {
  coreLogger.notice('請注意, 本版本是開發版, 所以會有部分指令/事件不穩定!!')
} else if (version.includes('pre-release')) {
  coreLogger.notice('請注意, 本版本是預發佈版, 所以會有部分指令/事件不穩定!!')
} else if (version.includes('beta')) {
  coreLogger.notice('請注意, 本版本是測試版, 所以會有部分指令/事件不穩定!!')
} else if (version.includes('release')) {
  coreLogger.notice('請注意, 本版本是公有版, unlicense 開源!!')
}
// 初始化數據庫
async function DatabaseTest() {
  coreLogger.info("開始測試數據庫!")
  coreLogger.info("正在測試 'configDB' 數據庫!")
  var middles = Store.getBulitInMiddle()
  try {
    Store.use(config.store.configDB.type.toUpperCase())
    var Database = Store.getStoringInstance()
    var opt = config.store.configDB[config.store.configDB.type]
    opt.startMiddle = middles.startJSON
    opt.endMiddle = middles.endJSON
    var configDB = new Database("configs", opt)
    var done = await configDB.has("init")
    if (!done) {
      await configDB.set("init", "true").catch((e) => { throw e })
      await configDB.remove("init").catch((e) => { throw e })
    }
  } catch (e) {
    coreLogger.fatal("'configDB' 數據庫測試失敗!")
    coreLogger.showErr(e)
    coreLogger.fatal("由於 'configDB' 數據庫測試失敗, 所以 v5 將不會啟動!")
    process.exit(1)
  }
  coreLogger.ok("'configDB' 數據庫測試通過!")
  coreLogger.info("正在測試 'songsDB' 數據庫!")
  try {
    Store.use(config.store.songsDB.type.toUpperCase())
    var Database = Store.getStoringInstance()
    var opt = config.store.songsDB[config.store.songsDB.type]
    opt.startMiddle = middles.startJSON
    opt.endMiddle = middles.endJSON
    var songsDB = new Database("songs", opt)
    var done = await songsDB.has("init")
    if (!done) {
      await songsDB.set("init", "true").catch((e) => { throw e })
      await songsDB.remove("init").catch((e) => { throw e })
    }
  } catch (e) {
    coreLogger.fatal("'songsDB' 數據庫測試失敗!")
    coreLogger.showErr(e)
    coreLogger.fatal("由於 'songsDB' 數據庫測試失敗, 所以 v5 將不會啟動!")
    process.exit(1)
  }
  coreLogger.ok("'songsDB' 數據庫測試通過!")
  coreLogger.ok("測試完畢!")
}

coreLogger.info("初始化完畢!")
// 待做, 開啟機器人
coreLogger.info('正在啟動 bot.js!')
try {
  require('./bot.js')
  updater()
  DatabaseTest()
} catch (e) {
  coreLogger.fatal('進程錯誤!!!')
  for (const line of e.toString().split('\n')) coreLogger.error(line)
  for (const line of e.stack.replace(e.toString(), '').split('\n')) coreLogger.trace(line)
  process.exit(1)
}
