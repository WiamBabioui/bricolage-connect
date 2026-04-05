import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DUMMY_WORKERS = [
  { id: 1, nom: 'Ahmed Benali',    ville: 'Casablanca', specialite: 'Plomberie',    tarif_horaire: 150, experience: 8  },
  { id: 2, nom: 'Karim Idrissi',   ville: 'Rabat',      specialite: 'Électricité',  tarif_horaire: 180, experience: 12 },
  { id: 3, nom: 'Youssef Chraibi', ville: 'Marrakech',  specialite: 'Menuiserie',   tarif_horaire: 200, experience: 6  },
  { id: 4, nom: 'Hassan Tazi',     ville: 'Casablanca', specialite: 'Peinture',     tarif_horaire: 120, experience: 5  },
  { id: 5, nom: 'Omar Filali',     ville: 'Agadir',     specialite: 'Nettoyage',    tarif_horaire: 100, experience: 3  },
];

/* ── Villes marocaines prédéfinies ── */
const VILLES_MAROC = [
  'Agadir', 'Al Hoceïma', 'Béni Mellal', 'Berrechid', 'Casablanca',
  'El Jadida', 'Errachidia', 'Fès', 'Guelmim', 'Kénitra',
  'Khouribga', 'Laâyoune', 'Larache', 'Marrakech', 'Meknès',
  'Mohammedia', 'Nador', 'Oujda', 'Ouarzazate', 'Rabat',
  'Safi', 'Salé', 'Settat', 'Tanger', 'Taroudant',
  'Taza', 'Tétouan', 'Tiznit',
];

export default function FindWorkers() {
  const [workers, setWorkers]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filterVille, setFilterVille]     = useState('');
  const [showVilleDropdown, setShowVilleDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/utilisateurs/travailleurs')
      .then(res => setWorkers(res.data.length > 0 ? res.data : DUMMY_WORKERS))
      .catch(() => setWorkers(DUMMY_WORKERS))
      .finally(() => setLoading(false));
  }, []);

  /* ── Villes prédéfinies + villes de la BDD (sans doublons) ── */
  const villes = [...new Set([
    ...VILLES_MAROC,
    ...workers.map(w => w.ville).filter(v => v && v.trim() !== '' && v !== '—'),
  ])].sort();

  /* ── Filtrage ── */
  const filtered = workers.filter(w => {
    const matchSearch = !search ||
      w.nom?.toLowerCase().includes(search.toLowerCase()) ||
      w.specialite?.toLowerCase().includes(search.toLowerCase());
    const matchVille = !filterVille ||
      w.ville?.toLowerCase() === filterVille.toLowerCase();
    return matchSearch && matchVille;
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', padding: '2rem' }}>

      {/* Titre */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.4rem 0' }}>
          Trouver un professionnel
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Parcourez nos artisans vérifiés et contactez-les directement.
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>

        {/* Recherche */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
            color: '#94a3b8', fontSize: '1.1rem'
          }}>search</span>
          <input
            type="text"
            placeholder="Rechercher par nom ou spécialité..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.7rem 1rem 0.7rem 2.75rem',
              borderRadius: '10px', border: '1.5px solid #e2e8f0',
              fontSize: '0.875rem', outline: 'none',
              fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc',
              boxSizing: 'border-box', color: '#1e293b'
            }}
            onFocus={e => e.target.style.borderColor = '#b87332'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>

        {/* Dropdown villes */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowVilleDropdown(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.7rem 1rem', borderRadius: '10px',
              border: '1.5px solid', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500,
              backgroundColor: filterVille ? '#b87332' : '#f8fafc',
              borderColor:     filterVille ? '#b87332' : '#e2e8f0',
              color:           filterVille ? 'white'   : '#475569',
              minWidth: '180px', transition: 'all 0.2s'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>location_on</span>
            {filterVille || 'Toutes les villes'}
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginLeft: 'auto' }}>
              {showVilleDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Menu déroulant */}
          {showVilleDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0,
              backgroundColor: '#ffffff', borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 100, overflowY: 'auto',
              maxHeight: '280px', minWidth: '200px'
            }}>
              {/* Toutes les villes */}
              <button
                onClick={() => { setFilterVille(''); setShowVilleDropdown(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.75rem 1rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  backgroundColor: !filterVille ? 'rgba(184,115,50,0.08)' : '#ffffff',
                  color: !filterVille ? '#b87332' : '#475569',
                  fontWeight: !filterVille ? 700 : 400,
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                Toutes les villes
              </button>

              {/* Liste des villes */}
              {villes.map(ville => (
                <button key={ville}
                  onClick={() => { setFilterVille(ville); setShowVilleDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.7rem 1rem', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                    backgroundColor: filterVille === ville ? 'rgba(184,115,50,0.08)' : '#ffffff',
                    color: filterVille === ville ? '#b87332' : '#475569',
                    fontWeight: filterVille === ville ? 700 : 400,
                    borderBottom: '1px solid #f8fafc'
                  }}
                  onMouseOver={e => { if (filterVille !== ville) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseOut={e => { if (filterVille !== ville) e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  {ville}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Réinitialiser */}
        {(search || filterVille) && (
          <button
            onClick={() => { setSearch(''); setFilterVille(''); }}
            style={{
              padding: '0.7rem 1rem', borderRadius: '10px',
              border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff',
              color: '#64748b', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Compteur */}
      <p style={{ color: '#94a3b8', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
        {filtered.length} professionnel{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
        {filterVille && ` à ${filterVille}`}
        {search && ` pour "${search}"`}
      </p>

      {/* Overlay pour fermer le dropdown */}
      {showVilleDropdown && (
        <div
          onClick={() => setShowVilleDropdown(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
        />
      )}

      {/* Résultats */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
            hourglass_empty
          </span>
          Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>
            person_search
          </span>
          <p>Aucun professionnel trouvé.</p>
          {(search || filterVille) && (
            <button
              onClick={() => { setSearch(''); setFilterVille(''); }}
              style={{
                marginTop: '1rem', backgroundColor: '#b87332', color: 'white',
                padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600
              }}
            >
              Voir tous les professionnels
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(worker => (
            <div key={worker.id} style={{
              backgroundColor: '#ffffff', borderRadius: '14px',
              border: '1.5px solid #f1f5f9', padding: '1.5rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s'
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'rgba(184,115,50,0.3)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = '#f1f5f9';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
            }}>

              {/* Avatar + Nom */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  backgroundColor: '#2F3E34', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1.25rem', flexShrink: 0
                }}>
                  {(worker.nom || 'W')[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                    {worker.nom}
                  </h3>
                  <span style={{
                    padding: '2px 8px', borderRadius: '999px',
                    backgroundColor: 'rgba(47,62,52,0.08)',
                    color: '#2F3E34', fontSize: '0.72rem', fontWeight: 700
                  }}>
                    {worker.specialite || 'Artisan'}
                  </span>
                </div>
              </div>

              {/* Infos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>location_on</span>
                  {worker.ville || 'Ville non renseignée'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>workspace_premium</span>
                  {worker.experience || 0} ans d'expérience
                </div>
                {worker.tarif_horaire && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#b87332', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>payments</span>
                    {parseFloat(worker.tarif_horaire).toFixed(0)} MAD/h
                  </div>
                )}
              </div>

              {/* Bouton Contacter */}
              <button
                onClick={() => navigate(`/client/chat/${worker.id}`)}
                style={{
                  width: '100%', padding: '0.7rem', borderRadius: '8px',
                  backgroundColor: '#2F3E34', color: 'white', fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                  fontFamily: 'Inter, sans-serif', transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#b87332'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#2F3E34'}
              >
                Contacter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}