// not finished and not tested :/
const fs = require("fs");
class DBError extends Error {  
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, DBError);
  }
}
class DBStreamError extends Error {
  // Will be used on Client 'n Server.
    constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, DBStreamError);
  }
}

class database {
  constructor(name, path=__dirname + "/database") {
    // globally the database name.
    this.name = name;
    // defined path.
    this.path = path + "/" + name + ".json" || name + ".json"
    // raw path, for create backup json.
    this.rawPath = path;
    // create a json if not exists.
    if (!fs.existsSync(this.path)) try { fs.writeFileSync(this.path, JSON.stringify({})); } catch (e) { throw new DBError("Error when init database '" + name + "' error code:\n" + e.toString())}

  }
  _init_() {
    /**
     * Note I: Use it wisely, it clear the database.
     * Note II: It would be deprecated since it is dangerous.
     */
    try { fs.writeFileSync(this.path, JSON.stringify({})); } catch (e) { throw new DBError("Error when init database " + name + " error code:\n" + e) }
    return true;
  }
  set(name=null, value=null) {
    // catch the error.
    try {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    } catch (e) { throw new DBError("Error when read database " + name + " error code:\n" + e) }
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // delete the data from memory.
    db = null;
    // set the value
    parsed[name] = value
    // save the data to json.
    try { fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2)); } catch (e) { throw new DBError("Error when write data database " + name + " error code:\n" + e) }
    // return the object.
    return parsed;
  }
  remove(name=null, mode="major") {
    /**
     * mode introduct
     * major - delete the key and value.
     * weak - only set value to null. (keep the key).
     * backup - delete the key and value (like major), but create a backup file.
     * Note I: New mode? backup_weak
     */
    // detect the mode.
    switch(mode) {
      case "major":
        // read entire json.
        var db = fs.readFileSync(this.path, 'utf-8');
        // parse json string to json object.
        var parsed = JSON.parse(db);
        // delete the value.
        parsed[name] = undefined;
        // delete the key
        parsed = JSON.parse(JSON.stringify(parsed, null, 2));
        // delete the data from memory
        db = null;
        // save the data to json.
        fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
        // return the object.
        return parsed;
        // exit
        break;
      case "weak":
        // read entire json.
        var db = fs.readFileSync(this.path, 'utf-8');
        // parse json string to json object.
        var parsed = JSON.parse(db);
        // delete the value.
        parsed[name] = null;
        // keep the key
        parsed = JSON.parse(JSON.stringify(parsed, null, 2));
        // delete the data from memory
        db = null;
        // save the data to json.
        fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
        // return the object.
        return parsed;
        // exit
        break;
      case "backup":
        // read entire json.
        var db = fs.readFileSync(this.path, 'utf-8');
        // parse json string to json object.
        var parsed = JSON.parse(db);
        // write the data to backup json
        fs.writeFileSync(this.rawPath + "/backup" + this.name + ".bak.json",  JSON.stringify(parsed, null, 2))
        // delete the value.
        parsed[name] = undefined;
        // delete the key
        parsed = JSON.parse(JSON.stringify(parsed, null, 2));
        // delete the data from memory
        db = null;
        // save the data to json.
        fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
        // return the object.
        return parsed;
        // exit
        break;
      default:
        throw new DBError("Unknown option.");
      }
    }
  get(name=null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // clean the db
    db = null;
    // return the value.
    return parsed[name];
  }
  all() {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // clean the db
    db = null;
    // return entire raw json.
    return parsed;
  }
  add(name=null, value=null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // delete the data from memory.
    db = null;
    // detect if value/parsed value are number, else throw a error.
    if (typeof value !== "number") throw new DBError("Error type for value it should be number");
    // add the value
    parsed[name] = parsed[name] ? parsed[name] + value : 0 + value;
    // save the data to json.
    fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
    // return the object.
    return parsed;
  }
  subtract(name=null, value=null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // delete the data from memory.
    db = null;
    // detect if value/parsed value are number, else throw a error.
    if (typeof value !== "number") throw new DBError("Error type for value it should be number")
    // add the value
    parsed[name] = parsed[name] ? parsed[name] - value : 0 - value;
    // save the data to json.
    fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
    // return the object.
    return parsed;
  }
  push(name=null, value=null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // delete the data from memory.
    db = null;
    // if the data not exists, create one (array).
    parsed[name] = parsed[name] || [];
    // push the value
    parsed[name].push(value)
    // save the data to json.
    fs.writeFileSync(this.path, JSON.stringify(parsed, null, 2));
    // return the object.
    return parsed;
  }
  has(name=null) {
    // read entire json.
    var db = fs.readFileSync(this.path, 'utf-8');
    // parse json string to json object.
    var parsed = JSON.parse(db);
    // clean the db
    db = null;
    // return the statement of database has name.
    return parsed.hasOwnProperty(name);
  }
  extend(name, path=__dirname) {
    // make a new database, and copy old json, if exists, throw a error.
    if (fs.existsSync(path + "/" + name + ".json")) throw new DBError("Old database exists.")
    else fs.writeFileSync(path + "/" + name + ".json", JSON.stringify(this.all(), null, 2));
    return new database(name, path);
  }
  toString() {
    return this.name;
  }
}

class DBMaker {
  // leave for DBManager's 
}

class DBmanager {
  // no comment now.
  // Will be added later.
  // Note I: t2j will break the value of int or nan ( FIXED :) )
  // Note II: t2j will break the value of stringify json
  constructor() {}

  new(name, path=__dirname) {
    // just create a new database, but not copy anything.
    return new database(name, path);
  }

  j2t(db) {
    if (!db) throw new DBError("DB is not includes in function 'j2t'.");
    var raw_data = JSON.parse(JSON.stringify(db.all()))
    var temp = [];
    for (const i in raw_data) {
      var det = isNaN(raw_data[i]) !== true ? raw_data[i] : Object.prototype.toString.call(raw_data[i]) === "[object Object]" ? JSON.stringify(raw_data[i]) : raw_data[i]
      temp.push(i + ":" + det);
    }
    fs.writeFileSync(db.rawPath + "/" + db.name + ".txt", temp.join(",\n"))
    return db.rawPath + "/" + db.name + ".txt";
  }

  t2j(path, name="t2j") {
    // Note I: Not stable, if you try to convent json, it will break.
    var data = fs.readFileSync(path, 'utf-8');
    data = data.split(",\n");
    var temp = {};
    for (const i in data) {
      const rs = data[i].split(":");
      const rss = data[i].split(":").slice(1).join(":");
      temp[rs[0]] = isNaN(rss) !== true ? parseInt(rs[1]) : this._isJson(this._parseStringJSON(rss)) ? this._parseStringJSON(rss) : rss;
    }
    fs.writeFileSync(__dirname + "/" + name + ".json", JSON.stringify(temp, null, 2));
    return path + "/" + name + ".json";
  }

  merge(db1, db2, name="merged") {
    // Note I: priority: db1 > db2, so db1's data will cover db2's.
    var db_res = db2.all();
    var pep = db1.all();
    for (const i in pep) {
       db_res[i] = pep[i];
    }
        try { fs.writeFileSync(db1.rawPath + "/" + name + ".json", JSON.stringify(db_res, null, 2)) } catch (e) { throw new DBError("Error when write data to database. Error code:\n" + e) }
    return db1.rawPath + "/" + name + ".json";
  }

  _isJson(obj) {
  // obj instanceof Object
    if (Object.prototype.toString.call(obj) !== "[object Object]") return false;
    return true;
  }

  _isStringJSON(str) {
    if (!str.startsWith("{") || !str.endsWith("}")) return false;
    return true
  }

  _parseStringJSON(str) {
    if (!this._isStringJSON(str)) return false;
    const data = JSON.parse(`{ "res": ${str} }`);
    return data.res;
  }
}

class DBData {
  constructor(db) {
    console.log("beta feature.")
    this.data = db.all();
    this.path = { "file": db.path, "name": db.rawPath }
  }
  beauty() {
    if (this.data instanceof Array) throw new TypeError("Data must be not arrayed.")
    return JSON.parse(JSON.stringify(this.data, null, 2));
  }
  str() {
    if (this.data instanceof Array) throw new TypeError("Data must be not arrayed.")
    return JSON.stringify(this.data, null, 2)
  }
  array() {
    var res = [];
    for (const i in this.data) {
      res.push({name: i, data: this.data[i]});
    }
    this.data = res;
    return res;
  }
  lb() {
    /**
     * data must be arrayed.
     */
    function _compare(a, b) {
      return b.data - a.data;
    }
    if (!this.data instanceof Array) throw new TypeError("Data must be arrayed.")
    return this.data.sort(_compare)
  }
}

const http = require("http");
const url = require('url');
const defaultCallback = () => {
  return;
}

class DBServer {
  constructor(db) {
    this.db = db;
  }

  init(host, port, cb=defaultCallback) {
    const server = http.createServer()
    server.listen(port, host);
    this.server = server;
    return cb();
  }

  _httpGet() {
    return new Promise((resolve, reject) => {
      http.get(url, res => {
        res.setEncoding('utf8');
        let body = ''; 
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      }).on('error', reject);
    });
  };

  httpConfig(req, res) {
    if (req.url == "set") {
      let q = url.parse(req.url, true).query;
      if (!q.name) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.write("Bad Request.")
        return res.end();
      }
      if (!q.value) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.write("Bad Request.")
        return res.end();
      }
      try {
        this.db.set(q.name, q.value)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(db.all()));
      } catch (e) {

      }
    }
  }
}
module.exports = {
  version: "0.0.6",
  advanced: "0.0.6-beta-main",
  Database: database,
  DBManager: DBmanager,
  DBDataManager: DBData
}