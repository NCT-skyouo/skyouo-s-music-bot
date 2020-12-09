const mysql = require('sync-mysql');
const sql = require('sql');

class MySQLStoring {
  constructor(name, options={}) {
    this.name = name
    this.opt = options
    this.opt.startMiddle = this.opt.startMiddle || (n => n)
    this.opt.endMiddle = this.opt.endMiddle || (n => n)

    this.connection = new mysql({
      host: options.host,
      user: options.user,
      password: options.password,
      database: options.database
    });

    sql.setDialect("mysql")

    this.table = sql.define({
			name: name,
			columns: [
				{
					name: 'key',
					primaryKey: true,
					dataType: `VARCHAR(255)`
				},
				{
					name: 'value',
					dataType: 'LONGTEXT'
				}
			]
		})

    this.connection.query(this.table.create().ifNotExists().toString())
  }

  set(k, v) {
    v = this.opt.startMiddle(v)
    k = k.replace(/\\/g, "\\\\")
    v = v.replace(/\\/g, "\\\\")
    this.connection.query(this.table.replace({ key: k, value: v }).toString())
    return this
  }

  remove(k) {
    this.connection.query(this.table.delete().where({ key: k }).toString())
    return this
  }

  get(k) {
    var r = this.connection.query(this.table.select().where({ key: k }).toString())[0].value;
    return this.opt.endMiddle(r)
  }

  add(k, v) {
    this.set(k, this.get(k) + v)
    return this
  }

  subtract(k, v) {
    this.set(k, this.get(k) - v)
    return this
  }

  push() {
    throw new Error("Since MySQL doesn't support array, so uwu")
  }

  has(k) {
    return this.all().hasOwnProperty(k)
  }

  all() {
    var all = this.connection.query("SELECT * FROM " + this.name)
    var items = {}
    all.map(a => items[a.key] = this.opt.endMiddle(a.value))
    return items
  }

  disconnect() {}
}

module.exports = MySQLStoring