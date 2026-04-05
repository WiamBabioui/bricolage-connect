const db = require('../config/db');

module.exports = (io) => {
  const connectedUsers = {};

  io.on('connection', (socket) => {

    socket.on('join', (userId) => {
      connectedUsers[String(userId)] = socket.id;
      console.log(`✅ User ${userId} connecté - socket ${socket.id}`);
    });

    socket.on('send_message', async (data) => {
      const { from, to, message } = data;
      try {
        // ✅ Sauvegarder en BDD
        await db.query(
          'INSERT INTO messages (id_expediteur, id_destinataire, message) VALUES (?, ?, ?)',
          [from, to, message]
        );
        console.log(`💬 Message sauvegardé: ${from} → ${to}: ${message}`);

        // ✅ Envoyer au destinataire s'il est connecté
        const socketId = connectedUsers[String(to)];
        if (socketId) {
          io.to(socketId).emit('receive_message', {
            from, message, date_envoi: new Date()
          });
        }
      } catch (err) {
        console.error('❌ Socket save error:', err);
      }
    });

    socket.on('typing', ({ from, to }) => {
      const socketId = connectedUsers[String(to)];
      if (socketId) io.to(socketId).emit('user_typing', from);
    });

    socket.on('disconnect', () => {
      Object.keys(connectedUsers).forEach(id => {
        if (connectedUsers[id] === socket.id) {
          delete connectedUsers[id];
          console.log(`❌ User ${id} déconnecté`);
        }
      });
    });
  });
};