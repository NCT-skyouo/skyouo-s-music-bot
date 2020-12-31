const
http = require("http"), 
fs = require("fs"),
express = require('express'), 
compression = require('compression'), 
expressStaticGzip = require("express-static-gzip"), 
app = express(), 
pidusage = require('pidusage'), 
os = require("os"),
historyArray = require("./libs/historyArray/index.js"),
DB = require("./db.js"),
config = require("./config/config.json");

app.use(compression());

app.use("/assets", expressStaticGzip(__dirname + "/dist/assets", {
    enableBrotli: true,
    customCompressions: [{
        encodingName: 'deflate',
        fileExtension: 'zz'
    }],
    orderPreference: ['br']
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/dist/index.html")
});

app.get('/backup', (req, res) => {
  res.sendFile(__dirname + "/dist/table.html")
});

app.get('/about', (req, res) => {
  res.sendFile(__dirname + "/dist/blank.html")
});

/*app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + "/web/pages/index.html")
})

app.get('/gd', (req, res) => {
  res.sendFile(__dirname + "/web/pages/index-0.html")
})*/

app.get('/dl', (req, res) => {
  res.download(__dirname + "/v5.tar.gz")
  //res.redirect('/')
});

app.get('/music/:id', (req, res) => {
  if (!fs.existsSync(__dirname + "/music/resources/" + req.params.id)) {
    return res.status(404).send("找無該歌曲, 說不定已經被刪除了?")
  } else {
    return res.status(200).download(__dirname + "/music/resources/" + req.params.id)
  }
})

app.get('ping', (req, res) => {
  res.status(200).send('ok')
})

const server = http.createServer(app);

const io = require('socket.io')(server);

server.listen(config.web.port)

setInterval(() => {
  http.get("http://Discord-botowo.nctskyouo.repl.co")
}, 15000)

var botinfo = require("./tmp.json")

botinfo.v5 = global.v5

io.on('connection', function(client) {
  client.emit("init", botinfo)

  var history = {
    labels: new historyArray(10),
    datas: {
      cpu: new historyArray(10),
      mem: new historyArray(10)
    }
  }
  console.log('A connection was established');
  // <script src="/socket.io/socket.io.js"></script>
  client.on("usage_req", async () => {
    var nowDate = new Date()
    var nowGMT8Date = new Date(`${nowDate.toDateString()} ${nowDate.toTimeString().split(" ")[0]} GMT+0000`)
    var res = {}
    var usage = await pidusage(process.pid)
    res.cpuPercent = usage.cpu.toFixed(1)
    res.memoryPercent = Number((usage.memory / os.totalmem()) * 100).toFixed(1)
    history.datas.cpu.push(res.cpuPercent)
    history.datas.mem.push(res.memoryPercent)
    history.labels.push(nowGMT8Date.toTimeString().split(" ")[0])
    var shadow = history
    res.datas = { 
      cpuHistory: shadow.datas.cpu.toArray(),
      memHistory: shadow.datas.mem.toArray(),
      labelsHistory: shadow.labels.toArray()
    }
    res.bot = {}
    res.bot.memberCount = global._.bot.users.cache.array().length
    res.bot.guildCount = global._.bot.guilds.cache.array().length
    res.db = {}
    var dball = await global._.bot.db.all()
    var sdball = await global._.bot.sdb.all()
    res.db.dbl = Object.keys(dball).length
    res.db.sdbl = Object.keys(sdball).length
    client.emit("usage_rep", res)
  })
});