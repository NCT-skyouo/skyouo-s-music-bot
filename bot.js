/**
 * 導入必須組件
 * fs - 檔案系統, node.js 原生組件
 * discord.js - 機器人 API, npm 外部組件
 * config - config/config.json, 本地檔案
 * logger - libs/logger.js, 本地依賴
 * player - libs/discord-player/index.js, 本地依賴, MIT開源, 作者為 Androz2091
 * mojim - libs/mojim/index.js, 自製爬蟲, 本地依賴, Unlicense/MIT 授權
 */
const fs = require('fs');
const { Client, Collection, MessageEmbed, MessageAttachment } = require('discord.js');
const config = require('./config/config.json');
const Logger = require("./libs/logger.js");
const DB = require("./libs/json-db/index.js").Database;
const { Player } = require("./libs/discord-player/index.js");
const Mojim = require("./libs/mojim/index.js");

// 初始選項
var opt = {
  useAPI: config.searchProvider === "API" ? true : false,
  apiKEYs: config.APIKEY
}
// 初始化 機器人 實例
var bot = new Client();
// 初始化 音樂 功能
const player = new Player(bot, opt);
// 初始化 指令列表
bot.commands = new Collection();
// 初始化 紀錄器
const botLogger = new Logger("機器人進程", config.debug, config.ignore);
const processLogger = new Logger("後端進程", config.debug, config.ignore);
console.log(processLogger.debug)
//初始化 cd 
const cooldowns = new Collection();
// 初始化 數據庫
const db = new DB("configs", __dirname + "/config/databases/");
const sdb = new DB("songs", __dirname + "/config/databases/")
// 綁定代碼
bot.botLogger = botLogger;
bot.processLogger = processLogger;
bot.config = config;
bot.db = db;
bot.sdb = sdb;
bot.player = player;
bot.cooldowns = cooldowns;
bot.path = __dirname;
bot.mojim = Mojim();
bot.Collection = Collection;
bot.MessageEmbed = MessageEmbed;
bot.MessageAttachment = MessageAttachment;

// 讀取 command 底下的所有 .js 檔案 (同步方式)
const commandFiles = fs.readdirSync(__dirname +'/commands').filter(file => file.endsWith('.js'));
// 讀取 events 底下的所有 .js 檔案 (同步方式)
const eventsFiles = fs.readdirSync(__dirname + '/events').filter(file => file.endsWith('.js'))
// 處裡檔案
for (const name in commandFiles) {
  try { // 追蹤錯誤
    // 導入檔案
	  const command = require(`./commands/${commandFiles[name]}`);
    // 將檔案添加至指令列表
	  bot.commands.set(command.name, command);
    if (!command.run) throw new Error("Invalid file.");
	  processLogger.ok("載入指令檔案 '" + commandFiles[name] + "' 成功!");
  } catch (e) {
    processLogger.error(e.toString());
    processLogger.trace(e.stack);
  }
}

for (const name in eventsFiles) {
  const event = require("./events/" +eventsFiles[name]);
  const NAME = eventsFiles[name].replace(".js", "");
  bot.on(NAME, event.bind(null, bot));
  processLogger.ok("載入事件檔案 '" + eventsFiles[name] + "' 成功!")
}

// 抓取錯誤
process.on('uncaughtException', (err, origin) => {
  processLogger.error(
    `發生錯誤: ${err}\n` +
    `錯誤類別: ${origin}`
  );
});

// 待做 - 啟用管理員控制面板

// 使用 命令列介面
process.stdin.on('readable', () => {
    var input = process.stdin.read();
    if (input !== null) {
      input = input.toString().trim(); 
      var cmd = input.split(" ")[0];
      var args = input.split(" ").slice(1)
      if (input === "/exit" || input === "exit") {
        processLogger.info("正在結束進程... (垃圾回收)")
        bot.destroy();
        bot = undefined;
        processLogger.notice("感謝您使用 Music v5 by NCT skyouo!!");
        process.exit(0);
      } else if (input === "/info" || input === "info") {
        const stamp = require("time-stamp");
        bot.botLogger.info("資訊:");
        bot.botLogger.info("機器人名稱: " + bot.user.tag);
        bot.botLogger.info("創建日期: " + stamp("YYYY/MM/DD HH:mm:ss", bot.user.createdAt, 8));
        bot.botLogger.info("總用戶: " + bot.users.cache.map(u => u.tag).length);
      } else if (cmd === "/reload" || cmd === "reload") {
        if (!args.length) return bot.botLogger.warn(`你必須提供要重啟的指令名稱! 用法: /reload [command]`);
        const commandName = args[0].toLowerCase();
        const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return bot.botLogger.warn("找不到該指令!");
        try {
          bot.botLogger.ok("找到了該指令!");
	        const newCommand = require(`./commands/${command.name}.js`);
	        bot.commands.set(newCommand.name, newCommand);
	        bot.botLogger.info("重啟成功!");
        } catch (error) {
	        bot.botLogger.showErr(error);
	        bot.botLogger.fatal("發生重大錯誤, 退出中...");
	        process.exit(1);
        }
      }
    }
});

bot.login(config.token)
  .then(() => {
    processLogger.ok("看起來已經登入至 Discord 機器人了!");
    botLogger.info("正在等待事件 'ready' ...")
    setInterval(() => {
      processLogger.debug("正在執行垃圾收集... (可以關閉在選項中的 \"debug\" 來忽略該消息)")
      gc()
    }, 60000)
  })
  .catch((e) => {
    botLogger.error(e.toString());
    botLogger.trace(e.stack);
  });