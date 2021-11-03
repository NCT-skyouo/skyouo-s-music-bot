// v13

const { getVoiceConnection } = require('@discordjs/voice')
const os = require('os')

function bytesToMB(bytes) {
  return (Math.round(bytes / 1024) / 1024).toFixed(1)
}

module.exports = {
  name: 'stats',
  category: 'utility',
  description: '獲取機器人的數據!',
  aliases: [],
  run: (bot, msg, args) => {
    var vc = getVoiceConnection(msg.guild.id)
    return msg.channel.send({
      embeds:
        [
          new bot.MessageEmbed()
            .setTitle(bot.user.tag + " 的數據")
            .setColor("RANDOM")
            .addField("目前記憶體數據", "```yml\n" + `- 共 ${bytesToMB(process.memoryUsage().rss)} MiB 記憶體被分配給了 v8 虛擬機
- 共 ${bytesToMB(process.memoryUsage().heapTotal)} MiB 記憶體被 v8 虛擬機緩存
- 共 ${bytesToMB(process.memoryUsage().heapUsed)} MiB 記憶體被 v8 虛擬機所使用
- 系統使用情況: ${bytesToMB(os.totalmem() - os.freemem())}/${bytesToMB(os.totalmem())} MiB` + "\n```")
            .addField("目前處理器數據", "```yml\n" + `- 目前使用量: ${os.loadavg()[0].toFixed(1)} (%)
- 平均使用量: ${os.loadavg().map(a => a.toFixed(1)).join("/")} (1m/5m/15m)
- CPU 架構: ${os.arch()}
- CPU 型號: ${os.cpus()[0].model}
- CPU 時脈: ${os.cpus()[0].speed} MHz` + "\n```")
            .addField("目前系統數據 ", "```yml\n" + `- 系統平台: ${os.platform()} (${os.release()})
- 主機名稱: ${os.hostname()}
- Home 目錄: ${os.homedir()}` + "\n```")
            .addField("目前 v6 數據", "```yml\n" + `- v6 版本: ${global["v5"].version}
- v6 代號: ${global["v5"].codename}
- v6 作者: NCT skyouo` + "\n```")
            .addField("目前語音數據", vc ? `\`\`\`yml\n- UDP 伺服器延遲: ${vc.ping?.udp}\n- WS 伺服器延遲: ${vc.ping?.ws}\n- 語音狀態: ${vc.state?.status}\n\`\`\`` : ":x: **您必須使用 Kristen, 我才能獲取該資料!**")
            .addField("@discordjs/voice 狀態", "```yml\n" + require('@discordjs/voice').generateDependencyReport() + "\n```")
            .setFooter(bot.config.footer, bot.user.displayAvatarURL())
        ]
    })
  }
}