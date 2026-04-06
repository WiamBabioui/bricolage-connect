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

// ---------------------------------------------------------
// ✅ CONFIGURATION CORS UNIQUE ET ROBUSTE
// ---------------------------------------------------------
const corsOptions = {
  origin: function (origin, callback) {
    // Autorise : 
    // 1. Pas d'origine (ex: tests serveurs ou fichiers locaux)
    // 2. Localhost (ton PC)
    // 3. N'importe quelle URL contenant "vercel.app" (ton site en ligne)
    // 4. Ton URL CLIENT_URL configurée sur Railway
    if (!origin || 
        origin.startsWith('http://localhost') || 
        origin.startsWith('http://127.0.0.1') ||
        origin.includes('vercel.app') || 
        origin.includes('bricolage-connect') ||
        origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      console.log("CORS bloqué pour l'origine :", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Appliquer CORS à Express
app.use(cors(corsOptions));

// ✅ Appliquer CORS à Socket.io
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Initialiser les sockets
initSocket(io);

// ---------------------------------------------------------
// ✅ MIDDLEWARES CLASSIQUES
// ---------------------------------------------------------
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// ---------------------------------------------------------
// ✅ ROUTES API
// ---------------------------------------------------------
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
    env: process.env.NODE_ENV,
    db_host: process.env.DB_HOST ? 'Configured' : 'Missing'
  });
});

// ---------------------------------------------------------
// ✅ DÉMARRAGE DU SERVEUR
// ---------------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});