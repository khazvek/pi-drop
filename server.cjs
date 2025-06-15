const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const multer = require('multer');
const cors = require('cors');

const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, 'dist');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Load messages from file
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

// Configure multer for file uploads with 25GB limit
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 * 1024 // 25GB limit
  }
});

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(DIST_DIR));

// API Routes
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    const files = req.files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      size: file.size,
      type: file.mimetype,
      uploadDate: new Date().toISOString(),
      filename: file.filename,
      path: `/api/download/${file.filename}`
    }));
    
    res.json({ success: true, files });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Get original filename (remove timestamp prefix)
  const originalName = filename.replace(/^\d+-/, '');
  
  res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
  res.sendFile(filePath);
});

app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR).map(filename => {
      const filePath = path.join(UPLOADS_DIR, filename);
      const stats = fs.statSync(filePath);
      const originalName = filename.replace(/^\d+-/, '');
      
      return {
        id: filename,
        name: originalName,
        size: stats.size,
        uploadDate: stats.mtime.toISOString(),
        filename: filename,
        path: `/api/download/${filename}`
      };
    });
    
    res.json(files);
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

const server = http.createServer(app);

// WebSocket server for real-time messaging
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  console.log('New WebSocket connection');
  
  // Send existing messages to new client
  ws.send(JSON.stringify({ type: 'init', messages }));

  ws.on('message', data => {
    let payload;
    try { 
      payload = JSON.parse(data); 
    } catch { 
      return; 
    }
    
    if (payload.type === 'message') {
      const message = {
        ...payload.message,
        timestamp: new Date().toISOString()
      };
      messages.unshift(message);
      
      // Keep only last 1000 messages
      if (messages.length > 1000) {
        messages = messages.slice(0, 1000);
      }
      
      saveMessages();
      
      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'message', message }));
        }
      });
    } else if (payload.type === 'clear') {
      messages = [];
      saveMessages();
      
      // Broadcast clear to all clients
      wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'clear' }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Kaury Pi Hub server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 File uploads directory: ${UPLOADS_DIR}`);
  console.log(`💬 WebSocket server ready for real-time messaging`);
  console.log(`🌐 Access from other devices using your local IP address`);
});