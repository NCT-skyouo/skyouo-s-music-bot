module.exports = {
    name: "加到隊列 (SoundCloud)",
    run: (bot, message, realMsg) => {
        message.channel.send("請稍後, 將會為您播放...")
        if (bot.player.resolveQueryType(realMsg.content) === 'youtube-video-keywords') realMsg.content = 'soundcloud:' + realMsg.content
        bot.commands.get('play')[message.author.language].run(bot, message, [realMsg.content])
    }
}