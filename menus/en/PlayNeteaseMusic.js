module.exports = {
    name: "Add To Queue (Netease Music)",
    run: (bot, message, realMsg) => {
        message.channel.send("Hold on...")
        if (bot.player.resolveQueryType(realMsg.content) === 'youtube-video-keywords') realMsg.content = 'netease:' + realMsg.content
        bot.commands.get('play')[message.author.language].run(bot, message, [realMsg.content])
    }
}