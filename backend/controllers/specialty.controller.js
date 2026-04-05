const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM specialites ORDER BY nom ASC');
    res.json(rows);
  } catch (err) {
    console.error('Specialty error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
