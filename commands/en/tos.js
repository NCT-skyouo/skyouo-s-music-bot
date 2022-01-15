// v13

module.exports = {
  name: 'tos',
  category: 'utility',
  description: 'Terms of Service for this bot, please be sure to abide by it.',
  aliases: [],
  run: async (bot, msg, args) => {
    // Delete this file if you dont want this command ;w;
    const { config, MessageEmbed } = bot
    return msg.channel.send({
      embeds:
        [
          new MessageEmbed()
            .setTitle('v6 Music Bot | Terms of Service')
            .setColor('FF2323')
            .setDescription("The words of which the initial letter is capitalized have meanings defined under the following conditions.\nThe following definitions shall have the same meaning regardless of whether they appear in singular or in plural.")
            .addField("Definitions:", "Application\nmeans the software program provided by the NCT-skyouo downloaded by You on any electronic device, named V6 Music Bot\n\nYou\nmeans the individual accessing or using the service, or the company, or other legal entity on behalf of which such individual is accessing or using the service, as applicable.")
            .addField("1.", "In order to comply with Article 55 of 'Fair Usage Policy(合理使用原則)' of the Copyright Law of the Republic of China(中華民國著作權法),\nYou may not use the public part of this bot for commercial purposes,\nIf you do not live in the legal territory of the Republic of China, the above rules are still valid.")
            .addField("2.", "You may not use the service to do anything expressly prohibited in Discord ToS/Guideline.")
            .addField("3.", "You may not reproduce, adapt, distribute, or relicense Kristen v6 unless you obtain the source code of Kristen v6 in a formal manner.")
            .addField("4.", "When you use certain functions of this service, you agree that this service collects your\n(1) Discord-related **public** data (avatar, name)\n(2) Settings when using the service\n(3) Behavior records such as time periods/details (e.g. listening) of services used.")
            .addField("5.", "Whether unintentional or intentional, you must not abuse this service maliciously, otherwise the owner will be able to terminate the service to you without notice.")
            .addField("6.", "When you start to use the service and agree to the content of this ToS, you must not refuse to abide by the ToS on the grounds of ignorance, disagreement, etc. If you do not agree/no longer want to use the service, please kick the bot out of your Discord guild.")
            .addField("7.", bot.user.tag.includes("Kristen") ? "The owner of this service, NCT skyouo#3144, reserves any legal rights." : "The owner of this service reserves any legal rights.")
            .addField("8.", "This service does not have the right to change your guild-related settings, and **__including but not limited to__** kicks all members from a guild, modify guild channels/categories name, modify guild roles permissions, if you find that this service has related situation, please inform " + bot.users.cache.get(bot.config.ownerid).tag + "for further help.")
            .setFooter(config.footer, bot.user.displayAvatarURL())
        ]
    })
  }
}
