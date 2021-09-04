const { Database } = require("quickmongo");

class mongo {
	constructor(name, opt={}) {
		this.name = name;

    this.opt = opt

    this.opt.startMiddle = this.opt.startMiddle || (n => n)
    this.opt.endMiddle = this.opt.endMiddle || (n => n)

		this.mongo = new Database(opt.url);
	}

	get(k) {
		return this.mongo.get(k)
      .then((v) => {
				return this.opt.endMiddle(v);
			});
	}

	set(k, v) {
		return this.mongo.set(k, this.opt.startMiddle(v));
	}

	remove(k) {
		return this.mongo.delete(k)
	}

  add(k, v) {
    return this.mongo.add(k, this.opt.startMiddle(v))
  }

  subtract(k, v) {
    return this.mongo.subtract(k, this.opt.startMiddle(v))
  }

  push(k, v) {
    return this.mongo.push(k, this.opt.startMiddle(v))
  }

  has(k) {
    return this.mongo.has(k)
  }

	async all() {
    var all = await this.mongo.all()
    var items = {}
    all.map(a => items[a.ID] = this.opt.endMiddle(a.data))
    return items
  }

  disconnect() {
    return this.mongo.disconnect()
  }
}

module.exports = mongo;