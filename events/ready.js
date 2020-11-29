const stamp = require('time-stamp')

module.exports = (bot) => {
  bot.botLogger.ok("'ready' 事件被觸發了!")
  bot.botLogger.ok('已經登入進 Discord 機器人了!')
  bot.botLogger.info('資訊:')
  bot.botLogger.info('機器人名稱: ' + bot.user.tag)
  bot.botLogger.info('創建日期: ' + stamp('YYYY/MM/DD HH:mm:ss', bot.user.createdAt, 8))
  bot.botLogger.info('總用戶: ' + bot.users.cache.map(u => u.tag).length)
  
  setInterval(() => {
    if (!bot.player.queues.length) {
      bot.user.setPresence({
        status: 'idle',
        activity: {
            name: `總人數: ${bot.users.cache.array().length} | 總伺服器: ${bot.guilds.cache.array().length}`,
            type: 'PLAYING'
        }
      })
    } else {
      bot.user.setPresence({
        status: 'dnd',
        activity: {
            name: `正在使用的伺服器數: ${bot.player.queues.length}`,
            type: 'PLAYING'
        }
      })
    }
  }, 60000)
}
