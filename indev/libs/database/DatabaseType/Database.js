/**
 * @interface
 * @ignore
 * @protected
 * @deprecated
 * @since 1.0.0b1
 */
module.exports = class {
  constructor(db) {
    if (!db == this) {
      throw new ReferenceError("請不要使用該類方法!");
    }
  }
  
  set() {}
  
  setSync() {}
  
  get() {}
  
  getSync() {}
  
  find() {}
  
  findSync() {}
  
  has() {}
  
  hasSync() {}
  
  all() {}
  
  allSync() {}
  
  remove() {}
  
  removeSync() {}
  
  removeByFilter() {}
  
  removeByFilterSync() {}
  
  fork() {}
  
  forkSync() {}
  
  filter() {}
  
  filterSync() {}
  
  save() {}
  
  saveSync() {}
  
  md5() {}
  
  sha1() {}
  
  sha256() {}
  
  sha512() {}
}