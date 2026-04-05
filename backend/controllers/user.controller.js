const db      = require('../config/db');
const bcrypt  = require('bcryptjs');

exports.getMe = async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id, nom, email, role, telephone, ville, description, photo FROM utilisateurs WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.updateMe = async (req, res) => {
  const { nom, telephone, ville, description } = req.body;
  try {
    await db.query(
      'UPDATE utilisateurs SET nom = ?, telephone = ?, ville = ?, description = ? WHERE id = ?',
      [nom, telephone || null, ville || null, description || null, req.user.id]
    );
    res.json({ message: 'Profil mis à jour' });
  } catch (err) { res.status(500).json({ error: 'Erreur serveur' }); }
};

/* ✅ Nouveau — changer le mot de passe */
exports.changePassword = async (req, res) => {
  const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
  if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs.' });
  }
  if (nouveau_mot_de_passe.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères.' });
  }
  try {
    const [[user]] = await db.query('SELECT mot_de_passe FROM utilisateurs WHERE id = ?', [req.user.id]);
    const ok = await bcrypt.compare(ancien_mot_de_passe, user.mot_de_passe);
    if (!ok) return res.status(400).json({ error: 'Ancien mot de passe incorrect.' });
    const hash = await bcrypt.hash(nouveau_mot_de_passe, 10);
    await db.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id, nom, role, ville, telephone FROM utilisateurs WHERE id = ?',
      [req.params.id]
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.getTravailleurs = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.nom, u.ville, u.telephone, u.description,
              s.nom AS specialite, t.experience, t.tarif_horaire
       FROM utilisateurs u
       LEFT JOIN travailleurs t ON t.id_utilisateur = u.id
       LEFT JOIN specialites s ON s.id = t.id_specialite
       WHERE u.role = 'travailleur'`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Erreur serveur' }); }
};