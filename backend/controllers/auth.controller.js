const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

/* ── REGISTER ── */
exports.register = async (req, res) => {
  const { nom, email, mot_de_passe, role, telephone, ville } = req.body;

  if (!nom || !email || !mot_de_passe || !role) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);

    const [result] = await db.query(
      `INSERT INTO utilisateurs (nom, email, mot_de_passe, role, telephone, ville)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, email, hash, role, telephone || null, ville || null]
    );

    const newUser = { id: result.insertId, nom, email, role };

    // Si travailleur : insérer dans la table travailleurs
    if (role === 'travailleur') {
      const { id_specialite, experience, tarif_horaire } = req.body;
      if (id_specialite) {
        await db.query(
          `INSERT INTO travailleurs (id_utilisateur, id_specialite, experience, tarif_horaire)
           VALUES (?, ?, ?, ?)`,
          [result.insertId, id_specialite, experience || 0, tarif_horaire || 0]
        );
      }
    }

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ── LOGIN ── */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const [[user]] = await db.query(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Email introuvable' });
    }

    const valid = await bcrypt.compare(password, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      // ✅ FIX: ajout de telephone et ville pour que le profil s'affiche correctement après connexion
      user: {
        id:        user.id,
        nom:       user.nom,
        email:     user.email,
        role:      user.role,
        telephone: user.telephone || null,
        ville:     user.ville     || null,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ── GET ME ── */
exports.getMe = async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT id, nom, email, role, telephone, ville, photo FROM utilisateurs WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};