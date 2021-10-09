const major = '6'
var minor = '0'
const patch = '1'
const commit = '0'
const version = `v${major}.${minor}.${patch} ${commit !== '0' ? ` Commit ${commit}` : ""}`
const codename = `Fantasy`

global["v5"] = { version: version, codename: codename }
var config = require('./config/config.json')

const { fetch } = require('undici')
const fs = require('fs')
const resolve = require('path').resolve
const Logger = require('./libs/logger.js')
const coreLogger = new Logger('核心進程', config.debug, config.ignore, config.gmt.offset)

// 待做, 檢查資料夾
for (const folder of ['plugins/', 'music/', 'music/resources/', 'music/local/', 'config/', 'config/databases/']) {
  const path = resolve(__dirname, folder)
  if (!fs.existsSync(path)) {
    coreLogger.notice('偵測到資料夾 ' + path + ' 尚未創建, 將會為您創建一個...')
    fs.mkdirSync(path)
  }
}

// 待做, 檢查依賴
let lacked = []
for (const dep of ['fs', 'discord.js', './config/config.json', './libs/logger.js', './libs/v5-core/index.js', 'ytdl-core', 'ytpl', 'ytsr', 'time-stamp']) {
  try {
    require(dep)
  } catch (e) {
    lacked.push(dep)
    coreLogger.showErr(e)
  }
}

if (lacked.length) { // 如果出現錯誤
  coreLogger.fatal('未安裝依賴!!')
  for (const line of lacked) coreLogger.error('缺少依賴: ' + line)
  process.exit(0)
}
// 待做, 檢查設置

lacked = []
var isAPIenable
for (const key in config) {
  if (config[key] == undefined || config[key] === "") {
    lacked.push(key)
    continue;
  }
  if (key === 'searchProvider') {
    if (!(['API', 'Scraping'].includes(config[key]))) {
      coreLogger.error("\n設置錯誤! searchProvider 請填入 \n-\t'API' (使用 Google YouTube API v3)\n-\t'Scraping' (使用匿名抓取資料)")
      process.exit(1)
    }
    if (key === 'API') isAPIenable = true
  }
  if (key === 'APIKEY') {
    if (isAPIenable) {
      if (config[key] == undefined || config[key] === '') {
        coreLogger.error('設置錯誤! APIKEY 請填入 API key 陣列!')
        process.exit(1)
      } else if (config[key].length === 0) {
        coreLogger.error('設置錯誤! APIKEY 不得為空陣列!')
        process.exit(1)
      }
    }
  }
}

if (lacked.length) {
  coreLogger.fatal('設置不完全!!')
  for (const line of lacked) coreLogger.error('缺少設置: ' + line)
  process.exit(1)
}

async function updater() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/NCT-skyouo/skyouo-s-music-bot/master/version.json').catch((e) => { throw e })
    const info = await res.json().catch((e) => { throw e })
    if (info.latest.major === "0") info.latest.major = "6"
    const fetchedVer = `v${info.latest.major}.${info.latest.minor}.${info.latest.patch}${info.latest.patch ? `-c${info.latest.patch}` : ""}`
    coreLogger.info("============= 更新日誌 =============")
    if (Number(info.latest.major) > Number(major)) {
      coreLogger.warn('該版本已嚴重過時! 請更新!!!')
      coreLogger.info('URL: https://github.com/NCT-skyouo/skyouo-s-music-bot')
      coreLogger.info('目前版本: ' + version)
      coreLogger.info('最新版本: ' + fetchedVer)
      coreLogger.info('新版內容: ' + info.latest.update_message)
    } else if (Number(info.latest.minor) > Number(minor) && Number(info.latest.major) >= Number(major)) {
      coreLogger.notice('該版本已過時! 請更新!')
      coreLogger.info('URL: https://github.com/NCT-skyouo/skyouo-s-music-bot')
      coreLogger.info('目前版本: ' + version)
      coreLogger.info('最新版本: ' + fetchedVer)
      coreLogger.info('新版內容: ' + info.latest.update_message)
    } else if (Number(info.latest.patch) > Number(patch) && Number(info.minor) <= Number(minor) && Number(info.latest.major) >= Number(major)) {
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

if (version.includes('preview')) {
  coreLogger.notice('請注意, 本版本是預覽版, unlicense 開源!!')
}

// 初始化數據庫
async function DatabaseTest() {
  const db = require("./db")
  coreLogger.info("開始測試數據庫!")
  async function testDatabase(name, dbName) {
    coreLogger.info("正在測試 '" + name + "' 數據庫!")
    try {
      var configDB = db(name, dbName)
      var done = await configDB.has("init")
      if (!done) {
        await configDB.set("init", "true").catch((e) => { throw e })
        await configDB.remove("init").catch((e) => { throw e })
      }
    } catch (e) {
      coreLogger.fatal(name + " 數據庫測試失敗!")
      coreLogger.showErr(e)
      coreLogger.fatal("由於 '" + name + "' 數據庫測試失敗, 所以 v6 將不會啟動!")
      process.exit(1)
    }
    coreLogger.ok("'" + name + "' 數據庫測試通過!")
  }
  await testDatabase('configs', 'configDB')
  await testDatabase('songs', 'songsDB')
  await testDatabase('caches', 'cachesDB')
  coreLogger.ok("測試完畢!")
}

coreLogger.info("初始化完畢!")
coreLogger.info('正在啟動 bot.js!')

global.coreLogger = coreLogger

try {
  updater()
  DatabaseTest()
  require('./bot.js')
  require("./libs/v5-core/src/YoutubeDlPatchDownloader")
} catch (e) {
  coreLogger.fatal('進程錯誤!!!')
  for (const line of e.toString().split('\n')) coreLogger.error(line)
  for (const line of e.stack.replace(e.toString(), '').split('\n')) coreLogger.trace(line)
  process.exit(1)
}
