const fs = require("fs");

module.exports = class {
  constructor() {}
  
  read(path) {
    return new Promise((res, rej) => {
      fs.readFile(path, "utf-8", (err, result) => {
        if (err) rej(err);
        res(result);
      });
    });
  }
  
  readSync(path) {
    return fs.readFileSync(path, "utf-8");
  }
  
  write(path, thing) {
    return new Promise((res, rej) => {
      fs.writeFile(path, thing, "utf-8", (err) => {
        if (err) rej(err);
        res(true);
      })
    });
  }
  
  writeSync(path, thing) {
    return fs.writeFileSync(path, thing, "utf-8");
  }
  
  pipe(input, output) {}
  
  pipeSync(input, output) {}
}