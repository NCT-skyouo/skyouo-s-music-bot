const Track = require("../v5-core/src/Track")

// const fetch = require("node-fetch")
module.exports = class Cache {
    constructor(name) {
        this.name = name
        this.cache = {}
    }

    set(k, v) {
        return new Promise(async (resolve) => {
            this.cache[k] = v
            return resolve()
        })
    }


    remove(k) {
        return new Promise(async (resolve) => {
            delete this.cache[k]
            return resolve()
        })
    }

    get(k) {
        return new Promise(async (resolve) => {
            return resolve(this.cache[k])
        })
    }

    add(k, v) {
        return new Promise(async (resolve) => {
            this.cache[k] += v
            return resolve()
        })
    }

    subtract(k, v) {
        return new Promise(async (resolve) => {
            this.cache[k] -= v
            return resolve()
        })
    }

    push(k, v) {
        return new Promise(async (resolve) => {
            this.cache[k].push(v)
            return resolve()
        })
    }

    has(k) {
        return new Promise(async (resolve) => {
            return resolve(this.cache.hasOwnProperty(k))
        })
    }

    all() {
        return new Promise(async (resolve) => {
            return resolve(this.cache)
        })
    }
}