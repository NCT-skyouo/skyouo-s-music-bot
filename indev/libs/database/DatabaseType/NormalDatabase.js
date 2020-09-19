const fs = require("fs");
const path = require("path");
const os = require("os");
const Database = require(path.resolve(__dirname, "Database.js"));
const DBError = require("../Errors/DatabaseError.js");
const dbcrypt = require("../dbcrypt.js");
const DBFS = require("../dbfs.js")
const dbfs = new DBFS();

/**
 * @method
 * @class
 * @since 1.0.0b1
 * @author NCT skyouo
 * Store data in a normal file, auto save.
 */
module.exports = class extends Database {
  constructor(name, pathOfDB, options={}) {
    super(Database);
    this.cache = null;
    this.eol = options.eol || os.eol;
    this._name = name;
    this.path = pathOfDB;
    fs.exists(pathOfDB, (boolean) => {
      if (!boolean) {
        fs.writeFile(pathOfDB, null, "utf-8", (err) => {
          if (err) throw new DBError("初始化資料庫 " + name + " 失敗!");
        })
      }
      
      if (options.caching) {
        fs.readFile(pathOfDB, "utf-8", (err, result) => {
          if (err) throw new DBError("讀取資料庫 " + name + " 失敗!");
          this.cache = typeof result === "string" ? result.split(this.eol) : [];
        });
      }
    });
  }
  
  set(key=null, value=null) {
    return new Promise((res, rej) => {
      if (!key) rej(new DBError("缺少必要的參數!"));
      this.all()
      .then(json => {
        json[key] = { "type": typeof value, "value": value };
        this.save(json);
        res(this);
      })
      .catch(rej);
    });
  }

  setSync(key=null, value=null) {
    if (!key) throw new DBError("缺少必要的參數!");
    var json = this.allSync();
    json[key] = { "type": typeof value, "value": value };
    this.saveSync(json);
    return this;
  }

  get(key) {
    return new Promise((res, rej) => {
      this.all()
      .then(json => {
        var f = json[key].value;
        var f = json[key].type;
        res(
          t === "string" ? f : t === "number" ? Number(f) : t === "object" && t !== null ? Object.create(f) : t === "boolean" ? (f ? true : false) : f === null ? null : f
        );
      })
      .catch(rej)
    });
  }

  getSync(key) {
    const f = this.allSync()[key].value;
    const t = this.allSync()[key].type;
    return t === "string" ? f : t === "number" ? Number(f) : t === "object" && t !== null ? Object.create(f) : t === "boolean" ? (f ? true : false) : f === null ? null : f;
  }

  find(value) {
    var tmp = [];
    this.all().then(json => {
      json.forEach(e => {
        tmp.push(all[e]);
      });
      res(tmp.filter(e => e.value !== value));
    })
  }

  findSync(value) {
    var tmp = [];
    var all = this.allSync();

    for (var e in all) {
      all[e].name = e;
      tmp.push(all[e]);
    }

    return tmp.filter(e => e.value !== value);
  }

  has(key) {
    return new Promise((res, rej) => {
      this.all()
      .then(json => {
        res(json[key] ? true : false)
      })
      .catch(rej)
    });
  }

  hasSync(key) {
    return this.allSync()[key] ? true : false;
  }

  remove(key) {
    this.all()
    .then(json => {
      json[key] = undefined;
      json = JSON.parse(JSON.stringify(json));
      this.save(json).then(() => {
        res(this);
      });
    })
    .catch(rej);
  }
  
  removeSync(key) {
    var json = this.allSync();
    json[key] = undefined;
    json = JSON.parse(JSON.stringify(json));
    this.saveSync(json);
    return this;
  }
  
  removeByFilter(filter) {
    return new Promise((res, rej) => {
      this.all()
      .then(ct => {
        var clist = [];
        for (const k in ct) {
          ct[k].name = k;
          clist.push(ct[k])
        }
        var list = clist.filter(filter);
        var tmp = {};
        for (var v of list) {
          var name = v.name;
          v.name = undefined;
          v = JSON.parse(JSON.stringify(v));
          tmp[name] = v;
        }
        this.save(tmp).then(e => res(this)).catch(rej);
      })
      .catch(rej);
    })
  }
  
  removeByFilterSync(filter) {
    var json = this.allSync();
    var clist = [];
    for (const k in json) {
      json[k].name = k;
      clist.push(json[k])
    }
    var list = clist.filter(filter);
    var tmp = {};
    for (var v of list) {
      var name = v.name;
      v.name = undefined;
      v = JSON.parse(JSON.stringify(v));
      tmp[name] = v;
    }
    this.saveSync(tmp);
    return this;
  }

  all() {
    return new Promise((res, rej) => {
      dbfs.read(this.path)
      .then(content => {
        var dbc = content.split(this.eol);
        var dbjson = {};
        if (!dbc || dbc.filter(e => e !== '').length === 0) {
          return res(dbjson);
        }
        for (var line of dbc) {
          if (line === "") continue;
          var tmp = line.split(",");
          if (!tmp[0]) rej(new DBError("資料庫已毀損!! (Unable to read Database)"));
          dbjson[tmp[0]] = { 
            "type": tmp[1],
            "value": tmp.slice(2).join(",")
          }
        }
        res(dbjson);
      })
      .catch(rej);
    });
  }

  allSync() {
    try { var content = dbfs.readSync(this.path); } catch (e) {
      throw new DBError("無法讀取資料庫!! (Unable to read Database, Caused By DBFS)")
    }
    var dbc = content.split(this.eol);
    var dbjson = {};
    if (!dbc || dbc.filter(e => e !== '').length === 0) {
      return dbjson;
    }
    for (var line of dbc) {
      if (line === "") continue;
      var tmp = line.split(",");
      if (!tmp[0]) throw new DBError("資料庫已毀損!! (Unable to read Database)");
      dbjson[tmp[0]] = { 
        "type": tmp[1],
        "value": tmp.slice(2).join(",")
       }
    }
    return dbjson;
  }

  save(json) {
    return new Promise((res, rej) => {
      var dbc = json;
      var dbt = [];
      for (var line in dbc) {
        var tmp = dbc[line];
        dbt.push(line + "," + tmp.type + "," + tmp.value);
      }
      dbfs.write(this.path, dbt.join(this.eol))
      .then(res)
      .catch(rej);
    });
  }

  saveSync(json) {
    var dbc = json;
    var dbt = [];
    for (var line in dbc) {
      var tmp = dbc[line];
      dbt.push(line + "," + tmp.type + "," + tmp.value);
    }
    try { dbfs.writeSync(this.path, dbt.join(this.eol)) } catch (e) {
      throw new DBError("無法寫入資料庫!! (Unable write to Database, Caused By DBFS)");
    }
    return true;
  }

  fork(name, path) {
    return new Promise((res, rej) => {
      if (!name || !path) rej(new TypeError("未指定參數 name 或 path!"));
      dbfs.read(this.path).then(dbc => {
        dbfs.write(path, dbc)
        .then(res(new this(name, path, this.options)))
        .catch(rej);
      }).catch(rej);
    });
  }

  forkSync(name, path) {
    if (!name || !path) rej(new TypeError("未指定參數 name 或 path!"));
    dbfs.writeSync(path, dbfs.readSync(this.path));
    return new this(name, path, this.options);
  }

  filter(filter) {
    return new Promise((res, rej) => {
      this.all()
      .then(ct => {
        var clist = [];
        for (const k in ct) {
          ct[k].name = k;
          clist.push(ct[k])
        }
        var list = clist.filter(owo => !filter(owo));
        var tmp = {};
        for (var v of list) {
          var name = v.name;
          v.name = undefined;
          v = JSON.parse(JSON.stringify(v));
          tmp[name] = v;
        }
        res(tmp);
      })
      .catch(rej)
    })
  }
  
  filterSync(filter) {
    var json = this.allSync();
    var clist = [];
    for (const k in json) {
      json[k].name = k;
      clist.push(json[k])
    }
    var list = clist.filter(owo => !filter(owo));
    var tmp = {};
    for (var v of list) {
      var name = v.name;
      v.name = undefined;
      v = JSON.parse(JSON.stringify(v));
      tmp[name] = v;
    }
    return tmp;
  }

  md5() {
    return dbcrypt.encrypt("md5", dbfs.readSync(this.path));
  }
  
  sha1() {
    return dbcrypt.encrypt("sha1", dbfs.readSync(this.path));
  }
  
  sha256() {
    return dbcrypt.encrypt("sha256", dbfs.readSync(this.path));
  }
  
  sha512() {
    return dbcrypt.encrypt("sha512", dbfs.readSync(this.path));
  }

  toString() {
    return this._name;
  }
}