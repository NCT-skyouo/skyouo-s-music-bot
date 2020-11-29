const config = require('./config/config.json')
const Store = require("./libs/better-storing/index.js")()

module.exports = (name, dbname) => {
  Store.use(config.store[dbname].type.toUpperCase())
  var Database = Store.getStoringInstance()
  var middles = Store.getBulitInMiddle()
  var opt = config.store[dbname][config.store[dbname].type]
  opt.startMiddle = middles.startJSON
  opt.endMiddle = middles.endJSON
  return new Database(name, opt)
}