// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'jump',
    category: 'music',
    description: 'Skips to the specified track',
    aliases: ['j', 'skipto'],
    slash: new SlashCommandBuilder()
        .setName('jump')
        .setDescription('Skips to the specified track')
        .addStringOption(option => option.setName('number').setDescription('The certain track position you want to skip to').setRequired(true)),
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        try {
            const queue = await player.getQueue(msg.guild.id)
            if (!!queue.playing || !bot.player.isPlaying(msg.guild.id)) { throw new Error('Nothing playing in the server!') }
            if (!msg.member.voice.channel) {
                throw new Error('You need to connect to a voice channel to use this command!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
            }
            const np = await bot.player.nowPlaying(msg.guild.id)
            if (!await bot.isDJPerm(np)) throw new Error('You don\'t have permission to use this command!!')
            if (!args[0]) throw new Error("Missing argument: <track number>")
            player.jump(msg.guild.id, Number(args[0]) - 1).then(() => {
                return msg.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('🎶 Successfully skipped to ' + args[0], msg.guild.iconURL())
                            .setColor('FFE023')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
                })
            }).catch(e => { throw e })
        } catch (e) {
            return msg.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle('❌ Unable to skip to ' + args[0], msg.guild.iconURL())
                        .setColor('FF2323')
                        .addField('Error', '```' + e.toString() + '```')
                        .setFooter(config.footer, bot.user.displayAvatarURL())
                ]
            })
        }
    }
}
