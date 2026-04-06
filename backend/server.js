const process = require('process');
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const http       = require('http');
const path       = require('path');
const fs         = require('fs');
const { Server } = require('socket.io');

const authRoutes      = require('./routes/auth.routes');
const specialtyRoutes = require('./routes/specialty.routes');
const serviceRoutes   = require('./routes/service.routes');
const messageRoutes   = require('./routes/message.routes');
const userRoutes      = require('./routes/user.routes');
const initSocket      = require('./socket');

const app    = express();
const server = http.createServer(app);

// ✅ CONFIGURATION CORS DYNAMIQUE
// On accepte l'URL de ton futur site Vercel ET localhost pour tes tests
const allowedOrigins = [
  process.env.CLIENT_URL, // L'URL Vercel que tu ajouteras dans Railway
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// ✅ Version plus robuste pour éviter l'erreur "Not allowed by CORS"
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Autorise si : pas d'origin (mobile/tests), localhost, ou ton domaine vercel
      if (!origin || 
          origin.startsWith('http://localhost') || 
          origin.includes('vercel.app') || 
          origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        console.log("CORS bloqué pour l'origine :", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

initSocket(io);

app.use(helmet({ crossOriginResourcePolicy: false }));

// ✅ Appliquer la même logique au middleware CORS d'Express
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || 
        origin.startsWith('http://localhost') || 
        origin.includes('vercel.app') || 
        origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

initSocket(io);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(helmet({ crossOriginResourcePolicy: false }));

// ✅ CONFIGURATION CORS POUR EXPRESS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/specialites',  specialtyRoutes);
app.use('/api/services',     serviceRoutes);
app.use('/api/annonces',     serviceRoutes);
app.use('/api/messages',     messageRoutes);
app.use('/api/utilisateurs', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Bricolage Connect API is running',
    env: process.env.NODE_ENV 
  });
});

// ✅ PORT ET HOST POUR RAILWAY
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});