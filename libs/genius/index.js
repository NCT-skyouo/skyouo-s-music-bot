const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function apiCall(songName, key) {

  // get song id
  var url = `https://api.genius.com/search?q=${encodeURI(songName)}`;

  const headers = {
    Authorization: `Bearer ${key}`
  };
  try {
    var body = await fetch(url, { headers });
    var result = await body.json();
    const songID = result.response.hits[0].result.id;

    // get lyrics
    url = `https://api.genius.com/songs/${songID}`;
    body = await fetch(url, { headers });
    result = await body.json();

    const song = result.response.song;
    let lyrics = await getLyrics(song.url);
    lyrics = lyrics.replace(/(\[.+\])/g, '');

    return { lyrics: lyrics, title: song.title, image: song.description_annotation.annotatable.image_url }
  } catch (e) {
    
  }
}

async function getLyrics(url) {
  const response = await fetch(url);
  const text = await response.text();
  const $ = cheerio.load(text);
  try {
    let lyrics = $('div[class="lyrics"]').text().trim();
    if (!lyrics) {
      lyrics = ''
      $('div[class^="Lyrics__Container"]').each((i, elem) => {
        if ($(elem).text().length !== 0) {
          let snippet = $(elem).html()
            .replace(/<br>/g, '\n')
            .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
          lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
        }
      })
    }
    if (!lyrics) return null;
    return lyrics.trim();
  } catch (e) {
    throw e;
  }
}

module.exports = () => {
  return {
    apiCall: apiCall
  }
}