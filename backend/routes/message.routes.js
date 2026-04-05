const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const auth    = require('../middleware/auth.middleware');
const ctrl    = require('../controllers/message.controller');
const db      = require('../config/db');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/* GET /api/messages/conversations */
router.get('/conversations', auth, async (req, res) => {
  const uid = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT
         IF(m.id_expediteur = ?, m.id_destinataire, m.id_expediteur) AS other_id,
         u.nom AS other_nom,
         m.message AS last_message,
         m.date_envoi AS date,
         m.id_expediteur AS last_sender_id,
         /* ✅ Nombre total de messages reçus de l'autre (frontend soustrait ce qu'il a déjà vu) */
         (
           SELECT COUNT(*)
           FROM messages m3
           WHERE m3.id_expediteur = IF(m.id_expediteur = ?, m.id_destinataire, m.id_expediteur)
             AND m3.id_destinataire = ?
         ) AS total_from_other
       FROM messages m
       JOIN utilisateurs u
         ON u.id = IF(m.id_expediteur = ?, m.id_destinataire, m.id_expediteur)
       WHERE (m.id_expediteur = ? OR m.id_destinataire = ?)
         AND m.id = (
           SELECT MAX(m2.id)
           FROM messages m2
           WHERE (m2.id_expediteur = m.id_expediteur AND m2.id_destinataire = m.id_destinataire)
              OR (m2.id_expediteur = m.id_destinataire AND m2.id_destinataire = m.id_expediteur)
         )
       GROUP BY other_id
       ORDER BY m.date_envoi DESC`,
      [uid, uid, uid, uid, uid, uid]
    );
    res.json(rows);
  } catch (err) {
    console.error('Conversations error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
  res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

router.post('/', auth, ctrl.send);
router.get('/:id', auth, ctrl.getConversation);

module.exports = router;