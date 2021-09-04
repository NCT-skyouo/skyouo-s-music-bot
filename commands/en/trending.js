// v13

const ytrend = require('@freetube/yt-trending-scraper')
const parameters = {
    geoLocation: 'US',
    parseCreatorOnRise: false,
    page: 'music'
}

module.exports = {
    name: 'trending',
    category: 'utility',
    description: 'Views what\'s trending on YouTube',
    aliases: ['tr'],
    run: async (bot, msg, args) => {
        const { MessageEmbed, config } = bot

        var trending = await ytrend.scrape_trending_page(parameters)
        if (trending.length > 10) {
            while (trending.length > 10) trending.pop()
        }

        const embed = new MessageEmbed()
            .setTitle("Trending videos")
            .setColor("FFEE07")

            .setFooter(config.footer, bot.user.displayAvatarURL())

        trending.map(v => {
            embed.addField(`${trending.indexOf(v) + 1}. ${v.title}`, `Views: ${v.viewCount} | Duration: ${v.timeText} - [Click here](https://www.youtube.com/watch?v=${v.videoId})\n​`)
        })

        msg.channel.send({
            embeds: [embed]
        })
    }
}