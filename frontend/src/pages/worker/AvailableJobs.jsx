import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AvailableJobs() {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(null);
  const [success, setSuccess]   = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    api.get('/annonces')
      .then(res => setJobs(res.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await api.put(`/annonces/${jobId}/accept`);
      setSuccess(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la candidature');
    } finally {
      setApplying(null);
    }
  };

  /* ── Filtrage ── */
  const filtered = jobs.filter(job => {
    const matchSearch = !search ||
      job.titre?.toLowerCase().includes(search.toLowerCase()) ||
      job.ville?.toLowerCase().includes(search.toLowerCase());

    const budget = parseFloat(job.budget) || 0;
    const matchBudget =
      filter === 'all'  ? true :
      filter === 'low'  ? budget < 500 :
      filter === 'mid'  ? budget >= 500 && budget <= 1500 :
      filter === 'high' ? budget > 1500 : true;

    return matchSearch && matchBudget;
  });

  const FILTERS = [
    { key: 'all',  label: 'Tous' },
    { key: 'low',  label: '< 500 MAD' },
    { key: 'mid',  label: '500–1500 MAD' },
    { key: 'high', label: '> 1500 MAD' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', padding: '2rem' }}>

      {/* Titre */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0' }}>
          Jobs disponibles
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
          Parcourez les annonces et postulez aux missions qui correspondent à votre spécialité.
        </p>
      </div>

      {/* Barre de recherche + filtres budget */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Recherche */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
            color: '#94a3b8', fontSize: '1.1rem'
          }}>search</span>
          <input
            type="text"
            placeholder="Rechercher par titre ou ville..."
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

        {/* Boutons filtres budget */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                padding: '0.6rem 1.1rem', borderRadius: '8px',
                fontSize: '0.825rem', fontWeight: 600,
                border: '1.5px solid', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                backgroundColor: filter === key ? '#b87332' : '#ffffff',
                borderColor:     filter === key ? '#b87332' : '#e2e8f0',
                color:           filter === key ? 'white'   : '#64748b',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Message succès */}
      {success && (
        <div style={{
          marginBottom: '1rem', padding: '0.875rem 1.25rem',
          backgroundColor: '#dcfce7', border: '1px solid #86efac',
          borderRadius: '10px', color: '#15803d', fontSize: '0.875rem', fontWeight: 600
        }}>
          ✅ Candidature envoyée ! Le client sera notifié.
        </div>
      )}

      {/* Compteur */}
      {!loading && (
        <p style={{ color: '#94a3b8', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
          {filtered.length} job{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          {filter !== 'all' && ` · filtre budget actif`}
          {search && ` · "${search}"`}
        </p>
      )}

      {/* Contenu */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
            hourglass_empty
          </span>
          Chargement des jobs...
        </div>

      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>
            work_off
          </span>
          <h3 style={{ fontWeight: 700, color: '#475569', margin: '0 0 0.5rem 0' }}>
            Aucun job disponible pour le moment
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Les clients n'ont pas encore publié d'annonces.
          </p>
        </div>

      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>
            search_off
          </span>
          <p style={{ fontWeight: 600, color: '#475569', margin: '0 0 1rem 0' }}>
            Aucun job pour ce filtre.
          </p>
          <button onClick={() => { setFilter('all'); setSearch(''); }}
            style={{
              backgroundColor: '#b87332', color: 'white', padding: '0.6rem 1.25rem',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontWeight: 600
            }}>
            Voir tous les jobs
          </button>
        </div>

      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((job) => (
            <div key={job.id} style={{
              backgroundColor: '#ffffff', borderRadius: '14px',
              border: '1.5px solid #f1f5f9', padding: '1.5rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s'
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'rgba(184,115,50,0.35)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,115,50,0.1)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = '#f1f5f9';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>

                {/* Infos */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: '1.05rem' }}>
                      {job.titre}
                    </h3>
                    <span style={{
                      padding: '2px 10px', borderRadius: '999px',
                      backgroundColor: '#dcfce7', color: '#15803d',
                      fontSize: '0.7rem', fontWeight: 700
                    }}>
                      Disponible
                    </span>
                  </div>

                  {job.description && (
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.75rem 0', lineHeight: 1.6 }}>
                      {job.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.825rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>location_on</span>
                      {job.ville || '—'}
                    </span>
                    {job.budget && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b87332', fontSize: '0.825rem', fontWeight: 700 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>payments</span>
                        Budget : {parseFloat(job.budget).toFixed(0)} MAD
                      </span>
                    )}
                    {job.date_creation && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.825rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>calendar_today</span>
                        {job.date_creation?.split('T')[0] || job.date_creation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bouton postuler */}
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={applying === job.id}
                  style={{
                    backgroundColor: applying === job.id ? '#d4a46a' : '#b87332',
                    color: 'white', padding: '0.75rem 1.75rem',
                    borderRadius: '10px', fontWeight: 700, border: 'none',
                    cursor: applying === job.id ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap', transition: 'background 0.2s',
                    boxShadow: '0 2px 8px rgba(184,115,50,0.3)', flexShrink: 0
                  }}
                  onMouseOver={e => { if (applying !== job.id) e.currentTarget.style.backgroundColor = '#a0652a'; }}
                  onMouseOut={e => { if (applying !== job.id) e.currentTarget.style.backgroundColor = '#b87332'; }}
                >
                  {applying === job.id ? 'Envoi...' : 'Postuler'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}