const fs = require("fs");
const { compress, decompress, compressSync, decompressSync } = require("./compression.js");

module.exports = class {
  constructor() {}
  
  read(path) {
    return new Promise((res, rej) => {
      fs.readFile(path, "utf-8", (err, result) => {
        if (err) rej(err);
        decompress(result).then(res).catch(rej);
      });
    });
  }
  
  readSync(path) {
    return decompressSync(fs.readFileSync(path, "utf-8"));
  }
  
  write(path, thing) {
    return new Promise((res, rej) => {
      compress(thing).then(twrite => {
        fs.writeFile(path, twrite, "utf-8", (err) => {
          if (err) rej(err);
          res(true);
        })
      });
    });
  }
  
  writeSync(path, thing) {
    return fs.writeFileSync(path, compressSync(thing), "utf-8");
  }
  
  pipe(input, output) {}
  
  pipeSync(input, output) {}
}