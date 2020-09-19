const crypto = require("crypto");

module.exports = class {
  constructor() {}
  
  static encrypt(hash, content) {
    var hashes = crypto.createHash(hash);
    hashes.update(content);
    return hashes.digest("hex");
  }
}