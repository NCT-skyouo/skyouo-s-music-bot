const Database = require("@replit/database")

class replit {
	constructor(name, opt={}) {
		this.name = name;

    this.opt = opt

    this.opt.startMiddle = this.opt.startMiddle || (n => n)
    this.opt.endMiddle = this.opt.endMiddle || (n => n)

		this.db = new Database()
	}

	get(k) {
		return this.db.get(k).then(value => {
      return this.opt.endMiddle(value);
    });
	}

	set(k, v) {
		return this.db.set(k, this.opt.startMiddle(v));
	}

	remove(k) {
		return this.db.set(k, 'undefined').then(() => {});
	}

  async add(k, v) {
    var gv = await this.db.get(k);
    return this.db.set(k, this.opt.startMiddle(Number(gv) + v))
  }

  async subtract(k, v) {
    var gv = await this.db.get(k);
    return this.db.set(k, this.opt.startMiddle(Number(gv) - v))
  }

  async push(k, v) {
    var gv = await this.db.get(k);
    gv.push(v)
    return this.db.set(k, this.opt.startMiddle(gv))
  }

  has(k) {
    return this.db.list().then(keys => {
      return keys.includes(k)
    });
  }

	async all() {
    return this.db.list().then(async keys => {
      let r = {}
      for (let k of keys) {
        let v = await this.db.get(k)
        r[k] = v
      }
      return r
    });
  }

  disconnect() {
    return undefined;
  }
}

module.exports = replit;