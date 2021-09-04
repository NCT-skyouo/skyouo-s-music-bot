// v13

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'remove',
    category: 'music',
    description: 'Removes the specified track from the queue',
    aliases: ['rm'],
    slash: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes the specified track from the queue')
        .addIntegerOption(option => option.setName('number').setDescription('The track position you want to remove')),
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
            const np = await bot.player.nowPlaying(msg.guild.id)
            if (!await bot.isDJPerm(np)) throw new Error('You don\'t have permission to use this command!!')
            player.remove(msg.guild.id, (!isNaN(parseInt(args[0])) ? Number(args[0]) - 1 : args[0])).then(t => {
                if (!t) {
                    throw new Error('The song you attemped to remove does not exist')
                } else {
                    msg.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setAuthor('🎶 Successfully removed', msg.guild.iconURL())
                                .setColor('FFEE23')
                                .setImage(t.thumbnail)
                                .addField('Now playing', `[${t.name}](${t.url})`)
                                .addField('Duration', t.duration)
                                .addField('Requested by', t.requestedBy)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                    })
                }
            }).catch(e => { throw e })
            return
        } catch (e) {
            return msg.channel.send({
                embeds: [
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
