const express = require('express');
const https = require('https');
const fs = require('fs');

const { getServerHtmlByRoute } = require('./ssr');

const PORT = process.env.PORT || 3003;
const SSL_KEY = process.env.SSL_KEY || "cert/key.pem";
const SSL_CERT = process.env.SSL_CERT || "cert/cert.pem"

const app = express();
app.use('/static', express.static('dist/web'))
app.get('/*', async (req, res) => {
  try {
    const content = await getServerHtmlByRoute(req.path || '/');
    res.send(content);
  } catch (e) {
    console.error(e);
  }
});

https.createServer({
  key: fs.readFileSync(SSL_KEY),
  cert: fs.readFileSync(SSL_CERT),
}, app)
.listen(PORT);

console.log('Running on https://localhost:3003/');
