const fetch = require("node-fetch")
var cheerio = require('cheerio');
async function search(q, opt = "") {
  const res = await fetch("https://mojim.com/" + encodeURIComponent(q) + ".html?t3" + opt, {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.54"
  });
  const html = await res.text();
  var $ = cheerio.load(html);
  var select = $("tr .mxsh_dd1").find("a");
  var result = [];
  for (let i = 0; i < select.length; i++) {
    if (i % 3 !== 2) continue
    var attr = select[i.toString()].attribs;
    var kek = JSON.parse(JSON.stringify(attr))
    result.push(kek);
  }
  return result;
}

async function searchByLyrics(q, opt = "") {
  const res = await fetch("https://mojim.com/" + encodeURIComponent(q) + ".html?t4" + opt, {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4585.0 Safari/537.36"
  });
  const html = await res.text();
  var $ = cheerio.load(html);
  var select = $("tr .mxsh_dd1").find("a");
  //var select = $("dl .mxsh_dl0").find("a");
  var result = [];
  for (let i = 0; i < select.length; i++) {
    if (i % 2 !== 1) continue
    var attr = select[i.toString()].attribs;
    var kek = JSON.parse(JSON.stringify(attr))
    result.push(kek);
  }
  return result;
}

async function searchBySong(q, opt = "") {
  const res = await fetch("https://mojim.com/" + encodeURIComponent(q) + ".html?t3" + opt, {
    "User-Agent": "Mozilla/5.0 (X11; FreeBSD amd64) AppleWebKit/605.1.15 (KHTML, like Gecko) Firefox/91 Safari/605.1.15"
  });
  const html = await res.text();
  var $ = cheerio.load(html);
  var select = $("table .iB").find("a");
  var result = [];
  for (let i = 0; i < select.length; i++) {
    if (i % 3 !== 2) continue
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

function rmUseless(lyrics) {
  return lyrics.trim().split("\n").filter(l => !l.startsWith("[")).map(l => l.trim()).filter(l => !l.startsWith("感謝 ")).join("\n").trim().replace(`\n+`, "\n").trim()
}

module.exports = () => {
  return {
    search: search,
    searchByLyrics: searchByLyrics,
    searchBySong: searchBySong,
    lyrics: lyrics,
    rmADs: rmADs,
    rmUseless: rmUseless,
    version: "1.0.0",
    author: "NCT skyouo"
  }
}