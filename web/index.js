const fs = require("fs");
const path = require("path");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const fetch = require("node-fetch");
const ytrend = require('@freetube/yt-trending-scraper')
const express = require("express");
const app = express();
const http = require("http")
const httpserver = http.Server(app);
const socketio = require("socket.io");
const io = socketio(httpserver);

const LocalTools = require("../libs/v5-core/src/LocalTools")

const { Permissions } = require('discord.js');
const { URLSearchParams } = require("url");
const { Database } = require("simple-json-database");

const userDB = new Database("user", __dirname + "/secret");
const userDT = new Database("userdt", __dirname + "/secret");

const tools = require("../libs/v5-core/src/LocalTools");

const crypto = require('crypto')
const fernet = require('fernet');
const rateLimit = require("express-rate-limit");
const userAgent = require("express-useragent");
const Track = require("../libs/v5-core/src/Track");

const avCache = new Map();
const gCache = new Map();
const qCache = new Map();
const socketCache = new Map();

var trendingCache = {}

var UAChecker = function (req, res, next) {
  var ua = userAgent.parse(req.headers['user-agent'])
  if (ua.isBot) {
    return res.status(401).send("Bots are not allowed here.")
  } else if (ua.isIE) {
    return res.status(401).send("Internet Explorer is not allowed here, Please update your browser to Edge/Chrome or other browsers (like firefox).")
  } else {
    next();
  }
};

module.exports = (bot) => {
  app.get('/music/:id', UAChecker, (req, res) => {
    var musicPath = path.resolve(__dirname, '..', 'music/resources', req.params.id)
    if (!fs.existsSync(musicPath)) {
      return res.status(404).send("找無該歌曲, 說不定已經被刪除了?")
    } else {
      return res.status(200).download(musicPath)
    }
  })

  app.get('ping', (req, res) => {
    res.status(200).send('ok')
  })

  httpserver.listen(bot.config.web.port || process.env.PORT || 3000, '0.0.0.0');

  app.use(express.json(), express.static(__dirname + "/public"), express.static(__dirname + "/json"), express.static(__dirname + "/js"));

  app.use(cookieParser());

  const corsOptions = {
    origin: bot.config.web.url,
    credentials: true,            //access-control-allow-credentials :true
    optionSuccessStatus: 200
  }

  app.use(cors(corsOptions))

  io.sockets.on('connection', function (socket) { // 建立連線時

    // root
    socket.on('disconnect', function () { // 使用者斷線時
      if (socketCache.has(socket.id)) {
        var soc = socketCache.get(socket.id)
        try {
          bot.player.removeListener('start', soc.start)
          bot.player.removeListener('end', soc.end)
          bot.player.removeListener('addTrack', soc.addTrack)
        } catch (e) {

        }
        /*if (soc.queue) {
          soc.queue.removeListener('addTrack', soc.addTrack)
          soc.queue.removeListener('trackChanged', soc.trackChanged)
          soc.queue.removeListener('end', soc.end)
        }*/
        socketCache.delete(socket.id)
      }
    });
    socket.on('init_register_event', (userId) => { // 使用者發出事件監聽請求時
      var queue = getQueue(userId)
      if (!queue) {
        function process(queue) {
          if (bot.channels.cache.get(queue.voiceConnection.joinConfig.channelId).members.has(userId)) {
            var playing = queue.playing.getAllInfo()
            playing.queue = null
            socket.emit('startPlaying', playing)
            socket.emit('init_register_event', userId)
            bot.player.removeListener('start', process) // 不要再處理這個事件
          }
        }

        bot.player.on('start', process)

        var soc = socketCache.get(socket.id) || {}
        soc.start = process
        socketCache.set(socket.id, soc)

        return;
      }
      if (qCache.has(userId)) {
        return
      } else {

        function addTrack(queue, track, user) {
          if (bot.channels.cache.get(queue.voiceConnection.joinConfig.channelId).members.has(userId)) {
            if (track.tracks) track.tracks.map(a => a.getAllInfoForList())
            else track = track.getAllInfoForList()
            socket.emit('track_add', track, user)
          }
        }
        
        bot.player.on('addTrack', addTrack)

        function trackChanged(_, track) {
          socket.emit('new_track_for_user', track)
        }
        queue.on('trackChanged', trackChanged)

        function end(queue) {
          if (bot.channels.cache.get(queue.voiceConnection.joinConfig.channelId).members.has(userId)) {
            socket.emit('queue_end')
          }
        }
        bot.player.on('end', end)

        qCache.set(userId, queue)

        var soc = socketCache.get(socket.id) || {}

        soc.addTrack = addTrack
        soc.trackChanged = trackChanged
        soc.end = end
        soc.queue = queue

        socketCache.set(socket.id, soc)
      }
    })
    socket.on('request_user_data', (userId) => { // 使用者發出發出隊列資料請求時
      var queue = getQueue(userId)
      if (!queue) {
        socket.emit('user_data', {
          userId: userId,
          data: {
            status: 0
          }
        })
      } else {
        const currentStreamTime = queue.resource
          ? queue.resource.playbackDuration + queue.additionalStreamTime
          : 0
        const totalTime = queue.playing.durationMS
        var playing = queue.playing.getAllInfo()
        playing.queue = null
        socket.emit('user_data', {
          userId: userId,
          data: {
            status: 1,
            guild: queue.guildID,
            paused: queue.paused,
            playing: playing,
            duration: currentStreamTime,
            current: Math.round((currentStreamTime / totalTime) * 100),
            currentFormated: tools.ms2mmss(currentStreamTime),
            requesterAvatar: getAvatar(queue)
          }
        })
      }
    })

    socket.once('get_bot_data', (userId) => { // 使用者發出發出隊列資料請求時
      socket.emit('bot_data', { avatar: bot.user.displayAvatarURL({ format: 'png', size: 4096 }), name: bot.user.username })
    })

    socket.on('volumeChanged', (userId, volume) => {
      var queue = getQueue(userId)
      if (!queue) return; 
      queue.guild = getGuild(userId)
      bot.player.nowPlaying(queue.guildID).then(async np => {
        if (!await isDJPerm(np, queue, userId)) {
          return socket.emit('volume_change_response', { error: new Error('服主已經開啟 DJ 限定模式!') })
        }

        bot.player.setVolume(queue.guildID, volume).then(() => {
          socket.emit('volume_change_response', { success: true })
        }).catch((e) => {
          socket.emit('volume_change_response', { error: e })
        })
      })
    })

    socket.on('seekTime', (userId, percent) => {
      var queue = getQueue(userId)
      if (!queue) return; 
      queue.guild = getGuild(userId)
      bot.player.nowPlaying(queue.guildID).then(async np => {
        if (!await isDJPerm(np, queue, userId)) {
          return socket.emit('seek_time_response', { error: '您沒有權限!' })
        }

        var seekTime = LocalTools.ms2mmss(Math.round(LocalTools.hmmss2ms(np.duration) * (percent / 100)))

        bot.player.seek(queue.guildID, seekTime).then(() => {
          return socket.emit('seek_time_response', { success: true, time: seekTime })
        }).catch((e) => {    
          return socket.emit('seek_time_response', { error: e })
        })
      })
    })

    socket.on('repeat', (userId) => {
      var queue = getQueue(userId)
      if (!queue) return;
      queue.guild = getGuild(userId)
      bot.player.nowPlaying(queue.guildID).then(async np => {
        if (!await isDJPerm(np, queue, userId)) {
          return socket.emit('action_response', { error: '您沒有權限!' })
        }

        bot.player.setRepeatMode(queue.guildID, !queue.repeatMode).then(() => {
          return socket.emit('action_response', { success: true, repeatMode: queue.repeatMode })
        }).catch((e) => {     
          return socket.emit('action_response', { error: e })
        })
      })
    })


    socket.on('pause', (userId) => {
      var queue = getQueue(userId)
      if (!queue) return;
      queue.guild = getGuild(userId)
      bot.player.nowPlaying(queue.guildID).then(async np => {
        if (!await isDJPerm(np, queue, userId)) {
          return socket.emit('action_response', { error: '您沒有權限!' })
        }

        bot.player.pause(queue.guildID).then(() => {
          return socket.emit('action_response', { success: true })
        }).catch((e) => {     
          return socket.emit('action_response', { error: e.message })
        })
      })
    })

    socket.on('resume', (userId) => {
      var queue = getQueue(userId)
      if (!queue) return;
      queue.guild = getGuild(userId)
      bot.player.nowPlaying(queue.guildID).then(async np => {
        if (!await isDJPerm(np, queue, userId)) {
          return socket.emit('action_response', { error: '您沒有權限!' })
        }

        bot.player.resume(queue.guildID).then(() => {
          return socket.emit('action_response', { success: true })
        }).catch((e) => { 
          return socket.emit('action_response', { error: e.message })
        })
      })
    })

    socket.on('skip', (userId) => {
      var queue = getQueue(userId)
      if (!queue) return;
      queue.guild = getGuild(userId)
      bot.player.nowPlaying(queue.guildID).then(async np => {
        if (!await isDJPerm(np, queue, userId)) {
          return socket.emit('action_response', { error: '您沒有權限!' })
        }
        bot.player.skip(queue.guildID).then(() => {
          return socket.emit('action_response', { success: true })
        }).catch((e) => {
          return socket.emit('action_response', { error: e.message })
        })
      })
    })

    socket.on('previous', (userId) => {
      var queue = getQueue(userId)
      if (!queue) return;
      queue.guild = getGuild(userId)
      bot.player.nowPlaying(queue.guildID).then(async np => {
        if (!await isDJPerm(np, queue, userId)) {
          return socket.emit('action_response', { error: '您沒有權限!' })
        }

        bot.player.previous(queue.guildID).then(() => {
          return socket.emit('action_response', { success: true })
        }).catch((e) => {      
          return socket.emit('action_response', { error: e.message })
        })
      })
    })

    socket.on('shuffle', (userId) => {
      var queue = getQueue(userId)
      if (!queue) return;
      queue.guild = getGuild(userId)
      bot.player.nowPlaying(queue.guildID).then(async np => {
        if (!await isDJPerm(np, queue, userId)) {
          return socket.emit('action_response', { error: '您沒有權限!' })
        }

        bot.player.shuffle(queue.guildID).then(() => {
          return socket.emit('action_response', { success: true })
        }).catch((e) => {
          return socket.emit('action_response', { error: e.message })
        })
      })
    })

    // internal api
    socket.on('get_tracks', (userId) => {
      var queue = getQueue(userId)
      if (!queue) return;
      var track = queue.tracks.map(t => t.getAllInfoForList())
      socket.emit('get_tracks_response', { success: true, tracks: track })
    })

    // search
    socket.on('play', async (userData, trackData) => {
      try {
      	var queue = getQueue(userData.userId)
      	if (queue) return socket.emit('request_error', '您所在的伺服器已經有人在使用機器人了!')
      } catch (e) {}

      var voiceChannel = getVoiceChannelOfAUser(userData.id)
      if (!voiceChannel) return socket.emit('request_error', '您尚未加入任何一個語音頻道!')

      var isPlaying = await bot.player.isPlaying(voiceChannel.guild.id)
      if (isPlaying) return socket.emit('request_error', '您所在的伺服器已經有人在使用機器人了!')
      
      var track = Track.listInfoToTrack(trackData)
      const gconf = await bot.db.get(voiceChannel.guild.id) || bot.config.defaultconfig

      if (gconf.djonly.enable && !await isDJPerm({}, voiceChannel, userData.id)) {
        return socket.emit('request_error', '服主已經開啟 DJ 限定模式!')
      }

      if (gconf.blacklist.enable && gconf.blacklist.channels.includes(voiceChannel) && !await isDJPerm({}, voiceChannel, userData.id)) {
        return socket.emit('request_error', '您所在的伺服器沒有設定DJ角色!')
      }
      // track.requestedBy = userData.username + "#" + userData.discriminator
      bot.player.play(voiceChannel, track, userData.username + "#" + userData.discriminator).then(() => {
        socket.emit('request_ok_and_done', trackData)
      }).catch((e) => {
        socket.emit('request_error', e)
      })
    })

    socket.on('addQueue', async (userData, trackData) => {
      var queue = getQueue(userData.id)
      if (!getGuild(userData.id)) return socket.emit('request_error', '請加入任意一個語音頻道!')
      if (!getGuild(userData.id).me.voice.channel.members.has(userData.id)) return socket.emit('request_error', '請加入與機器人相同的語音頻道!')
      var track = Track.listInfoToTrack(trackData)
      queue.guild = getGuild(userData.id)
      const gconf = await bot.db.get(queue.guildID) || bot.config.defaultconfig

      if (gconf.djonly.enable && !await isDJPerm({}, queue, userData.id)) {
        return socket.emit('request_error', '服主已經開啟 DJ 限定模式!')
      }

      if (queue.tracks.length > gconf.maxqueue.value && gconf.maxqueue.enable && await isDJPerm({}, queue, userData.id)) {
        return socket.emit('request_error', '本群組的歌單已經達到最高上限了!\nDJ 可無視該上限!')
      }

      bot.player.addToQueue(queue.guildID, track, userData.username + "#" + userData.discriminator).then(() => {
        socket.emit('request_ok_and_done', trackData)
      }).catch((e) => {
        socket.emit('request_error', e)
      })
    })
  });

  app.get("/", UAChecker, async (req, res) => {
    res.status(200).sendFile(path.join(__dirname + "/HTML/music.html"));
  });

  app.post("/oauth2", UAChecker, async (req, res) => {
    var xd = userDT.get(req['body']['key']);
    if (!xd) return res.status(404).send({ error: "..." });
    if ((Date.now() - xd['expires_in']) < 0) {
      userDT.remove(req['body']['key'], "major");
      userDB.remove(req['body']['key'], "major");
      return res.status(404).send({ error: "Token expire" });
    }
    res.send(xd);
  });

  app.get("/search", UAChecker, async (req, res) => {
    res.status(200).sendFile(path.join(__dirname + "/HTML/search.html"))
  });

  app.get("/socket", UAChecker, async (req, res) => {
    res.status(200).sendFile(path.join(__dirname + "/HTML/socket.html"));
  });

  app.get("/test", UAChecker, async (req, res) => {
    res.status(200).sendFile(path.join(__dirname + "/HTML/try.html"))
  });

  /*app.get("/m", async (req, res) => {
    res.status(200).sendFile(path.join(__dirname + "/phone/main.html"))
  });*/

  app.get("/logout", UAChecker, async (req, res) => {
    res.cookie("sec", { maxAge: 0 })
    await userDT.remove(req['body']['key'], "major");
    await userDB.remove(req['body']['key'], "major");
    res.status(200).sendFile(path.join(__dirname + "/HTML/logout.html"))
  });

  app.get("/login", UAChecker, async (req, res) => {
    if (req.query.code && !req.query.sec) {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };
      var params = new URLSearchParams();
      params.append('client_id', bot.user.id);
      params.append('client_secret', bot.config.web.clientSecret);
      params.append('grant_type', 'authorization_code');
      params.append('code', req.query.code);
      params.append('redirect_uri', bot.config.web.url + '/login');
      var xd = await fetch(`https://discord.com/api/v8/oauth2/token`, { headers, body: params, method: "POST" });
      var json = await xd.json();
      var sec = randsecretcode(8);
      userDB.set(sec, {
        "access_token": json['access_token'],
        "expires_in": Date.now() + 1209600,
        "refresh_token": json['refresh_token'],
        "scope": json['scope'],
        "token_type": json['token_type']
      });
      res.cookie("sec", sec)
      var data = await fetch(`https://discord.com/api/users/@me`, {
        headers: {
          Authorization: `${json['token_type']} ${json['access_token']}`
        }
      }).then(res => res.json());
      userDT.set(sec, data);
      res.status(200).redirect(`${bot.config.web.url}/login?sec=${sec}`);
    } else if (!req.query.code && req.query.sec) {
      res.status(200).sendFile(path.join(__dirname + "/HTML/login.html"));
    } else if (!req.query.sec && !req.query.code) {
      res.redirect(`/?err=LOGIN_FAILED`);
    };
  });

  app.get('/auth', UAChecker, (req, res) => {
    res.status(301).redirect('https://discord.com/api/oauth2/authorize?client_id=' + bot.user.id + '&redirect_uri=' + encodeURIComponent(bot.config.web.url + "/login") + '&response_type=code&scope=identify%20guilds%20guilds.join%20email')
  })

  app.post('/api/search', UAChecker, rateLimit({ max: 20, skipFailedRequests: false, windowMs: 2 * 60 * 1000 }), async (req, res) => {
    if (!req.body.query) return res.status(400).send({ error: "..." });
    if (!req.body.type) return res.status(400).send({ error: "..." });
    if (!req.body.sec) return res.status(401).send({ error: "..." });
    var userData = userDB.get(req.body.sec)
    if (!userData) return res.status(401).send({ error: "..." });

    var key = crypto.randomBytes(32).toString('base64')
    var secret = new fernet.Secret(key)

    var token = new fernet.Token({
      secret: secret,
      time: Date.parse(1),
      iv: [...crypto.randomBytes(16)]
    })

    var q = req.body.query

    switch (req.body.type.toLowerCase()) {
      case "youtube":
        break;
      case "soundcloud":
        if (bot.player.resolveQueryType(q) === 'youtube-video-keywords') q = 'soundcloud:' + q
        break;
      case "spotify":
        break;
      case "bilibili":
        if (bot.player.resolveQueryType(q) === 'youtube-video-keywords') q = 'bilibili-video:' + q
        break;
      case "bilibili-anime":
        if (bot.player.resolveQueryType(q) === 'youtube-video-keywords') q = 'bilibili-anime:' + q
        break;
      case "netease music":
        if (bot.player.resolveQueryType(q) === 'youtube-video-keywords') q = 'netease:' + q
        break;
      case "tiktok music":
        break;
      case "lbry":
        if (bot.player.resolveQueryType(q) === 'youtube-video-keywords') q = 'lbry:' + q
        break;
      default:
        return;
    }

    bot.player.searchTracks(q, true, true).then(track => {
      if (!track.length) {
        res.status(500).send({
          error: "搜尋失敗"
        })
      } else {
        track.map(track => {
          var t = track.getAllInfoForList()
          t.requestedBy = userData.username + "#" + userData.discriminator
          t.queue = null
          return t
        })

        var result = JSON.stringify({ data: track })
        var encoded = token.encode(result)
        res.status(200).send({
          result: encoded,
          key: key
        })
      }
    })
  })

  // send http head request to req.body.url
  // if success, return 200, error false
  // if fail, return 500 error true
  app.post('/api/head', UAChecker, rateLimit({ max: 20 * 15, skipFailedRequests: true, windowMs: 2 * 60 * 1000 }), async (req, res) => {
    if (!req.body.url) return res.status(400).send({ error: "..." });
    //if (!req.body.sec) return res.status(401).send({ error: "..." });
    //var userData = userDB.get(sec)
    //if (!userData) return res.status(401).send({ error: "..." });
    try {
      var url = req.body.url

      var headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
      }

      var http = await fetch(url, {
        //'method': 'HEAD',
        //'mode': 'no-cors',
        headers
      })
        .then(res => res.text())
        .catch(e => {
          throw e
        });
      if (http.length < 4096) throw new Error('Unexpected size error') // if thumbnail's size lower than 4KB, throw error
      res.status(200).send({
        error: false
      })
    } catch (e) {
      res.status(200).send({
        error: true
      })
    }
  })

  app.get('/api/trending', UAChecker, rateLimit({ max: 5, skipFailedRequests: true, windowMs: 60 * 1000 }), async (req, res) => {

    if (trendingCache.data) {
      res.status(200).send(trendingCache.data)
    } else {
      const parameters = {
        geoLocation: 'TW',
        parseCreatorOnRise: false,
        page: 'music'
      }

      const data = trendingCache.data = await ytrend.scrape_trending_page(parameters)

      res.status(200).send(data)
    }
  })

  // generate a random secret code
  function randsecretcode(length) {
    var data = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      //result += characters.charAt(Math.floor(Math.random() * charactersLength));
      data.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return data.join("");
  }

  function getAvatar(queue) {
    if (!avCache.get(queue.playing.requestedBy)) {
      var avatar = bot.users.cache.find(u => u.username === queue.playing.requestedBy.split('#')[0] && u.discriminator === queue.playing.requestedBy.split('#')[1]).displayAvatarURL({ format: "png", size: 1024 })
      avCache.set(queue.playing.requestedBy, avatar)
      return avatar
    } else {
      return avCache.get(queue.playing.requestedBy)
    }
  }

  // find every guild that user in, and search if user is in any voice channel
  function getVoiceChannelOfAUser(userId) {
    var guilds = bot.guilds.cache.filter(g => !!g.members.cache.find(m => m.id === userId))
    var channels = []
    guilds.forEach(g => {
      var channel = g.channels.cache.find(c => ["GUILD_VOICE", "GUILD_STAGE_VOICE"].includes(c.type) && c.members.has(userId))
      if (channel) channels.push(channel)
    })

    return channels[0]
  }

  function getGuild(userId) {
    var queue = getQueue(userId)
    if (!queue) return null
    return bot.guilds.cache.get(queue.guildID)
  }

  function getQueue(userId) {
    return bot.player.queues.find(queue => bot.channels.cache.get(queue.voiceConnection.joinConfig.channelId).members.has(userId))
  }

  async function isDJPerm(np, vc, userId) {
    let gdb = await bot.db.get(vc.guild.id)
    if (!gdb) {
      await bot.db.set(vc.guild.id, bot.config.defaultconfig)
      gdb = bot.config.defaultconfig
    }

    return vc.guild.members.cache.get(userId).permissions.has(Permissions.FLAGS.MANAGE_ROLES) ||
      vc.guild.me.voice.channel.members.map(m => m.user.tag).length <= 2 ||
      np.requestedBy === msg.author.tag ||
      gdb.dj.people.includes(userId) ||
      gdb.dj.list.some(r => msg.member.roles.map(r_ => r_.id).includes(r))
  }
}
