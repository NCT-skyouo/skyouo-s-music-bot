module.exports = {
    name: "加到隊列 (Spotify)",
    run: (bot, message, realMsg) => {
        message.channel.send("請稍後, 將會為您播放...")
        bot.commands.get('play')[message.author.language].run(bot, message, [realMsg.content])
    }
}