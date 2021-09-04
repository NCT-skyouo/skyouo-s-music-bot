var readline = require('readline');

module.exports = {
    name: "CLI",
    id: "cli",
    description: "如果您是在 Falixnodes/NAFH/BuckyHost 等地方託管的機器人, 那麼您一定要使用該插件!\n該插件允許您使用控制台來控制機器人, 關閉機器人只需要一行 \"/exit\" 即可!",
    enable: true,
    author: "NCT skyouo",
    version: "1.1.0",
    api: ['*'],
    support: ['*'],
    requires: ['discord.js'],
    Plugin: class {
      constructor(bot, api) {
        this.logger = api.getLoggerInstance('插件-終端指令')
        this.status = "load"
        this.bot = bot
        this.api = api
        this.configs = {}
      }
      onLoad() {
        let self = this

        if (!this.bot.bot) {
          this.logger.warn("您必須要開啟設置 'allowAll' 才能使用該插件!");
          this.status = 'fail';
          return;
        }

        var read = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        read.on('line', (input) => {
            if (input !== null) {
              input = input.toString().trim()
              const cmd = input.split(' ')[0]
              const args = input.split(' ').slice(1)
              if (input === '/exit' || input === 'exit' || input === 'stop' || input === "stop") {
                self.logger.info('正在結束進程... (垃圾回收)')
                self.logger.notice('感謝您使用 Music v6 by NCT skyouo!!')
                process.emit('exit')
              } else if (input === '/info' || input === 'info') {
                const stamp = require('time-stamp')
                self.logger.info('資訊:')
                self.logger.info('機器人名稱: ' + self.bot.user.tag)
                self.logger.info('創建日期: ' + stamp('YYYY/MM/DD HH:mm:ss', self.bot.user.createdAt, 8))
                self.logger.info('總用戶: ' + self.bot.users.cache.map(u => u.tag).length)
              } else if (cmd === '/reload' || cmd === 'reload') {
                if (!args.length) return self.logger.warn('你必須提供要重啟的指令名稱! 用法: /reload [command]')
                const commandName = args[0].toLowerCase()
                const command = self.bot.commands.get(commandName) || self.bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
                if (!command) return self.logger.warn('找不到該指令!')
                try {
                  const newCommand = require(`./commands/${command.name}.js`)
                  self.bot.commands.set(newCommand.name, newCommand)
                  self.logger.info('重啟成功!')
                } catch (error) {
                  self.logger.showErr(error)
                  self.logger.fatal('發生重大錯誤, 退出中...')
                  process.exit(1)
                }
              }
            }
            return;
          })

          Array.from([`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`])
          .forEach((eventType) => {
            process.once(eventType, () => {
              this.bot.bot.destroy()
              process.stdin.resume()
              global.gc()
              process.exit(0)
            });
          })
          this.status = "active"
        }
    
        onEnable() {
          if (this.status === "active") this.logger.info("啟動成功!")
        }
  
      onDisable() { }
    }
  }