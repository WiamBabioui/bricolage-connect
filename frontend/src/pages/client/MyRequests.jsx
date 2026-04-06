import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STATUS = {
  en_attente: { label: 'En attente', bg: '#fef3c7', color: '#b45309' },
  accepte:    { label: 'Accepté',    bg: '#dbeafe', color: '#1d4ed8' },
  termine:    { label: 'Terminé',    bg: '#dcfce7', color: '#15803d' },
};

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/services/me')
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id) => {
    try {
      await api.put(`/services/${id}/done`);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, statut: 'termine' } : r));
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="requests-container" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', padding: '2rem' }}>
      
      <style>{`
        /* 📱 RESPONSIVITÉ TÉLÉPHONE (Standard & Petits écrans) */
        @media (max-width: 600px) {
          .requests-container { padding: 1rem !important; }
          
          .header-row { 
            flex-direction: column !important; 
            align-items: flex-start !important; 
            gap: 1.25rem !important; 
          }
          
          .btn-new-request { 
            width: 100% !important; 
            justify-content: center !important; 
          }

          .empty-state { padding: 3rem 1rem !important; }
          .empty-state h3 { font-size: 1.15rem !important; }

          /* Correction du bouton qui se casse en deux */
          .btn-primary {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            max-width: 280px !important;
            white-space: nowrap !important;
            padding: 0.8rem 1rem !important;
          }

          .card-main { 
            flex-direction: column !important; 
            align-items: flex-start !important; 
          }
          
          .card-actions { 
            width: 100% !important; 
            align-items: flex-start !important; 
            margin-top: 1rem !important;
          }
          
          .card-actions button { width: 100% !important; }
        }
      `}</style>

      <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.4rem 0' }}>Mes demandes</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Suivez l'état de toutes vos demandes de service.</p>
        </div>
        <Link to="/client/new-request" className="btn-new-request" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: '#b87332', color: 'white', padding: '0.75rem 1.5rem',
          borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem',
          boxShadow: '0 4px 12px rgba(184,115,50,0.25)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
          Nouvelle demande
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>hourglass_empty</span>
          Chargement...
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>assignment</span>
          <h3 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Aucune demande pour l'instant</h3>
          <p style={{ marginBottom: '1.5rem' }}>Créez votre première demande de service.</p>
          <Link to="/client/new-request" className="btn-primary" style={{ 
            backgroundColor: '#b87332', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '10px', 
            fontWeight: 700, 
            textDecoration: 'none' 
          }}>
            Créer une demande
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => {
            const st = STATUS[req.statut] || STATUS['en_attente'];
            return (
              <div key={req.id} style={{
                backgroundColor: '#ffffff', borderRadius: '14px',
                border: '1.5px solid #f1f5f9', padding: '1.5rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                <div className="card-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: '1rem' }}>{req.titre}</h3>
                      <span style={{ padding: '2px 10px', borderRadius: '999px', backgroundColor: st.bg, color: st.color, fontSize: '0.72rem', fontWeight: 700 }}>
                        {st.label}
                      </span>
                    </div>
                    {req.description && (
                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.75rem 0', lineHeight: 1.6 }}>
                        {req.description.slice(0, 120)}{req.description.length > 120 ? '...' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.8rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>location_on</span>
                        {req.ville}
                      </span>
                      {req.budget && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#b87332', fontSize: '0.8rem', fontWeight: 700 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>payments</span>
                          {req.budget} MAD
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    {req.statut === 'accepte' && (
                      <button onClick={() => handleComplete(req.id)} style={{
                        backgroundColor: '#22c55e', color: 'white', padding: '0.6rem 1.25rem',
                        borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer',
                        fontSize: '0.8rem', fontFamily: 'Inter, sans-serif'
                      }}>
                        Marquer terminé
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}