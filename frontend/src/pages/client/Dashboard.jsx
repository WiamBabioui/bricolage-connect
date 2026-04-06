import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logo from '../../assets/logo.jpg';

const seenKey = (userId, otherId) => `seenCount_${userId}_${otherId}`;

const NAV_ITEMS = [
  { icon: 'dashboard',     label: 'Dashboard',      shortLabel: 'Dashboard', path: '/client/dashboard' },
  { icon: 'assignment',    label: 'Mes demandes',   shortLabel: 'Demandes',  path: '/client/requests'  },
  { icon: 'chat_bubble',   label: 'Messages',       shortLabel: 'Messages',  path: '/client/messages'  },
  { icon: 'person_search', label: 'Trouver un pro', shortLabel: 'Trouver',   path: '/client/workers'   },
  { icon: 'account_circle',label: 'Profil',         shortLabel: 'Profil',    path: '/client/profile'   },
];

export default function ClientDashboard() {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [unreadCount, setUnread]      = useState(0);
  const [unreadConvs, setUnreadConvs] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showBell, setShowBell]       = useState(false);
  const { user, logout }              = useAuth();
  const navigate                      = useNavigate();
  const currentPath                   = '/client/dashboard';
  const profileRef                    = useRef(null);
  const bellRef                       = useRef(null);

  useEffect(() => {
    api.get('/services/me')
      .then(res => setRequests(res.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    api.get('/messages/conversations').then(res => {
      const unread = res.data.filter(conv => {
        const total = parseInt(conv.total_from_other || 0, 10);
        const seen  = parseInt(localStorage.getItem(seenKey(user.id, conv.other_id)) || '0', 10);
        return total > seen;
      });
      setUnread(unread.length);
      setUnreadConvs(unread);
    }).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/deconnexion'); };

  const totalRequests = requests.length;
  const accepted      = requests.filter(r => r.statut === 'accepte').length;
  const completed     = requests.filter(r => r.statut === 'termine').length;

  const getStatusStyle = (statut) => {
    switch(statut) {
      case 'termine':    return { bg: '#dcfce7', color: '#15803d', label: 'Terminé'    };
      case 'accepte':    return { bg: '#dbeafe', color: '#1d4ed8', label: 'Accepté'    };
      case 'en_attente': return { bg: '#fef3c7', color: '#b45309', label: 'En attente' };
      default:           return { bg: '#f1f5f9', color: '#64748b', label: statut       };
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff' }}>

      {/* ══ SIDEBAR ══ */}
      <aside className="db-sidebar" style={{ width: '288px', backgroundColor: '#2F3E34', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logo} alt="logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
          <div className="db-sidebar-brand">
            <h1 style={{ color: '#F5F2EC', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Bricolage</h1>
            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.7rem', fontWeight: 500, margin: 0 }}>PORTAIL CLIENT</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map(({ icon, label, path }) => {
            const active  = path === currentPath;
            const isMsgs  = path === '/client/messages';
            return (
              <Link key={path} to={path} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
                backgroundColor: active ? 'rgba(184,115,50,0.2)' : 'transparent',
                borderLeft: active ? '4px solid #b87332' : '4px solid transparent',
                color: active ? '#F5F2EC' : 'rgba(245,242,236,0.65)',
                position: 'relative', justifyContent: 'flex-start',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
                <span className="db-nav-label">{label}</span>
                {isMsgs && unreadCount > 0 && (
                  <span className="db-nav-badge" style={{ position: 'absolute', right: '0.75rem', backgroundColor: '#22c55e', color: 'white', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', minWidth: '20px', textAlign: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(245,242,236,0.65)', fontFamily: 'Inter, sans-serif' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', flexShrink: 0 }}>logout</span>
            <span className="db-nav-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="db-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#ffffff' }}>

        <header className="db-header" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <h2 className="db-header-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Bienvenue, {user?.nom || 'Client'} 👋</h2>
            <p className="db-header-sub" style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Gérez vos projets et connexions professionnelles.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>

            {/* Cloche */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowBell(v => !v)}
                style={{ width: 40, height: 40, borderRadius: '50%', border: unreadCount > 0 ? '2px solid #22c55e' : 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: unreadCount > 0 ? '#b87332' : '#475569', position: 'relative' }}>
                <span className="material-symbols-outlined">{unreadCount > 0 ? 'notifications_active' : 'notifications'}</span>
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }} />
                )}
              </button>

              {showBell && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 100, backgroundColor: '#ffffff', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', width: '280px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>Notifications</span>
                    {unreadCount > 0 && <span style={{ backgroundColor: '#22c55e', color: 'white', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px' }}>{unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}</span>}
                  </div>
                  {unreadConvs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>notifications_none</span>
                      Aucune nouvelle notification
                    </div>
                  ) : (
                    <div>
                      {unreadConvs.map(conv => (
                        <Link key={conv.other_id} to="/client/messages" onClick={() => setShowBell(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', textDecoration: 'none', borderBottom: '1px solid #f8fafc', backgroundColor: 'rgba(34,197,94,0.04)' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.04)'}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#2F3E34', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                            {(conv.other_nom || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: '0.85rem' }}>{conv.other_nom}</p>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.last_message?.startsWith('📎') ? '📎 Fichier partagé' : conv.last_message}
                            </p>
                          </div>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
                        </Link>
                      ))}
                      <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <Link to="/client/messages" onClick={() => setShowBell(false)} style={{ color: '#b87332', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>Voir tous les messages →</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div onClick={() => setShowProfile(v => !v)}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #b87332', backgroundColor: '#b87332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                {(user?.nom || 'C')[0].toUpperCase()}
              </div>

              {showProfile && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 100, backgroundColor: '#ffffff', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', width: '260px', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem', backgroundColor: '#2F3E34', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#b87332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.25rem', flexShrink: 0 }}>
                      {(user?.nom || 'C')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: 'white', margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nom}</p>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(184,115,50,0.3)', color: '#f5c89a', padding: '2px 8px', borderRadius: '999px' }}>Client</span>
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    {[
                      { icon: 'mail',        label: 'Email',     value: user?.email     || '—' },
                      { icon: 'call',        label: 'Téléphone', value: user?.telephone  || '—' },
                      { icon: 'location_on', label: 'Ville',     value: user?.ville      || '—' },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #f8fafc' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#b87332', flexShrink: 0 }}>{icon}</span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>{label}</p>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Link to="/client/profile" onClick={() => setShowProfile(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', textDecoration: 'none', color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#b87332' }}>manage_accounts</span>
                      Modifier le profil
                    </Link>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', width: '100%', textAlign: 'left' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="db-content" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Stats — gridTemplateColumns géré par CSS seulement */}
          <div className="db-stats-grid" style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              { icon: 'pending_actions', label: 'Total demandes',    value: String(totalRequests), bg: '#fff7ed', color: '#f97316' },
              { icon: 'handshake',       label: 'Jobs acceptés',     value: String(accepted),      bg: '#fdf4e7', color: '#b87332' },
              { icon: 'task_alt',        label: 'Services complétés',value: String(completed),     bg: '#f0fdf4', color: '#22c55e' },
            ].map(({ icon, label, value, bg, color }) => (
              <div key={label} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>{icon}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
                  <p className="db-stat-value" style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div className="db-table-header" style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Demandes récentes</h3>
              <Link to="/client/new-request" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#b87332', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(184,115,50,0.25)', whiteSpace: 'nowrap' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
                Nouvelle demande
              </Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chargement...</div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                <p style={{ fontWeight: 600, color: '#475569', margin: '0 0 1rem 0' }}>Aucune demande pour l'instant</p>
                <Link to="/client/new-request" style={{ backgroundColor: '#b87332', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>Créer ma première demande</Link>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#fafafa' }}>
                        {['Titre', 'Ville', 'Budget', 'Statut', 'Date', 'Actions'].map((h, i) => (
                          <th key={h} style={{ padding: '1rem 1.5rem', textAlign: i === 5 ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 5).map((req) => {
                        const st = getStatusStyle(req.statut);
                        return (
                          <tr key={req.id} style={{ borderTop: '1px solid #f8fafc' }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{req.titre}</td>
                            <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', whiteSpace: 'nowrap' }}>{req.ville || '—'}</td>
                            <td style={{ padding: '1.25rem 1.5rem', color: '#b87332', fontWeight: 600, whiteSpace: 'nowrap' }}>{req.budget ? `${parseFloat(req.budget).toFixed(0)} MAD` : '—'}</td>
                            <td style={{ padding: '1.25rem 1.5rem' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{st.label}</span>
                            </td>
                            <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{req.date_creation?.split('T')[0] || '—'}</td>
                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                              <Link to="/client/requests" style={{ color: '#b87332', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>Détails</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#94a3b8', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>Affichage de {Math.min(requests.length, 5)} sur {requests.length} demandes</span>
                  <Link to="/client/requests" style={{ color: '#b87332', fontWeight: 700, textDecoration: 'none' }}>Voir tout →</Link>
                </div>
              </>
            )}
          </div>

          {/* Promo cards */}
          <div className="db-promo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
            <div style={{ backgroundColor: '#2F3E34', borderRadius: '16px', padding: '2rem', color: '#F5F2EC', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Besoin d'un pro maintenant ?</h4>
                <p style={{ color: 'rgba(245,242,236,0.65)', marginBottom: '1.5rem', maxWidth: '280px', fontSize: '0.9rem' }}>Parcourez notre annuaire de top artisans vérifiés pour vos besoins urgents.</p>
                <Link to="/client/workers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F5F2EC', color: '#2F3E34', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                  Parcourir <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                </Link>
              </div>
              <span className="material-symbols-outlined" style={{ position: 'absolute', right: '-2rem', bottom: '-2rem', fontSize: '10rem', opacity: 0.08 }}>engineering</span>
            </div>
            <div style={{ backgroundColor: 'rgba(184,115,50,0.08)', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(184,115,50,0.18)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#b87332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Bricolage Assurance</h4>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>Tous les services réservés via notre plateforme sont protégés par notre garantie satisfaction premium.</p>
                <a href="#" style={{ color: '#b87332', fontWeight: 700, fontSize: '0.875rem', marginTop: '1rem', display: 'inline-block' }}>En savoir plus →</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ══ BOTTOM NAV mobile ══ */}
      <nav className="db-mobile-nav">
        {NAV_ITEMS.map(({ icon, shortLabel, path }) => {
          const active = path === currentPath;
          const isMsgs = path === '/client/messages';
          return (
            <Link key={path} to={path} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              textDecoration: 'none', color: active ? '#b87332' : '#94a3b8',
              fontSize: '0.6rem', fontWeight: 600, position: 'relative', flex: 1, padding: '0.5rem 0',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>{icon}</span>
              <span>{shortLabel}</span>
              {isMsgs && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: '50%', transform: 'translateX(10px)', backgroundColor: '#22c55e', color: 'white', borderRadius: '999px', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{unreadCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <style>{`
        /* ── Desktop : stats 3 colonnes ── */
        .db-stats-grid { grid-template-columns: repeat(3, 1fr); }

        /* ══ Sidebar icon-only (≤ 1024px) ══ */
        @media (max-width: 1024px) {
          .db-sidebar       { width: 72px !important; }
          .db-sidebar-brand { display: none !important; }
          .db-nav-label     { display: none !important; }
          .db-nav-badge     { right: 4px !important; }
          .db-header        { padding: 0 1.25rem !important; }
          .db-content       { padding: 1.5rem !important; }
          .db-stats-grid    { gap: 1rem !important; }
          .db-promo-grid    { gap: 1rem !important; }
        }

        /* ══ Tablettes / Mobile (≤ 768px) ══ */
        @media (max-width: 768px) {
          .db-sidebar       { display: none !important; }
          .db-mobile-nav    { display: flex !important; }
          .db-main          { padding-bottom: 64px !important; }
          .db-header        { padding: 0 1rem !important; height: 64px !important; }
          .db-header-sub    { display: none !important; }
          .db-header-title  { font-size: 1.15rem !important; }
          .db-content       { padding: 1rem !important; gap: 1.25rem !important; }
          /* ✅ Stats empilées : 1 par ligne */
          .db-stats-grid    { grid-template-columns: 1fr !important; gap: 0.75rem !important; }
          .db-stat-value    { font-size: 1.5rem !important; }
          .db-promo-grid    { grid-template-columns: 1fr !important; }
          .db-table-header  { padding: 1rem !important; }
        }

        /* ══ iPhone 14 Pro Max / Pixel 7 (≤ 430px) ══ */
        @media (max-width: 430px) {
          .db-content       { padding: 0.875rem !important; gap: 1rem !important; }
          .db-header-title  { font-size: 1rem !important; }
        }

        /* ══ iPhone SE (≤ 375px) ══ */
        @media (max-width: 375px) {
          .db-content       { padding: 0.75rem !important; }
        }

        /* ══ Galaxy Z Fold 5 plié (≤ 344px) ══ */
        @media (max-width: 344px) {
          .db-content       { padding: 0.625rem !important; }
        }

        /* Mobile bottom nav */
        .db-mobile-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 64px;
          background: #2F3E34;
          border-top: 1px solid rgba(255,255,255,0.1);
          z-index: 50;
          align-items: center;
          justify-content: space-around;
        }
      `}</style>
    </div>
  );
}