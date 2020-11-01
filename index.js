const express = require('express');

const compression = require('compression');

const expressStaticGzip = require("express-static-gzip");

const app = express();

app.use(compression());

app.use("/assets", expressStaticGzip(__dirname + "/web/assets", {
    enableBrotli: true,
    customCompressions: [{
        encodingName: 'deflate',
        fileExtension: 'zz'
    }],
    orderPreference: ['br']
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/web/pages/blank.html")
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + "/web/pages/index.html")
})

app.get('/gd', (req, res) => {
  res.sendFile(__dirname + "/web/pages/index-0.html")
})

app.get('/dl', (req, res) => {
  res.download(__dirname + "/v5.tar.gz")
  //res.redirect('/')
});

app.listen(3000, () => {
  console.log('server started');
});