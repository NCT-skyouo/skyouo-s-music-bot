// v13

const os = require('os')

const { getVoiceConnection } = require('@discordjs/voice')

function bytesToMB(bytes) {
  return (Math.round(bytes / 1024) / 1024).toFixed(1)
}

module.exports = {
  name: 'stats',
  category: 'utility',
  description: 'Views the stats of the bot',
  aliases: [],
  run: (bot, msg, args) => {

    var vc = getVoiceConnection(msg.guild.id)
    return msg.channel.send({
      embeds:
        [
          new bot.MessageEmbed()
            .setTitle("Stats of " + bot.user.tag)
            .setColor("RANDOM")
            .addField("Memory", "```yml\n" + `- ${bytesToMB(process.memoryUsage().rss)} MiB memory has been allocated by v8 VM
- ${bytesToMB(process.memoryUsage().heapTotal)} MiB memory has been cached by v8 VM
- ${bytesToMB(process.memoryUsage().heapUsed)} MiB memory has been used by v8 VM
- System usage: ${bytesToMB(os.totalmem() - os.freemem())}/${bytesToMB(os.totalmem())} MiB` + "\n```")
            .addField("CPU", "```yml\n" + `- 目前使用量: ${os.loadavg()[0].toFixed(1)} (%)
- Avg. Load: ${os.loadavg().map(a => a.toFixed(1)).join("/")} (1m/5m/15m)
- CPU architecture: ${os.arch()}
- CPU model: ${os.cpus()[0].model}
- CPU clock: ${os.cpus()[0].speed} MHz` + "\n```")
            .addField("System ", "```yml\n" + `- System platform: ${os.platform()} (${os.release()})
- Hostname: ${os.hostname()}
- Home directory: ${os.homedir()}` + "\n```")
            .addField("Kristen", "```yml\n" + `- v6 version: ${global["v5"].version}
- v6 codename: ${global["v5"].codename}
- v6 author: NCT skyouo` + "\n```")
            .addField("Voice connection", vc ? `\`\`\`yml\n- UDP latency: ${vc.ping?.udp}\n- WS latency: ${vc.ping?.ws}\n- Voice connection status: ${vc.state?.status}\n\`\`\`` : ":x: **Sorry, but I cannot fetch the data until I play the track!**")
            .addField("@discordjs/voice status", "```yml\n" + require('@discordjs/voice').generateDependencyReport() + "\n```")
            .setFooter(bot.config.footer, bot.user.displayAvatarURL())
        ]
    })
  }
}