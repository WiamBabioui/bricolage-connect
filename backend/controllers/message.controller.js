const db = require('../config/db');

/* ── Envoyer un message ── */
exports.send = async (req, res) => {
  const { id_destinataire, message } = req.body;
  const id_expediteur = req.user.id;
  try {
    const [result] = await db.query(
      'INSERT INTO messages (id_expediteur, id_destinataire, message) VALUES (?, ?, ?)',
      [id_expediteur, id_destinataire, message]
    );
    res.status(201).json({
      id: result.insertId,
      id_expediteur,
      id_destinataire,
      message,
      date_envoi: new Date()
    });
  } catch (err) {
    console.error('Send error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ── Historique conversation ── */
exports.getConversation = async (req, res) => {
  const { id } = req.params;
  const myId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT * FROM messages
       WHERE (id_expediteur = ? AND id_destinataire = ?)
          OR (id_expediteur = ? AND id_destinataire = ?)
       ORDER BY date_envoi ASC`,
      [myId, id, id, myId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GetConversation error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
