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
    // ✅ Requête corrigée pour MySQL 8 (Aiven) : Utilise une sous-requête au lieu d'un GROUP BY invalide
    const [rows] = await db.query(
      `SELECT 
          sub.other_id, 
          u.nom AS other_nom, 
          m.message AS last_message, 
          m.date_envoi AS date,
          m.id_expediteur AS last_sender_id,
          (
            SELECT COUNT(*)
            FROM messages m3
            WHERE m3.id_expediteur = sub.other_id
              AND m3.id_destinataire = ?
          ) AS total_from_other
       FROM (
          SELECT 
            IF(id_expediteur = ?, id_destinataire, id_expediteur) AS other_id,
            MAX(id) AS max_id
          FROM messages
          WHERE id_expediteur = ? OR id_destinataire = ?
          GROUP BY other_id
       ) AS sub
       JOIN messages m ON m.id = sub.max_id
       JOIN utilisateurs u ON u.id = sub.other_id
       ORDER BY m.date_envoi DESC`,
      [uid, uid, uid, uid] // 4 paramètres au lieu de 6
    );
    res.json(rows);
  } catch (err) {
    console.error('Conversations error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
  
  // ✅ Lien dynamique : utilise l'adresse du serveur actuel (local ou en ligne)
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? `https://${req.get('host')}` 
    : 'http://localhost:5000';
    
  res.json({ url: `${baseUrl}/uploads/${req.file.filename}` });
});

router.post('/', auth, ctrl.send);
router.get('/:id', auth, ctrl.getConversation);

module.exports = router;