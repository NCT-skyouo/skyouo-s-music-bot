const { default: Youtube } = require('youtube-sr')

module.exports = {
    name: 'trending',
    category: 'utility',
    description: 'Show the trending videos on youtube',
    aliases: ['tr'],
    run: async (bot, msg, args) => {
        const { MessageEmbed, config } = bot

        const trending_videos = await Youtube.trending()
        if (trending_videos.length > 10) {
            while (trending_videos.length > 10) trending_videos.pop()
        }

        const embed = new MessageEmbed()
            .setTitle("Trending")
            .setColor("FFEE07")
            .setDescription(`${trending_videos.length} videos\n​`)

            .setFooter(config.footer, bot.user.displayAvatarURL())

        trending_videos.map(v => {
            embed.addField(`${trending_videos.indexOf(v) + 1}. ${v.title}`, `Views: ${v.views} | Duration: ${v.durationFormatted} - [Watch now](${v.url})\n​`)
        })

        msg.channel.send(embed)
    }
}
