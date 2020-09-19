module.exports = {
  name: "seek",
  aliases: [],
  run: async (bot, msg, args) => {
    const { player, MessageEmbed, config } = bot;
    player
			.seek(msg.guild.id, args[0])
			.then(() => {
				msg.channel.send('成功!');
			})
			.catch(() => {});
  }
}