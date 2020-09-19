const fs = require("fs");
const path = require("path");
const os = require("os");

const cache = require("../memoryCache.js").Cache;

const Database = require(path.resolve(__dirname, "Database.js"));
const DBError = require("../Errors/DatabaseError.js");
const dbcrypt = require("../dbcrypt.js");
const DBFS = require("../dbfs.js");
const dbfs = new DBFS();

/**
 * @method
 * @class
 * @since 1.0.0b7
 * @author NCT skyouo
 * Store data in memory, save them with save()
 */
module.exports = class extends Database {

  constructor(name, pathOfDB, options={}) {
    super(Database);
    this.cache = new cache();
    this.eol = options.eol || os.eol;
    this.timeout = options.timeout || undefined;
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


  /**
   * @public
   * @async
   * @param {string} key - Key
   * @param {any} value - Value
   * @returns {Object} this
   */
  set(key=null, value) {
    return new Promise((res, rej) => {
      if (typeof key !== "string") rej(new DBError("Key 無定義! 或者 Key 只能為 String"));
      this.cache.put(key, value, this.timeout)
      res(this);
    });
  }
  
  /**
   * @public
   * @sync
   * @param {string} key - Key
   * @param {any} value - Value
   * @returns {Object} this
   */
  setSync(key, value) {
     if (typeof key !== "string") throw new DBError("Key 無定義! 或者 Key 只能為 String");
     this.cache.put(key, value, this.timeout);
     return this;
  }

  /**
   * @public
   * @async
   * @param {string} key - Key
   * @returns [{any|null}] - Value
   */
  get(key) {
    return new Promise((res, rej) => {
      if (typeof key !== "string") rej(new DBError("Key 無定義! 或者 Key 只能為 String"));
      res(this.cache.get(key));
    });
  }
  
  getSync(key) {
    if (typeof key !== "string") throw new DBError("Key 無定義! 或者 Key 只能為 String");
    return this.cache.get(key);
  }

  /**
   * @todo
   */
  find() {}
  
  /**
   * @todo
   */
  findSync() {}
  
  has() {
    return new Promise((res, rej) => {
      if (typeof key !== "string") rej(new DBError("Key 無定義! 或者 Key 只能為 String"));
      res(this.cache.get(key) !== null);
    });
  }
  
  hasSync(key) {
    if (typeof key !== "string") throw new DBError("Key 無定義! 或者 Key 只能為 String");
    return this.cache.get(key) !== null;
  }
  
  all() {
    return new Promise((res) => {
      res(JSON.parse(this.cache.exportJson()));
    });
  }
  
  allSync() {
    return JSON.parse(this.cache.exportJson());
  }
  
  remove() {}
  
  removeSync() {}
  
  removeByFilter() {}
  
  removeByFilterSync() {}
  
  fork() {}
  
  forkSync() {}
  
  filter() {}
  
  filterSync() {}
  
  save(json) {
    return new Promise((res, rej) => {
      json = JSON.stringify(json, null, 2);
      this.cache.importJson(json)
      dbfs.write(this.path, json)
      .then(() => res(this)).catch(rej);
    });
  }
  
  saveSync(json) {
    json = JSON.stringify(json, null, 2);
    this.cache.importJson(json);
    dbfs.writeSync(this.path, json);
    return this;
  }
  
  md5() {}
  
  sha1() {}
  
  sha256() {}
  
  sha512() {}
}