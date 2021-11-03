/**
 * 導入必須組件
 * fs - 檔案系統, node.js 原生組件
 * discord.js - 機器人 API, npm 外部組件
 * config - config/config.json, 本地檔案
 * logger - libs/logger.js, 本地依賴
 * player - libs/v5-core/index.js, 本地依賴, Unlicense/MIT開源, 改良自 Androz2091/discord-player
 * mojim - libs/mojim/index.js, 自製爬蟲, 本地依賴, Unlicense/MIT 授權
 * db.js - db.js, 用於建構數據庫
 */
const fs = require('fs')
const path = require('path')
const { Client, Collection, MessageEmbed, MessageAttachment, Intents } = require('discord.js')
const Logger = require(`./libs/logger.js`)
const DB = require(`./db.js`)
const { Player } = require(`./libs/v5-core/index.js`)
const Mojim = require(`./libs/mojim/index.js`)
const Genius = require(`./libs/genius/index.js`)

var config = JSON.parse(fs.readFileSync(`${__dirname}/config/config.json`, 'utf-8'));

// 初始選項
const opt = {
  useAPI: config.searchProvider === 'API',
  apiKEYs: config.APIKEY,
  downloadProvider: config.downloadProvider
}
// 初始化 機器人 實例
let bot = new Client({ fetchAllMembers: config.fetchAllMembers, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] })
bot.cache = new (require("./libs/cache/cache"))()
// 初始化 音樂 功能
const player = new Player(bot, opt)
// 初始化 列表
bot.commands = new Collection()
bot.plugins = new Collection()
bot.menus = new Collection()
// 初始化 紀錄器
const botLogger = new Logger('機器人進程', config.debug, config.ignore, config.gmt.offset)
const processLogger = new Logger('後端進程', config.debug, config.ignore, config.gmt.offset)
// 初始化 cd
const cooldowns = new Collection()
// 初始化 數據庫
const db = DB('configs', 'configDB')
const sdb = DB('songs', 'songsDB')
const cdb = DB('caches', 'cachesDB')

//const API = new (require('./libs/pluginAPI/API'))(bot, player)
// 綁定代碼
bot.botLogger = botLogger
bot.processLogger = processLogger
bot.config = config
bot.db = db
bot.sdb = sdb
bot.cdb = cdb
bot.player = player
bot.cooldowns = cooldowns
bot.path = __dirname
bot.mojim = Mojim()
bot.genius = Genius()
bot.Collection = Collection
bot.MessageEmbed = MessageEmbed
bot.MessageAttachment = MessageAttachment
bot.MessageMenuOption = require('./libs/discord-js-v12-v13/index').MessageMenuOption

// 讀取 command 底下的所有資料夾 (同步方式)
const commandFolders = bot.languages = fs.readdirSync(path.join(__dirname, 'commands'))
// 讀取 events 底下的所有 .js 檔案 (同步方式)
const eventsFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'))
// 讀取 plugins 底下的所有 .js 檔案 (同步方式)
const pluginsFiles = fs.readdirSync(path.join(__dirname, 'plugins')).filter(file => file.endsWith('.js'))
// 讀取 menus 底下的所有資料夾 (同步方式)
const menusFiles = fs.readdirSync(path.join(__dirname, 'menus'))
// 處裡檔案
var total_cmd = 0;

async function loadCommandFile(name, commandFiles, lang) {
  try { // 追蹤錯誤
    // 導入檔案
    const command = require(`./commands/${lang}/${commandFiles[name]}`)
    if (!command.run) throw new Error('Invalid file.')
    var commands = bot.commands.get(command.name) || {}
    // 將檔案添加至指令列表
    commands[lang] = command
    bot.commands.set(command.name, commands)
    processLogger.ok("載入指令檔案 '" + lang + "/" + commandFiles[name] + "' 成功!")
    total_cmd++
  } catch (e) {
    processLogger.error(e.toString())
    processLogger.trace(e.stack)
  }
}

const startMS = Date.now()

for (const lang of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', lang)).filter(file => file.endsWith('.js'))
  for (const name in commandFiles) {
    // load command file asynchronously
    loadCommandFile(name, commandFiles, lang)
  }
}

process.nextTick(() => {
  const endMS = Date.now()
  processLogger.ok("本次載入 " + total_cmd + " 個指令! (耗時 " + (endMS - startMS) + " ms)")
})


for (const name in eventsFiles) {
  const event = require('./events/' + eventsFiles[name])
  const NAME = eventsFiles[name].replace('.js', '')
  bot.on(NAME, event.bind(null, bot))
  processLogger.ok("載入事件檔案 '" + eventsFiles[name] + "' 成功!")
}

for (const lang of menusFiles) {
  const menuFiles = fs.readdirSync(path.join(__dirname, 'menus', lang)).filter(file => file.endsWith('.js'))
  for (const name in menuFiles) {
    var menus = require(__dirname + '/menus/' + lang + '/' + menuFiles[name])
    var menusInBotMenus = bot.menus.get(lang) || []
    menusInBotMenus.push(menus)
    bot.menus.set(lang, menusInBotMenus)
  }
}

bot.login(config.token !== "use-env" ? config.token : process.env.token)
  .then(() => {
    processLogger.ok('看起來已經登入至 Discord 機器人了!')
    botLogger.info("正在等待事件 'ready' ...")
    if (config.web.enable) {
      processLogger.info("正在啟動控制面板!")
      require('./web/index.js')(bot)
    }
  })
  .catch((e) => {
    botLogger.error(e.toString())
    botLogger.trace(e.stack)
  })