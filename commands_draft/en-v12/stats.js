const os = require('os')

function bytesToMB(bytes) {
  return (Math.round(bytes / 1024) / 1024).toFixed(1)
}

module.exports = {
  name: 'stats',
  category: 'utility',
  description: 'Get bot\'s infomation!',
  aliases: [],
  run: (bot, msg, args) => {
    return msg.channel.send(
      new bot.MessageEmbed()
      .setTitle(bot.user.tag + " 的數據")
      .setColor("RANDOM")
      .setDescription(`\`\`\`yaml
    Current Memory Usage: 
      - ${bytesToMB(process.memoryUsage().rss)} MiB Memories has been allocated by v8 Virtual Machine
      - ${bytesToMB(process.memoryUsage().heapTotal)} MiB Memory has been cached by v8 Virtual Machine
      - ${bytesToMB(process.memoryUsage().heapUsed)} MiB Memory has been used by v8 Virtual Machine
      - System Memory Usage: ${bytesToMB(os.totalmem() - os.freemem())}/${bytesToMB(os.totalmem())} MiB
        
    Current CPU Usage:
      - CPU utilization: ${os.loadavg()[0].toFixed(1)} (%)
      - Average utilization: ${os.loadavg().map(a => a.toFixed(1)).join("/")} (1m/5m/15m)
      - CPU architecture: ${os.arch()}
      - CPU model: ${os.cpus()[0].model}
      - CPU clock: ${os.cpus()[0].speed} MHz
        
    Current System Statistics:
      - Operating System: ${os.platform()} (${os.release()})
      - Hostname: ${os.hostname()}
      - Home Directory: ${os.homedir()}
        
    Current v6 Statistics:
      - v6 version: ${global["v5"].version}
      - v6 codename: ${global["v5"].codename}
      - v6 author: NCT skyouo
      \`\`\``)
      .setFooter(bot.config.footer, bot.user.displayAvatarURL())
    )
  }
}