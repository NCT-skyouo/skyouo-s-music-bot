// v13

module.exports = {
    name: 'skip',
    category: 'music',
    description: 'Votes the skip the current playing track',
    aliases: ['vskp', 'vskip'],
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
            let queue = player.getQueue(msg.guild.id)

            if (queue.voter.some(m => m.id === msg.author.id)) {
                queue.voter.splice(queue.voter.indexOf(msg.author), 1)
                let voter = queue.voter
                var voteCount = voter.length
                var stillNeed = Math.ceil((msg.member.voice.channel.members.size - 1) * 0.66 - voter.length)
                var total = (stillNeed + voteCount)
                var bar = [...(String('🟥').repeat(15))]
                var need = Math.floor(bar.length * (voteCount / total))
                for (let i = 0; i < need; i++) {
                    bar[i] = '🟩'
                }
                return msg.channel.send({
                    embeds:
                        [
                            new MessageEmbed()
                                .setTitle('🎶 Successfully removed vote', msg.guild.iconURL())
                                .setColor('FFE023')
                                .setDescription(`\`\`\`\n${voteCount} users has voted,\n${stillNeed} ${stillNeed > 1 ? 'votes' : 'vote'} still needed to skip.\n\`\`\``)
                                .addField('Voting progress', `\`\`\`\n${bar.join('')}\n\`\`\``)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                })
            }

            let voter = await player.vote(msg.guild.id, msg.author);

            if (voter.length > ((msg.member.voice.channel.members.size - 1) * 0.66)) {
                player.skip(msg.guild.id);
                return msg.channel.send({
                    embeds:
                        [
                            new MessageEmbed()
                                .setTitle('🎶 Skipped', msg.guild.iconURL())
                                .setColor('FFE023')
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                })
            } else {
                var voteCount = voter.length
                var stillNeed = Math.ceil((msg.member.voice.channel.members.size - 1) * 0.66 - voter.length)
                var total = (stillNeed + voteCount)
                var bar = [...(String('🟥').repeat(15))]
                var need = Math.floor(bar.length * (voteCount / total))
                for (let i = 0; i < need; i++) {
                    bar[i] = '🟩'
                }
                return msg.channel.send({
                    embeds:
                        [
                            new MessageEmbed()
                                .setTitle('🎶 Successfully voted', msg.guild.iconURL())
                                .setColor('FFE023')
                                .setDescription(`\`\`\`\n${voteCount} users has voted,\n${stillNeed} ${stillNeed > 1 ? 'votes' : 'vote'} still needed to skip.\n\`\`\``)
                                .addField('Voting progress', `\`\`\`\n${bar.join('')}\n\`\`\``)
                                .setFooter(config.footer, bot.user.displayAvatarURL())
                        ]
                })
            }
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
