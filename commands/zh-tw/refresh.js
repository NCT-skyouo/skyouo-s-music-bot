// v13

module.exports = {
    name: 'refresh',
    category: 'admin',
    description: '清空隊列數據.',
    aliases: ['reload'],
    run: async (bot, msg, args) => {
        const { player, config, MessageEmbed, isDJPerm } = bot
        try {
            if (!player.getQueue(msg.guild.id)) throw new Error('目前沒有正在播放的歌曲!')
            if (!msg.member.voice.channel) {
                throw new Error('您尚未加入任何一個語音頻道!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error('您必須要與機器人在同一個語音頻道!')
            }
            if (!await isDJPerm({})) throw new Error('沒有權限!')
            bot.player.queues = bot.player.queues.filter(queue => queue.guildID !== msg.guild.id)
            if (msg.guild.me.voice.channel) msg.guild.me.voice.channel.leave()
            msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('✅ 清空隊列數據清空成功!!')
                        .setColor('FF0523')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
        } catch (e) {
            msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('❌ 清空隊列數據失敗!!')
                        .setColor('FF4D4D')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
        }
    }
}
