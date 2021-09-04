async function search() {
  var search = new URLSearchParams(window.location.search).get("q");
  var hash = window.hash || "youtube";
  window.location = `/search?type=${hash}&q=${search}`
};

async function verifyacc() {
  var secwsace = getCookie("sec");
  var hash = window.hash || "youtube";
  if (!secwsace) {
    window.location.href = `/auth`
  } else {
    var searchtype = new URLSearchParams(window.location.search).get("type");
    var query = new URLSearchParams(window.location.search).get("q");
    if (!query || !searchtype) {
      return nonequery();
    }

    fetchResult();
  }
}

async function fetchResult() {
  var query = new URLSearchParams(window.location.search).get("q");
  var type = new URLSearchParams(window.location.search).get("type");
  var xd = isMobile();
  if (xd) {
    await document.getElementById('form').insertAdjacentHTML("beforeend", `
    <form>
      <div class="input-group mx-3 mb-5">
      <button class="btn btn-outline-secondary dropdown-toggle" id="search-type" type="button" data-bs-toggle="dropdown" aria-expanded="false">${type}</i></button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#">YouTube</a></li>
        <li><a class="dropdown-item" href="#">Spotify</a></li>
        <li><a class="dropdown-item" href="#">Soundcloud</a></li>
        <li><a class="dropdown-item" href="#">Netease Music</a></li>
        <li><a class="dropdown-item" href="#">BiliBili</a></li>
        <li><a class="dropdown-item" href="#">TikTok</a></li>
        <li><a class="dropdown-item" href="#">LBRY</a></li>
      </ul>            
      <input type="text" class="control" id="search-query" placeholder="Music Search" aria-label="Music Search" 
      aria-describedby="button-addon2" autocomplete="off" value="${query}" spellcheck="false" name="q" required>
      <div class="input-group-append">
        <button type="submit" id="button-addon2">
          Search
        </button>
      </div>
        </div>
    </form>
  `);
    document.getElementById('design').insertAdjacentHTML("beforeend", `
    <div id="search_result"></div>
  `);
    onphone();
  } else {
    /*await document.getElementById('form').insertAdjacentHTML("beforeend", `
     <center>
     <form>
       <div class="input-group">
         <input type="text" class="control" placeholder="Search" aria-label="Search" aria-describedby="button-addon2" autocomplete="off" value="${query}" spellcheck="false" name="q" required>
           <div class="input-group-append">
             <button type="submit" id="button-addon2">
               Search
             </button>
           </div>
         </div>
     </form>
     <center>
   `);*/
    document.getElementById('form').insertAdjacentHTML("beforeend", `<center>
    <form id="search-form">
    <div class="input-group mb-3 mx-auto">
      <button class="btn btn-outline-secondary dropdown-toggle" id="search-type" type="button" data-bs-toggle="dropdown" aria-expanded="false">${type}</i></button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#">YouTube</a></li>
        <li><a class="dropdown-item" href="#">Spotify</a></li>
        <li><a class="dropdown-item" href="#">Soundcloud</a></li>
        <li><a class="dropdown-item" href="#">Netease Music</a></li>
        <li><a class="dropdown-item" href="#">BiliBili</a></li>
        <li><a class="dropdown-item" href="#">TikTok</a></li>
        <li><a class="dropdown-item" href="#">LBRY</a></li>
      </ul>        
      <input type="text" class="control" id="search-query" placeholder="Music Search" aria-label="Music Search" 
      aria-describedby="button-addon2" autocomplete="off" value="${query}" spellcheck="false" name="q" required>
      <div class="input-group-append">
        <button type="submit" id="button-addon2">
          Search
        </button>
      </div>
    </div>
  </form>
  <center>`);
    document.getElementById('design').insertAdjacentHTML("beforeend", `
    <div class="container">
      <div class="row">
        <div id="xd"></div>
        <div id="search_result"></div>
      </div>
    </div>
  `);
    onpc();
  }

  $('.dropdown-item').on('click', function () {
    var button = $(this).parent().parent().siblings('button');
    $(button).html($(this).text());
    $(button).val($(this).text());
  });

  $("#search-form").on("submit", function (event) {
    event.preventDefault();
    window.location.href = `/search?type=${$('#search-type').text().trim()}&q=${$('#search-query').val()}`
  });

}

async function onphone() {
  var type = new URLSearchParams(window.location.search).get("type")
  var res = await fetch(`/api/search`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: new URLSearchParams(window.location.search).get("q"),
      type,
      sec: getCookie("sec")
    })
  })
  var req = await res.text();
  var json = JSON.parse(req);
  var secret = new fernet.Secret(json.key)
  json = JSON.parse(decryptData(json.result, secret))
  type = type.toLowerCase()
  json.data.forEach(async (xd, i) => {
    if (type === "youtube") xd.thumbnail = await youtubeThumbnailExists(`https://i.ytimg.com/vi/${xd.url.split('?v=')[1]}/maxresdefault.jpg`) // youtube thumbnail
    if (type === "bilibili") xd.thumbnail = "https://external-content.duckduckgo.com/iu/?u=" + xd['thumbnail'] // BiliBili Block Normal User, so we use DuckDuckGo to get the thumbnail
    /*var html = `
    <div id="search" class="mx-3">
      <div class="veve">
        <img src="${filterXSS(xd['thumbnail'])}" class="mx-3" width="180px"/>
      </div>
      <div class="article">
        <h2 class="title">${filterXSS(xd['name'])}</h2>
        <h4 class="description">vdsdsds</h4>
        <h4 class="description">${filterXSS(xd['duration'])}<h4>
          <a class="far fa-caret-circle-right mx-2 xdd" title="Play now"></a>
          <a class="far fa-arrow-alt-circle-up mx-2 xdd" title="Play next"></a> 
          <a class="fas fa-plus mx-2 xdd" title="Add to queue"></a>
      </div>
    </div>
    <hr/>
    `*/
    var xdddd = window.outerWidth;
    var html = `
    <div id="searchs" class="mx-3">
      <div>
        <img src="${filterXSS(xd['thumbnail'])}" width="${filterXSS(xdddd)}px" class="me-3"/>
      </div>
      <br>
      <div>
        <h1>${filterXSS(xd['name'])}</h2>
        <h4 class="subtit">${filterXSS(xd['description'])}</h4>
        <h4 class="subtit">${filterXSS(xd['duration'])}<h4>
          <a class="far fa-caret-circle-right mx-2 xdd" onclick="select(this)" title="Play now" data-action="play" data-youtube-search-data="${filterXSS(Base64.encode(JSON.stringify(xd), true))}"></a>
          <a class="far fa-arrow-alt-circle-up mx-2 xdd" onclick="select(this)"  title="Play next" data-action="play-next" data-youtube-search-data="${filterXSS(Base64.encode(JSON.stringify(xd), true))}></a> 
          <a class="fas fa-plus mx-2 xdd" onclick="select(this)"  title="Add to queue" data-action="add-to-queue" data-youtube-search-data="${filterXSS(Base64.encode(JSON.stringify(xd), true))}"></a>
      </div>
    </div>
    <hr/>
    `
    $('#search_result').append(html);
  });
}

async function onpc() {
  var type = new URLSearchParams(window.location.search).get("type")
  var res = await fetch(`/api/search`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: new URLSearchParams(window.location.search).get("q"),
      type,
      sec: getCookie("sec")
    })
  })
  var req = await res.text();
  var json = JSON.parse(req);
  var xd = $(document).width();
  var matth = Math.floor(xd / 7)
  var secret = new fernet.Secret(json.key)
  json = JSON.parse(decryptData(json.result, secret))
  type = type.toLowerCase()
  json.data.forEach(async (xd, i) => {
    if (type === "youtube") xd.thumbnail = await youtubeThumbnailExists(`https://i.ytimg.com/vi/${xd.url.split('?v=')[1]}/maxresdefault.jpg`) // Youtube api do not return normal max resolution thumbnail, so try to get it from youtube, if failed, fallback to default.
    if (type === "bilibili") xd.thumbnail = "https://external-content.duckduckgo.com/iu/?u=" + xd['thumbnail'] // BiliBili Block Normal User, so we use DuckDuckGo to get the thumbnail
    const html = `
    <div class="containers my-3">
      <div class="col-2 row">
        <img src="${filterXSS(xd['thumbnail'])}" width="${filterXSS(matth)}px" class="mx-auto"/>
      </div>
      <div class="col-8 mx-3">
        <h1 class="title">
          ${filterXSS(xd['name'])}
        </h1>
        <h3 class="description subtit">${filterXSS(xd['description'])}</h3>
        <br>
      </div>
      <div>
        <div class="col-4 ms-5">
          <p class="mx-2">${filterXSS(xd['duration'])}<p>
          <div class="control-button">
            <a class="fas fa-circle-play mx-2 xdd" onclick="select(this)" title="Play now" data-action="play" data-youtube-search-data="${filterXSS(Base64.encode(JSON.stringify(xd), true))}" data-bs-toggle="tooltip" data-bs-placement="top"></a>
            <a class="fas fa-circle-up mx-2 xdd" onclick="select(this)"  title="Play next" data-action="play-next" data-youtube-search-data="${filterXSS(Base64.encode(JSON.stringify(xd), true))}" data-bs-toggle="tooltip" data-bs-placement="top"></a> 
            <a class="fas fa-circle-plus mx-2 xdd" onclick="select(this)"  title="Add to queue" data-action="add-to-queue" data-youtube-search-data="${filterXSS(Base64.encode(JSON.stringify(xd), true))}" data-bs-toggle="tooltip" data-bs-placement="top"></a>
          </div>
        </div>
      </div>
    </div>`
    // document.getElementById('search_result').insertAdjacentHTML("beforeend", html);
    $('#search_result').append(html);
  });
}

async function nonequery() {
  // 想个办法做到辨认是否正在播放歌曲
  // 可以用 socket.io 来辨认

  window.location.replace('/?err=NO_QUERY')
}

function decryptData(cipher, key) {
  var token = new fernet.Token({
    secret: key,
    token: cipher,
    ttl: 0
  })
  return token.decode();
}

async function youtubeThumbnailExists(url) {
  try {
    var http = await fetch('/api/head', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) }).then(r => r.json());
    if (!http.error) return url
    else return url.replace('maxresdefault.jpg', 'hqdefault.jpg')
  } catch (e) {
    return url.replace('maxresdefault.jpg', 'hqdefault.jpg')
  }
}

let lock = false

function select(a) {
  if (lock) return
  lock = true
  var socket = io();
  function clearListener() {
    socket.removeAllListeners('request_ok_and_done')
    socket.removeAllListeners('request_error')
    socket.disconnect()
  }
  var action = $(a).attr('data-action')
  var data = JSON.parse(Base64.decode(($(a).attr('data-youtube-search-data'))))
  var sec = getCookie('sec')
  switch (action) {
    case 'play':
      getXreer(sec).then(xreer => {
        socket.emit('play', xreer, data)
        socket.on('request_ok_and_done', (track) => {
          clearListener()
          window.location.replace(`/?playing=true&author=${encodeURIComponent(track.author)}&duration=${encodeURIComponent(track.duration)}&title=${encodeURIComponent(track.name)}&url=${track.url}&requester=${encodeURIComponent(xreer.username + '#' + xreer.discriminator)}`)
        })
        socket.on('request_error', (error) => {
          clearListener()
          window.location.replace('/?err=ERROR_WHILE_PLAYING_SONG&message=' + encodeURIComponent(error))
        })
      }).catch(e => {
        window.location.replace('/?err=NOT_LOGIN')
      })
      break;
    case 'play-next':
      getXreer(sec).then(xreer => {
        socket.emit('play', xreer, data)
        socket.on('request_ok_and_done', (track) => {
          clearListener()
          window.location.replace(`/?playing=true&author=${encodeURIComponent(track.author)}&duration=${encodeURIComponent(track.duration)}&title=${encodeURIComponent(track.name)}&url=${track.url}&requester=${encodeURIComponent(xreer.username + '#' + xreer.discriminator)}`)
        })
        socket.on('request_error', (error) => {
          clearListener()
          window.location.replace('/?err=ERROR_WHILE_PLAYING_SONG&message=' + encodeURIComponent(error))
        })
      }).catch(e => {
        window.location.replace('/?err=NOT_LOGIN')
      })
      break;
    case 'add-to-queue':
      getXreer(sec).then(xreer => {
        console.log(1)
        socket.emit('addQueue', xreer, data)
        socket.on('request_ok_and_done', (track) => {
          clearListener()
          window.location.replace(`/?addtoqueue=true&duration=${encodeURIComponent(track.duration)}&title=${encodeURIComponent(track.name)}&url=${encodeURIComponent(track.url)}}`)
        })
        socket.on('request_error', (error) => {
          clearListener()
          window.location.replace('/?err=ERROR_WHILE_PLAYING_SONG&message=' + encodeURIComponent(error))
        })
      }).catch(e => {
        window.location.replace('/?err=NOT_LOGIN')
      })
      break;
  }
}