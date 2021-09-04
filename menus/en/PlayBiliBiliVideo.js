module.exports = {
    name: "Add To Queue (BiliBili Video)",
    run: (bot, message, realMsg) => {
        message.channel.send("Hold on...")
        if (bot.player.resolveQueryType(realMsg.content) === 'youtube-video-keywords') realMsg.content = 'bilibili-video:' + realMsg.content
        bot.commands.get('play')[message.author.language].run(bot, message, [realMsg.content])
    }
}