const db = require('../config/db');

/* ── Créer une annonce ── */
exports.create = async (req, res) => {
  const { titre, description, ville, budget, date_service } = req.body;
  const id_client = req.user.id;
  try {
    const [result] = await db.query(
      /* ✅ FIX: id_specialite retiré — colonne absente de la table annonces → causait l'erreur serveur */
      `INSERT INTO annonces (titre, description, ville, budget, date_service, id_client)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titre, description, ville, budget, date_service || null, id_client]
    );
    res.status(201).json({ id: result.insertId, message: 'Annonce créée' });
  } catch (err) {
    console.error('Create annonce error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ── Toutes les annonces en attente (pour travailleurs) ── */
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, u.nom AS client_nom
       FROM annonces a
       JOIN utilisateurs u ON a.id_client = u.id
       WHERE a.statut = 'en_attente'
       ORDER BY a.date_creation DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GetAll annonces error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ── Annonces du client connecté ── */
exports.getMine = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM annonces WHERE id_client = ? ORDER BY date_creation DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GetMine annonces error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ── Accepter une annonce ── */
exports.accept = async (req, res) => {
  const { id } = req.params;
  try {
    const [[annonce]] = await db.query('SELECT * FROM annonces WHERE id = ?', [id]);
    if (!annonce) return res.status(404).json({ error: 'Annonce non trouvée' });
    await db.query(
      `UPDATE annonces SET statut = 'accepte', id_travailleur = ? WHERE id = ?`,
      [req.user.id, id]
    );
    res.json({ message: 'Candidature envoyée avec succès' });
  } catch (err) {
    console.error('Accept error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ── Terminer une annonce ── */
exports.complete = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      `UPDATE annonces SET statut = 'termine' WHERE id = ? AND id_client = ?`,
      [id, req.user.id]
    );
    res.json({ message: 'Annonce terminée' });
  } catch (err) {
    console.error('Complete annonce error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ── Gains du mois courant pour le travailleur connecté ── */
exports.getMyEarnings = async (req, res) => {
  try {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    const [[row]] = await db.query(
      `SELECT COALESCE(SUM(budget), 0) AS total
       FROM annonces
       WHERE id_travailleur = ?
         AND statut = 'termine'
         AND YEAR(date_creation) = ?
         AND MONTH(date_creation) = ?`,
      [req.user.id, year, month]
    );
    res.json({ total: parseFloat(row.total) || 0 });
  } catch (err) {
    console.error('GetMyEarnings error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};