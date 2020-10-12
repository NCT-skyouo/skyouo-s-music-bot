const major = "0"
const minor = "0"
const patch = "0"
const commit = "0"
const version = `v5.${major}.${minor}-p${patch}-c${commit}`
const config = require("./config/config.json");
const Logger = require("./libs/logger.js");
const fetch = require("node-fetch")

const coreLogger = new Logger("核心進程", config.debug, config.ignore);
// 待做, 檢查資料夾
for (const folder of ["music/", "music/resources/", "music/local/", "config/", "config/databases/"]) {
  const path = require("path").resolve(__dirname, folder);
  if (!require("fs").existsSync(path)) {
    coreLogger.notice("偵測到資料夾 " + path + " 尚未創建, 將會為您創建一個...")
    fs.mkdirSync(path);
  }
}
// 待做, 檢查依賴
var err = 0, lacked = [];
for (const dep of ["fs", "discord.js", "./config/config.json", "./libs/logger.js", "./libs/discord-player/index.js", "ytdl-core", "ytpl", "ytsr", "youtube-dl-wrap", "time-stamp"]) {
  try {
    require(dep)
  } catch (e) {
    err++;
    lacked.push(dep);
    coreLogger.showErr(e);
  }
}

if (err) { // 如果出現錯誤
  coreLogger.fatal("未安裝依賴!!");
  for (const line of lacked) coreLogger.error("缺少依賴: " + line);
  process.exit(0);
}
// 待做, 檢查設置
var i = 0;
lacked = [];
for (const _ in config) {
  if (config[_] === undefined || config[_] === "") {
    i++;
    lacked.push(_);
  }
} 
if (i) {
  coreLogger.fatal("設置不完全!!");
  for (const line of lacked) coreLogger.error("缺少設置: " + line);
  process.exit(0);
}
// 待做, 檢查版本
if (version.includes("dev")) {
  coreLogger.notice("請注意, 本版本是開發版, 所以會有部分指令/事件不穩定!!");
} else if (version.includes("pre-release")) {
  coreLogger.notice("請注意, 本版本是預發佈版, 所以會有部分指令/事件不穩定!!");
} else if (version.includes("beta")) {
  coreLogger.notice("請注意, 本版本是測試版, 所以會有部分指令/事件不穩定!!")
} else if (version.includes("release")) {
  coreLogger.notice("請注意, 本版本是公有版, unlicense 開源!!");
}

async function updater() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/NCT-skyouo/skyouo-s-music-bot/master/version.json").catch((e) => { throw e })
    const info = await res.json().catch((e) => { throw e })
    const fetchedVer = `v5.${major}.${minor}-p${patch}-c${commit}`
    if (Number(info.major) > Number(major)) {
      coreLogger.warn("該版本已嚴重過時! 請更新!!!")
      coreLogger.info("URL: https://github.com/NCT-skyouo/skyouo-s-music-bot")
      coreLogger.info("目前版本: " + version)
      coreLogger.info("最新版本: " + fetchedVer)
    } else if (Number(info.minor) > Number(minor)) {
      coreLogger.notice("該版本已過時! 請更新!")
      coreLogger.info("URL: https://github.com/NCT-skyouo/skyouo-s-music-bot")
      coreLogger.info("目前版本: " + version)
      coreLogger.info("最新版本: " + fetchedVer)
    } else if (Number(info.patch) > Number(patch) && Number(info.minor) <= Number(minor)) {
      coreLogger.info("有新版本! 請更新!")
      coreLogger.info("URL: https://github.com/NCT-skyouo/skyouo-s-music-bot")
      coreLogger.info("目前版本: " + version)
      coreLogger.info("最新版本: " + fetchedVer)
    } else {
      coreLogger.ok("目前已更新到最新版!!")
    }
  } catch (e) {
    coreLogger.showErr(e)
    coreLogger.warn("檢查版本失敗!")
  }
}
// 待做, 開啟機器人
coreLogger.info("正在啟動 bot.js!");
try {
  require("./bot.js");
  // require("./index.js")
} catch (e) {
  coreLogger.fatal("進程錯誤!!!")
  for (const line of e.toString().split("\n")) coreLogger.error(line);
  for (const line of e.stack.replace(e.toString(), "").split("\n")) coreLogger.trace(line);
  process.exit(1);
}