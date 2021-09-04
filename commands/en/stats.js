// v13

const os = require('os')

function bytesToMB(bytes) {
    return (Math.round(bytes / 1024) / 1024).toFixed(1)
}

module.exports = {
    name: 'stats',
    category: 'utility',
    description: 'Views the stats of the bot',
    aliases: [],
    run: (bot, msg, args) => {
        return msg.channel.send({
            embeds:
                [
                    new bot.MessageEmbed()
                        .setTitle('Stats for ' + bot.user.tag)
                        .setColor("RANDOM")
                        .setDescription(`\`\`\`yaml
  目前記憶體數據: 
    - 共 ${bytesToMB(process.memoryUsage().rss)} MiB 記憶體被分配給了 v8 虛擬機
    - 共 ${bytesToMB(process.memoryUsage().heapTotal)} MiB 記憶體被 v8 虛擬機緩存
    - 共 ${bytesToMB(process.memoryUsage().heapUsed)} MiB 記憶體被 v8 虛擬機所使用
    - 系統使用情況: ${bytesToMB(os.totalmem() - os.freemem())}/${bytesToMB(os.totalmem())} MiB
      
  目前處理器數據:
    - 目前使用量: ${os.loadavg()[0].toFixed(1)} (%)
    - 平均使用量: ${os.loadavg().map(a => a.toFixed(1)).join("/")} (1m/5m/15m)
    - CPU 架構: ${os.arch()}
    - CPU 型號: ${os.cpus()[0].model}
    - CPU 時脈: ${os.cpus()[0].speed} MHz
      
  目前系統數據:
    - 系統平台: ${os.platform()} (${os.release()})
    - 主機名稱: ${os.hostname()}
    - Home 目錄: ${os.homedir()}
      
  目前 v6 數據:
    - v6 版本: ${global["v5"].version}
    - v6 代號: ${global["v5"].codename}
    - v6 作者: NCT skyouo
      \`\`\``)
                        .setFooter(bot.config.footer, bot.user.displayAvatarURL())
                ]
        })
    }
}