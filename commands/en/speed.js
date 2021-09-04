// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'speed',
    category: 'filter',
    description: 'Modifies the playback speed',
    aliases: ['spd'],
    slash: new SlashCommandBuilder()
        .setName('speed')
        .setDescription('Modifies the playback speed')
        .addStringOption(option => option.setName('amount').setDescription('The amount of speed').setRequired(true)),
    run: async (bot, msg, args) => {
        const { player, MessageEmbed, config, isDJPerm } = bot
        try {
            if (!bot.player.isPlaying(msg.guild.id)) { throw new Error('Nothing playing in the server!') }
            if (!msg.member.voice.channel) {
                throw new Error('You need to connect to a voice channel to use this command!')
            } else if (
                msg.member.voice.channel &&
                msg.guild.me.voice.channel &&
                msg.member.voice.channel.id !== msg.guild.me.voice.channel.id
            ) {
                throw new Error(`You have to connect to the voice channel as same as ${bot.user.username} to use this command!`)
            }
            if (!args[0]) {
                return msg.channel.send({
                    embeds:
                        [
                            new MessageEmbed()
                                .setTitle('Invalid usage')
                                .setColor('RANDOM')
                                .addField('Usage', '```' + msg.guild.prefix + 'speed [amount]```')
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                })
            }
            if (Number(args[0]) > 3 || Number(args[0]) < 0.01) {
                return msg.channel.send({
                    embeds:
                        [
                            new MessageEmbed()
                                .setTitle('Invalid argument')
                                .setColor('RANDOM')
                                .setDescription('Please provide an amount between 0.01 and 3!')
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                })
            }
            const np = await bot.player.nowPlaying(msg.guild.id)
            if (!await bot.isDJPerm(np)) throw new Error('You don\'t have permission to use this command!!')
            await player.speedUp(msg.guild.id, Number(args[0]).toFixed(1))
            return msg.channel.send({
                embeds:
                    [
                        new MessageEmbed()
                            .setTitle('🎶 Successfully', msg.guild.iconURL())
                            .setColor('FFE023')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
            })
        } catch (e) {
            return msg.channel.send({
                embeds:
                    [
                        new MessageEmbed()
                            .setTitle('❌ Failed', msg.guild.iconURL())
                            .setColor('FF2323')
                            .addField('Error', '```' + e.toString() + '```')
                            .setFooter(config.footer, bot.user.displayAvatarURL())
                    ]
            })
        }
    }
}
