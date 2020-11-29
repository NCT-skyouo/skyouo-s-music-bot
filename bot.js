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
const { Client, Collection, MessageEmbed, MessageAttachment } = require('discord.js')
const config = require(path.join(__dirname, 'config', 'config.json'))
const Logger = require(path.join(__dirname, 'libs', 'logger.js'))
const DB = require(path.join(__dirname, 'db.js'))
const { Player } = require(path.join(__dirname, 'libs', 'v5-core', 'index.js'))
const Mojim = require(path.join(__dirname, 'libs', 'mojim', 'index.js'))

// 初始選項
const opt = {
  useAPI: config.searchProvider === 'API',
  apiKEYs: config.APIKEY
}
// 初始化 機器人 實例
let bot = new Client({ fetchAllMembers: config.fetchAllMembers })
// 初始化 音樂 功能
const player = new Player(bot, opt)
// 初始化 指令列表
bot.commands = new Collection()
// 初始化 紀錄器
const botLogger = new Logger('機器人進程', config.debug, config.ignore)
const processLogger = new Logger('後端進程', config.debug, config.ignore)
// 初始化 cd
const cooldowns = new Collection()
// 初始化 數據庫
const db = DB('configs', 'configDB')
const sdb = DB('songs', 'songsDB')
// 綁定代碼
bot.botLogger = botLogger
bot.processLogger = processLogger
bot.config = config
bot.db = db
bot.sdb = sdb
bot.player = player
bot.cooldowns = cooldowns
bot.path = __dirname
bot.mojim = Mojim()
bot.Collection = Collection
bot.MessageEmbed = MessageEmbed
bot.MessageAttachment = MessageAttachment

// 讀取 command 底下的所有 .js 檔案 (同步方式)
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'))
// 讀取 events 底下的所有 .js 檔案 (同步方式)
const eventsFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'))
// 處裡檔案
var total_cmd = 0;
for (const name in commandFiles) {
  try { // 追蹤錯誤
    // 導入檔案
    const command = require(`./commands/${commandFiles[name]}`)
    // 將檔案添加至指令列表
    bot.commands.set(command.name, command)
    if (!command.run) throw new Error('Invalid file.')
    processLogger.ok("載入指令檔案 '" + commandFiles[name] + "' 成功!")
    total_cmd++
  } catch (e) {
    processLogger.error(e.toString())
    processLogger.trace(e.stack)
  }
}

processLogger.ok("本次載入 " + total_cmd + " 個指令!")

for (const name in eventsFiles) {
  const event = require('./events/' + eventsFiles[name])
  const NAME = eventsFiles[name].replace('.js', '')
  bot.on(NAME, event.bind(null, bot))
  processLogger.ok("載入事件檔案 '" + eventsFiles[name] + "' 成功!")
}

// 抓取錯誤
process.on('uncaughtException', (err, origin) => {
  processLogger.error(
    `發生錯誤: ${err}\n` +
    `錯誤類別: ${origin}\n` +
    `訊息: ${err.stack}`
  )
})

process.on('unhandledRejection', error => {
  processLogger.error(
    `發生錯誤: ${error}\n` +
    `訊息: ${error.stack}`
  )
})

// 待做 - 啟用管理員控制面板

// 啟用全域 gc
if (!global.gc) {
  require("v8").setFlagsFromString('--expose_gc')
  global.gc = require("vm").runInNewContext('gc')
}

// 使用 命令列介面
process.stdin.on('readable', () => {
  let input = process.stdin.read()
  if (input !== null) {
    input = input.toString().trim()
    const cmd = input.split(' ')[0]
    const args = input.split(' ').slice(1)
    if (input === '/exit' || input === 'exit') {
      processLogger.info('正在結束進程... (垃圾回收)')
      bot.destroy()
      bot = undefined
      processLogger.notice('感謝您使用 Music v5 by NCT skyouo!!')
      process.exit(0)
    } else if (input === '/info' || input === 'info') {
      const stamp = require('time-stamp')
      bot.botLogger.info('資訊:')
      bot.botLogger.info('機器人名稱: ' + bot.user.tag)
      bot.botLogger.info('創建日期: ' + stamp('YYYY/MM/DD HH:mm:ss', bot.user.createdAt, 8))
      bot.botLogger.info('總用戶: ' + bot.users.cache.map(u => u.tag).length)
    } else if (cmd === '/reload' || cmd === 'reload') {
      if (!args.length) return bot.botLogger.warn('你必須提供要重啟的指令名稱! 用法: /reload [command]')
      const commandName = args[0].toLowerCase()
      const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
      if (!command) return bot.botLogger.warn('找不到該指令!')
      try {
        const newCommand = require(`./commands/${command.name}.js`)
        bot.commands.set(newCommand.name, newCommand)
        bot.botLogger.info('重啟成功!')
      } catch (error) {
        bot.botLogger.showErr(error)
        bot.botLogger.fatal('發生重大錯誤, 退出中...')
        process.exit(1)
      }
    }
  }
  return undefined
})

bot.login(config.token)
  .then(() => {
    processLogger.ok('看起來已經登入至 Discord 機器人了!')
    botLogger.info("正在等待事件 'ready' ...")
    setInterval(() => {
      processLogger.debug('正在執行垃圾收集... (可以關閉在選項中的 "debug" 來忽略該消息)')
      global.gc()
    }, 60000)
    processLogger.info("正在將機器人頭像和名稱寫入 tmp.json!")
    fs.writeFileSync("tmp.json", JSON.stringify({ avatar: bot.user.displayAvatarURL({ format: 'png' }), name: bot.user.tag }))
    processLogger.info("正在啟動控制面板!")
    global._ = { bot: bot }
    if (config.web.enable) require('./index.js')
  })
  .catch((e) => {
    botLogger.error(e.toString())
    botLogger.trace(e.stack)
  })
