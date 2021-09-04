const Redis = require('ioredis');

class redis {
	constructor(name, opt={}) {
		this.name = name;

		this.redis = new Redis(opt);

    this.namespace = `namespace:${this.name}`

    this.opt = opt

    this.opt.startMiddle = this.opt.startMiddle || (n => n)

    this.opt.endMiddle = this.opt.endMiddle || (n => n)

		this.redis.on('error', err => console.error(`[REDIS] ${err.toString()}`));

    if (opt.leave_on_exit) {
      process.on("exit", this.disconnect)
    }
	}

	async get(k) {
		var v = await this.redis.get(k)
		return this.opt.endMiddle(v);
	}

	async set(key, value) {
		return await this.redis.set(key, this.opt.startMiddle(value));
	}

	remove(key) {
		return this.redis.del(key)
	}

  async add(k, v) {
    await this.set(k, (await this.get(k)) + v)
    return this
  }

  async subtract(k, v) {
    await this.set(k, (await this.get(k)) - v)
    return this
  }

  push() {
    throw new Error("Since Redis doesn't support array, so uwu")
  }

  async has(k) {
    var all = await this.all()
    return all.hasOwnProperty(k)
  }

	async all() {
    var allres = await this.redis.keys('*')
    allres = allres.filter(item => item !== this.namespace)
    var res = await Promise.all(allres.map(async item => { return { name: item, value: await this.get(item) }}))
    var items = {}
    res.map(a => items[a.name] = a.value)
    return items
  }

  disconnect() {
    return this.redis.disconnect()
  }
}

module.exports = redis;