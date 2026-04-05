const process = require('process');
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const http       = require('http');
const path       = require('path');
const fs         = require('fs');
const { Server } = require('socket.io'); // ← import Socket.io Server

const authRoutes      = require('./routes/auth.routes');
const specialtyRoutes = require('./routes/specialty.routes');
const serviceRoutes   = require('./routes/service.routes');
const messageRoutes   = require('./routes/message.routes');
const userRoutes      = require('./routes/user.routes');
const initSocket      = require('./socket');

const app    = express();
const server = http.createServer(app);

/* ✅ Créer l'instance Socket.io CORRECTEMENT */
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

/* ✅ Passer io (et non server) à initSocket */
initSocket(io);

// Créer le dossier uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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
  res.json({ status: 'ok', message: 'Bricolage Connect API is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});