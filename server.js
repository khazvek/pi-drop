const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, 'dist');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

let messages = [];
try {
  const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
  messages = JSON.parse(data);
} catch (err) {
  messages = [];
}

function saveMessages() {
  fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), err => {
    if (err) console.error('Error saving messages', err);
  });
}

const server = http.createServer((req, res) => {
  let reqUrl = req.url || '/';
  if (reqUrl === '/') reqUrl = '/index.html';
  const filePath = path.join(DIST_DIR, reqUrl);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).slice(1);
    const mime = {
      html: 'text/html',
      js: 'text/javascript',
      css: 'text/css',
      png: 'image/png',
      jpg: 'image/jpeg',
      svg: 'image/svg+xml'
    }[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'init', messages }));

  ws.on('message', data => {
    let payload;
    try { payload = JSON.parse(data); } catch { return; }
    if (payload.type === 'message') {
      const message = payload.message;
      messages.unshift(message);
      if (messages.length > 1000) messages.pop();
      saveMessages();
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'message', message }));
        }
      });
    } else if (payload.type === 'clear') {
      messages = [];
      saveMessages();
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'clear' }));
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
