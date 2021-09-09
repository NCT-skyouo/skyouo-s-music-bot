// v13

const { MessageEmbed } = require('discord.js');
const assert = require('assert');

async function runCodeAndGetTime(func) {
    var start = process.hrtime.bigint();
    await func();
    var end = process.hrtime.bigint();

    return Number((Number(end - start) / 1000000).toFixed(4));
}

module.exports = {
    name: 'ping',
    category: 'utlities',
    description: '獲取機器人與 Discord API 的延遲',
    aliases: [],
    run: async (bot, msg, args) => {
        const m = await msg.channel.send({ embeds: [new MessageEmbed().setTitle("🛠️ 請稍後...").setColor('87CEEB').setFooter(bot.config.footer, bot.user.displayAvatarURL())] });
        const latency = m.createdTimestamp - msg.createdTimestamp;
        const wsPing = bot.ws.ping;
        const db = bot.db, sdb = bot.sdb, cdb = bot.cdb;
        const dbPing = await runCodeAndGetTime(async () => {
            await db.set('_', '0')
            var _ = await db.get('_');
            assert.strictEqual(_, '0');
        });
        const sdbPing = await runCodeAndGetTime(async () => {
            await sdb.set('_', '0')
            var _ = await sdb.get('_');
            assert.strictEqual(_, '0');
        });
        const cdbPing = await runCodeAndGetTime(async () => {
            await cdb.set('_', '0')
            var _ = await cdb.get('_');
            assert.strictEqual(_, '0');
        });

        const avg_ping = Math.round((latency + wsPing + dbPing + sdbPing + cdbPing) / 5);

        const embed = new MessageEmbed()
            .setTitle('📡️ 延遲')
            .setColor(avg_ping > 175 ? 'FF0727' : avg_ping > 100 ? 'FFA727' : '07FA27')
            .addField('💻 API 延遲', `${latency} 毫秒`)
            .addField('📡️ WebSocket 延遲', `${wsPing} 毫秒\n\u200B`)
            .addField('📥 Database 1 (config) 延遲', `${dbPing} 毫秒`)
            .addField('📤 Database 2 (song) 延遲', `${sdbPing} 毫秒`)
            .addField('📥 Database 3 (cache) 延遲', `${cdbPing} 毫秒\n\u200B`)
            .addField('📡️ 平均延遲', `${avg_ping} 毫秒`)
            .setFooter(bot.config.footer, bot.user.displayAvatarURL());

        m.edit({ embeds: [embed] });

        db.remove('_');
        sdb.remove('_');
        cdb.remove('_');
    }
  }
  