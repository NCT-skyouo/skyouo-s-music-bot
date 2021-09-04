const fs = require("fs")
const path_ = require("path")

function write() {
  if (this.opt.caching) fs.writeFileSync(this.path, this.opt.startMiddle(this.cache, null, 2))
}

class JSONStoring {
  constructor(name, options={}) {
    this.name = name
    this.path = path_.join(path_.resolve(options.path), `${name}.json`)
    this.cache = null
    this.opt = options
    this.opt.startMiddle = this.opt.startMiddle || (n => n)
    this.opt.endMiddle = this.opt.endMiddle || (n => n)

    if (fs.existsSync(this.path)) {
      if (options.caching) {
        this.cache = this.opt.endMiddle(fs.readFileSync(this.path, "utf8"))
      }
    } else {
      fs.writeFileSync(this.path, "{}")
      if (options.caching) this.cache = {}
    }

    if (options.noRealTimeUpdate) {
      Array.from([`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`]).forEach((eventType) => {
        process.once(eventType, write.bind(this, this))
      })
    }
  }

  set(k, v) {
    return new Promise(async (resolve) => {
      var cache = await this.all()
      cache[k] = v
      this._write(cache)
      return resolve()
    })
  }


  remove(k) {
    return new Promise(async (resolve) => {
      var cache = await this.all()
      delete cache[k]
      cache = this.opt.endMiddle(this.opt.startMiddle(cache))
      this._write(cache)
      return resolve()
    })
  }

  get(k) {
    return new Promise(async (resolve) => {
      var result = await this.all()
      return resolve(result[k])
    })
  }

  add(k, v) {
    return new Promise(async (resolve) => {
      var cache = await this.all()
      cache[k] += v
      this._write(cache)
      return resolve()
    })
  }

  subtract(k, v) {
    return new Promise(async (resolve) => {
      var cache = await this.all()
      cache[k] -= v
      return this._write(cache)
    })
  }

  push(k, v) {
    return new Promise(async (resolve) => {
      var cache = await this.all()
      cache[k].push(v)
      this._write(cache)
      return resolve()
    })
  }

  has(k) {
    return new Promise(async (resolve) => {
      var result = await this.all()
      return resolve(result.hasOwnProperty(k))
    })
  }

  all() {
    return new Promise(async (resolve) => {
      return resolve(this.opt.caching ? this.cache : this.opt.endMiddle(fs.readFileSync(this.path, "utf8")))
    })
  }

  _write(cache=this.cache) {
    if (!this.opt.noRealTimeUpdate) fs.writeFileSync(this.path, this.opt.startMiddle(cache))
    return this
  }

  disconnect() {}
}

module.exports = JSONStoring