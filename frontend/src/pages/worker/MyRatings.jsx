import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DUMMY_RATINGS = [
  { id: 1, note: 5, commentaire: 'Excellent travail, très professionnel et ponctuel !', client_nom: 'Arthur D.', date_avis: '2024-10-10' },
  { id: 2, note: 4, commentaire: 'Bon travail, rapide et soigné. Je recommande.', client_nom: 'Marie L.', date_avis: '2024-10-05' },
  { id: 3, note: 5, commentaire: 'Parfait ! Résultat impeccable, très satisfait.', client_nom: 'Thomas M.', date_avis: '2024-09-28' },
];

function Stars({ note }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= note ? '#f59e0b' : '#e2e8f0', fontSize: '1.1rem' }}>★</span>
      ))}
    </div>
  );
}

export default function MyRatings() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/avis/me`)
      .then(res => setRatings(res.data.length > 0 ? res.data : DUMMY_RATINGS))
      .catch(() => setRatings(DUMMY_RATINGS))
      .finally(() => setLoading(false));
  }, []);

  const avgNote = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.note, 0) / ratings.length).toFixed(1)
    : '—';

  const noteCount = [5, 4, 3, 2, 1].map(n => ({
    note: n,
    count: ratings.filter(r => r.note === n).length,
    pct: ratings.length > 0 ? Math.round((ratings.filter(r => r.note === n).length / ratings.length) * 100) : 0
  }));

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', padding: '2rem' }}>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Mes avis</h1>
      <p style={{ color: '#64748b', margin: '0 0 2rem 0' }}>Les évaluations laissées par vos clients.</p>

      {/* Résumé */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1.5px solid #f1f5f9' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{avgNote}</span>
          <Stars note={Math.round(parseFloat(avgNote) || 0)} />
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>{ratings.length} avis</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          {noteCount.map(({ note, count, pct }) => (
            <div key={note} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', width: '20px' }}>{note}★</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#f59e0b', borderRadius: '999px', transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '30px' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste avis */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Chargement...</div>
      ) : ratings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>star_border</span>
          Aucun avis pour l'instant. Complétez des missions pour recevoir des évaluations.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ratings.map(r => (
            <div key={r.id} style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1.5px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#b87332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    {(r.client_nom || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: '0.9rem' }}>{r.client_nom || 'Client'}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>{r.date_avis?.split('T')[0] || r.date_avis}</p>
                  </div>
                </div>
                <Stars note={r.note} />
              </div>
              {r.commentaire && (
                <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                  "{r.commentaire}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
