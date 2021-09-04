// v13

const ytrend = require('@freetube/yt-trending-scraper')
const parameters = {
  geoLocation: 'TW',
  parseCreatorOnRise: false,
  page: 'music'
}


module.exports = {
  name: 'trending',
  category: 'utility',
  description: '獲取熱門歌曲',
  aliases: ['tr'],
  run: async (bot, msg, args) => {
    const { MessageEmbed, config } = bot

    var trending = await ytrend.scrape_trending_page(parameters)

    if (trending.length > 10) {
      while (trending.length > 10) trending.pop()
    }

    const embed = new MessageEmbed()
      .setTitle("熱門影片")
      .setColor("FFEE07")

      .setFooter(config.footer, bot.user.displayAvatarURL())

    trending.map(v => {
      embed.addField(`${trending.indexOf(v) + 1}. ${v.title}`, `觀看數: ${v.viewCount} | 長度: ${v.timeText} - [前往觀看](https://www.youtube.com/watch?v=${v.videoId})\n​`)
    })

    msg.channel.send({
      embeds: [embed]
    })
  }
}

