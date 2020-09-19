const zlib = require("zlib");

module.exports = class {
  constructor() {}
  
  static compress(any) {
    return new Promise((res, rej) =>{
      try {
        any = Buffer.from(any, 'utf8');
        zlib.deflate(any, res).catch(rej);
      } catch (e) { rej(e) }
    });
  }
  
  static decompress(any) {
    return new Promise((res, rej) => {
      try {
        any = Buffer.from(any, 'utf8');
        zlib.inflate(any, res).catch(rej);
      } catch (e) { rej(e) }
    });
  }

  static compressSync(any) {
    return zlib.deflateSync(any).toString("base64");
  }
  
  static decompressSync(any) {
    if (!any || any == "") return "";
    return zlib.inflateSync(Buffer.from(any, "base64")).toString();
  }
}