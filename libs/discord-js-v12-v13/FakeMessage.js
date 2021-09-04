const Discord = require('discord.js')

/**
 * MessageMentions
 * @typedef {Object}
 * @property {Discord.Collection<string, Discord.User>} users
 * @property {Discord.Collection<string, Discord.GuildMember>} members
 * @property {Discord.Collection<string, Discord.Role>} roles
 * @property {Discord.Collection<string, Discord.GuildChannel>} channels
 */
var MessageMentions;

class FakeMessage {
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    constructor(interaction) {
        /**
        * @param {Discord.CommandInteraction} interaction
        */
        this.interaction = interaction

        this.client = interaction.client

        /**
         * @param {Discord.User} author
         */
        this.author = interaction.user;

        /**
         * @param {Discord.GuildMember} member
         */
        this.member = interaction.member;

        /**
         * @param {Discord.Guild} guild
         */
        this.guild = interaction.guild;

        /**
         * @type {Discord.TextChannel}
         */
        this.channel = Object.assign(Object.create(Object.getPrototypeOf(interaction.channel)), interaction.channel);

        /**
         * @type {Discord.TextChannel}
         */
        this.channelCloned = interaction.channel

        /**
         * @type {Discord.MessageMentions}
         */
        this.mentions = {
            ...Discord.MessageMentions,
            users: new Discord.Collection(),
            members: new Discord.Collection(),
            roles: new Discord.Collection(),
            channels: new Discord.Collection()
        }

        /**
         * @type {string}
         */
        this.content = interaction.options?.data ? this._parse(interaction.options.data) : ""

        /**
         * @type {boolean}
         */
        this.deleted = false

        this.channel.client = this.client

        this._patch()
    }

    createMessageComponentCollector(options = {}) {
        return this.channel.createMessageCollector(options)
    }

    /**
     * @param {Array<Discord.CommandInteractionOption>} data
     */
    _parse(data) {
        let content = []

        content.push(this.interaction.commandName)

        if (data.length > 1) {
            data.forEach(v => content.push(this._parseOption(v)))
        } else if (data.length === 1) {
            content.push(this._parseOption(data[0]))
        }

        return content.join(' ')
    }

    /**
     * @param {Discord.CommandInteractionOption} option
     */
    _parseOption(option) {

        switch (option.type) {
            case 'SUB_COMMAND':
                return option.name + " " + option.options.map(this._parseOption.bind(this)).join(' ')
            case 'SUB_COMMAND_GROUP':
                return option.name + " " + option.options.map(this._parseOption.bind(this)).join(' ')
            case 'STRING':
            case 'INTEGER':
            case 'NUMBER':
            case 'BOOLEAN':
                return option.value;
            case 'USER':
                this.mentions.users.set(option.value, option.user)
                this.mentions.members.set(option.value, option.member)
                return `<@${option.value}>`;
            case 'CHANNEL':
                this.mentions.channels.set(option.value, option.channel)
                return `<#${option.value}>`;
            case 'ROLE':
                this.mentions.roles.set(option.value, option.role)
                return `<@&${option.value}>`;
            case 'MENTIONABLE':
                // todo: detect MENTIONABLE is a user, a role or a channel
                return `<@${option.value}>`;
        }
    }

    _patch() {
        this.channel.send = async (options) => {
            if (typeof options === 'string') {
                if (this.interaction.replied) return await this.interaction.editReply({ content: options })
                return await this.interaction.reply({ fetchReply: true, content: options })
            }
            if (!options.content) options.content = null
            if (!options.embeds) options.embeds = []
            if (!options.files) options.files = []
            if (!options.tts) options.tts = false
            //if (!options.nonce) options.nonce = ""
            if (!options.components) options.components = []
            if (!options.allowedMentions) options.allowedMentions = { users: [], roles: [], repliedUser: false }
            if (!this.interaction) return this.channelCloned.send(options)
            if (this.interaction.replied) {
                try {
                    return await this.interaction.editReply({ ...options })
                } catch (e) {
                    return await this.channelCloned.send(options)
                }
            }
            return await this.interaction.reply({ fetchReply: true, ...options })
        }

        this.edit = async (options) => {
            if (typeof options === 'string') {
                if (!this.interaction.replied) return await this.interaction.reply({ fetchReply: true, content: options })
                try {
                    return await this.interaction.editReply({ content: options })
                } catch (e) {
                    return await this.channelCloned.send(options)
                }
            }
            if (!options.content) options.content = null
            if (!options.embeds) options.embeds = []
            if (!options.files) options.files = []
            if (!options.tts) options.tts = false
            if (!options.components) options.components = []
            if (!options.allowedMentions) options.allowedMentions = { users: [], roles: [], repliedUser: false }
            if (!this.interaction) return this.channel.messages.edit(this, options);
            if (!this.interaction.replied) {
                try {
                    return await this.interaction.reply({ fetchReply: true, ...options })
                } catch (e) {
                    return await this.channelCloned.send(options)
                }
            }
            try {
                return await this.interaction.editReply({ ...options })
            } catch (e) {
                return await this.channelCloned.send(options)
            }
        }
    }
}

module.exports = FakeMessage