const fetch = require("node-fetch")
var cheerio = require('cheerio');
async function search(q, opt="") {
  const res = await fetch("https://mojim.com/"+ encodeURIComponent(q)+".html?t3" + opt, {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"
  });
  const html = await res.text();
  var $ = cheerio.load(html);
  var select = $("tr .mxsh_dd1").find("a");
  var result = [];
  for (let i = 0 ; i < select.length ; i++) {
    if (i % 3 !== 2) continue
    var attr = select[i.toString()].attribs;
    var kek = JSON.parse(JSON.stringify(attr))
    result.push(kek);
  }
  return result;
}

async function searchByLyrics(q, opt="") {
  const res = await fetch("https://mojim.com/"+ encodeURIComponent(q)+".html?t4" + opt, {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"
  });
  const html = await res.text();
  var $ = cheerio.load(html);
  var select = $("tr .mxsh_dd1").find("a");
  // var select = $("dl .mxsh_dl0").find("a");
  var result = [];
  for (let i = 0 ; i < select.length ; i++) {
   if (i % 2 !== 1) continue
    var attr = select[i.toString()].attribs;
    var kek = JSON.parse(JSON.stringify(attr))
    result.push(kek);
  }
  return result;
}

async function lyrics(search, which) {
  const res = await fetch("https://mojim.com/" + search[which].href);
  const html = await res.text()
  var $ = cheerio.load(html.replace(/<br \/>/g, "\n"), { decodeEntities: false });
  var select = $(`tr`).find(`div .fsZ`).find(`dl`, `.fsZx2`)
  return select.text()
}

function rmADs(lyrics) {
  return lyrics.replace("更多更詳盡歌詞 在 ※ Mojim.com　魔鏡歌詞網", "")
  .replace("更多更詳盡歌詞", "")
  .replace("在 ※ Mojim.com　魔鏡歌詞網", "")
}

module.exports = () => {
  return {
    search: search,
    searchByLyrics: searchByLyrics,
    lyrics: lyrics,
    rmADs: rmADs,
    version: "0.0.1",
    author: "NCT skyouo"
  }
}