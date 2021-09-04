var resumebutton = `<a class="btn action" id="resume" href="#" data-action="resume" onclick="action_click(this)"><i class="fa-solid fa-circle-play icon-fordown mx-2" ></i></a>`;
var pausebutton = `<a class="btn action" id="pause" href="#" data-action="pause" onclick="action_click(this)"><i class="fa-solid fa-circle-pause icon-fordown mx-2" ></i></a>`;
var resumeicon = `<i class="fa-solid fa-circle-play icon-fordown mx-2" ></i>`
var pauseicon = `<i class="fa-solid fa-circle-pause icon-fordown mx-2" ></i>`

function setCookie(cname, cvalue) {
  document.cookie = cname + "=" + cvalue;
};

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var playing = false;
var fetch_try = 0;

var socket = io();

let _xreer;
let action_lock = false;
let _notifyed = false;

function volumeChange(that) {
  socket.emit('volumeChanged', _xreer.id, $(that).val())
  $(that).attr('disabled', 'disabled')
  $('#seek').attr('disabled', 'disabled')
  socket.once('volume_change_response', function res(data) {
    if (data.success) {
      $(that).removeAttr('disabled');
      $("#seek").removeAttr('disabled');
      socket.removeListener('volume_change_response', res);
    } else {
      notify('error', '發生錯誤', data.error.message)
      $(that).removeAttr('disabled');
      $("#seek").removeAttr('disabled');
      socket.removeListener('volume_change_response', res);
    }
  })
}


function seekTime(that) {
  socket.emit('seekTime', _xreer.id, $(that).val())
  var timer = setInterval(() => {
    $(that).removeAttr('disabled');
    $("#seek").removeAttr('disabled');
  }, 5000) // avoid socket.emit('seekTime') throw error from server
  $(that).attr('disabled', 'disabled')
  $('#seek').attr('disabled', 'disabled')
  socket.once('seek_time_response', function res(data) {
    if (data.success) {
      notify('success', '成功調整', '目前已跳至 ' + filterXSS(data.time))
      $(that).removeAttr('disabled');
      $("#seek").removeAttr('disabled');
      socket.removeListener('seek_time_response', res);
    } else {
      notify('error', '發生錯誤', filterXSS(data.error))
      $(that).removeAttr('disabled');
      $("#seek").removeAttr('disabled');
      socket.removeListener('seek_time_response', res);
    }

    clearInterval(timer);
  })
}

function interval(xreer) {
  setInterval(() => {
    socket.emit('request_user_data', xreer.id)
  }, 950)
}

function action_click(self) {
  if (action_lock) return;
  else action_lock = true
  const action = $(self).attr('data-action')
  if (action === 'repeat') {
    socket.emit('repeat', _xreer.id)
  } else if (action === 'previous') {
    socket.emit('previous', _xreer.id)
  } else if (action === 'pause' || action === 'resume') {
    switch (action) {
      case 'pause':
        socket.emit('pause', _xreer.id)
        $(self).attr('id', 'resume')
        $(self).attr('data-action', 'resume')
        $(self).html(resumeicon)
        break;
      case 'resume':
        socket.emit('resume', _xreer.id)
        $(self).attr('id', 'pause')
        $(self).attr('data-action', 'pause')
        $(self).html(pauseicon)
        break;
    }
  } else if (action === 'skip') {
    socket.emit('skip', _xreer.id)
  } else if (action === 'shuffle') {
    socket.emit('shuffle', _xreer.id)
  }

  socket.once('action_response', (data) => {
    action_lock = false
    if (data.success) {
      return notify("success", "操作成功", "操作成功!", { delay: 3000 });
    } else {
      return notify("error", "操作失敗", "操作失敗!", { delay: 3000 });
    }
  })
}

$(document).ready(function () {
  socket.emit('get_bot_data')
  socket.on('bot_data', (data) => {
    $('#avatar').attr('src', data.avatar)
    $('#botname').html(filterXSS(data.name + " Music Control"))
  })
  var secwe = getCookie('sec')
  if (!secwe) return;

  socket.on('user_data', function (userData) {
    if (userData.data.status) {
      if (playing) {
        $('.current-time').text(filterXSS(userData.data.currentFormated))
        $('#seek').val(userData.data.current)
        $("#thumbnail").attr('src', filterXSS(userData.data.playing.thumbnail))
        $('.title.mx-2').html(`${filterXSS(userData.data.playing.name)}
        <br><br>
        <img src="${filterXSS(userData.data.requesterAvatar)}" id="userAvatar" width="27px" class="mx-2 rounded-circle"/>
        ${filterXSS(userData.data.playing.requestedBy)}`)
        if (userData.data.current > 95 && !_notifyed) {
          socket.emit('get_tracks', _xreer.id)
          socket.once('get_tracks_response', (tracks) => {
            if (tracks.tracks[0]) notify('info', '提示', '即將播放下一首歌曲 <br>' + filterXSS(tracks.tracks[0].name), { delay: 7000, style: 'top-right' })
          })
          _notifyed = true
        }

        if (userData.data.current < 95 && _notifyed) {
          _notifyed = false
        }
      } else {
        playing = true
        //if (fetch_try <= 3) playing = true
        //fetch_try++
        $('.player').html(`<div class="navbar navbar-expand-sm fixed-bottom back-color">
            <div class="col-4  d-none d-xl-inline">
              <div class="s_container">
                <img src="${filterXSS(userData.data.playing.thumbnail)}" id="thumbnail" width="150px" class="mx-2"/>
                <p class="title mx-2">
                  ${filterXSS(userData.data.playing.name)}
                  <br><br>
                  <img src="${filterXSS(userData.data.requesterAvatar)}" id="userAvatar" width="27px" class="mx-2 rounded-circle"/>
                  ${filterXSS(userData.data.playing.requestedBy)}
                </p>
              </div>
            </div>
            <div class="col-lg-1 col-sm-1 col-md-1 d-xl-none"></div>
            <div class="col-xl-5 col-lg-10 col-sm-10 col-md-10 mx-2">
              <center>
              <div class="buttonplace my-3">
                <center>
                  <a class="btn action" href="#" data-action="repeat" onclick="action_click(this)"><i class="fa-solid fa-repeat icon-fordown mx-2"></i></a>
                  <a class="btn action" href="#" data-action="previous" onclick="action_click(this)"><i class="fa-solid fa-backward-step icon-fordown mx-2"></i></a>
                  ${userData.data.paused ? resumebutton : pausebutton}
                  <a class="btn action" href="#" data-action="skip" onclick="action_click(this)"><i class="fa-solid fa-forward-step icon-fordown mx-2"></i></a>
                  <a class="btn action" href="#" data-action="shuffle" onclick="action_click(this)"><i class="fa-solid fa-shuffle icon-fordown mx-2"></i></a>
                </center>
              </div>
              <br class="d-none d-xl">
              <div class="slider_container">
                <div class="current-time mx-2">${filterXSS(userData.data.currentFormated)}</div>
                <input type="range" id="seek" min="0" max="100" value="${userData.data.current}" class="slider mx-3" onchange="seekTime(this)">
                <div class="total-duration mx-2">${filterXSS(userData.data.playing.duration)}</div>
              </div>      
              <br>
              </center>
            </div>
            <div class="col-3 d-none d-xl-inline">
              <div class="slider_container">
                <i class="fa-solid fa-volume"></i>
                <input type="range" id="volume" min="0" max="200" value="100" class="slider-small ms-4" onchange="volumeChange(this)">
              </div>
            </div>
          </div>`).fadeIn('slow');
      }
    } else {
      playing = false
      $('.player').fadeOut('slow')
    }
  })

  getXreer(secwe).then(function (xreer) {
    _xreer = xreer
    socket.emit('init_register_event', xreer.id)
    socket.on('track_add', (track, user) => {
      if (user === (xreer.username + "#" + xreer.discriminator)) return
      if (track.type) {
        return notify("info", "添加歌曲", `用戶 ${filterXSS(user)} 添加了 ${filterXSS(track.tracks.length)} 首歌曲至隊列裡!`, { delay: 7000 });
      } else {
        return notify("info", "添加歌曲", `用戶 ${filterXSS(user)} 添加了 ${filterXSS(track.name)} 至隊列裡!`, { delay: 7000 });
      }
    })

    socket.on('queue_end', () => {
      return notify("info", "隊列結束", "隊列已經結束, 感謝您的使用!", { delay: 7000 });
    })

    socket.on('new_track_for_user', (track) => {
      return notify("info", "目前播放", `目前播放 ${filterXSS(track.requestedBy)} 添加的歌曲: <b><a href="${filterXSS(track.url)}"> - ${filterXSS(track.name)}</a></b><br><br>時長: ${filterXSS(track.duration)}`, { delay: 7000 });
    })

    socket.emit('request_user_data', xreer.id) // Performance improve: when player start, request user data
    interval(xreer)
  })
})