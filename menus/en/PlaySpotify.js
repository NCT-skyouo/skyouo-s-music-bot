module.exports = {
    name: "Add To Queue (Spotify)",
    run: (bot, message, realMsg) => {
        message.channel.send("Hold on...")
        bot.commands.get('play')[message.author.language].run(bot, message, [realMsg.content])
    }
}