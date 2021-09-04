class MessageMenuOption {
    constructor() {
        this.description = null
        this.value = null
        this.label = null
        this.emoji = null
        this.default = false
    }

    setDescription(value) {
        this.description = value
        return this
    }

    setValue(value) {
        this.value = value
        return this
    }

    setLabel(value) {
        this.label = value
        return this
    }

    setEmoji(value) {
        this.emoji = value
        return this
    }

    setDefault(value) {
        this.default = value
        return this
    }

    getJSON() {
        return { ...this }
    }
}

module.exports = MessageMenuOption