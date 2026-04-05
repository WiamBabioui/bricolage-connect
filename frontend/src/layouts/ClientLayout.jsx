import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/logo.jpg';

const seenKey = (userId, otherId) => `seenCount_${userId}_${otherId}`;

const NAV_ITEMS = [
  { icon: 'dashboard',     label: 'Dashboard',      path: '/client/dashboard', shortLabel: 'Dashboard' },
  { icon: 'assignment',    label: 'Mes demandes',   path: '/client/requests',  shortLabel: 'Demandes'  },
  { icon: 'chat_bubble',   label: 'Messages',       path: '/client/messages',  shortLabel: 'Messages'  },
  { icon: 'person_search', label: 'Trouver un pro', path: '/client/workers',   shortLabel: 'Trouver'   },
  { icon: 'account_circle',label: 'Profil',         path: '/client/profile',   shortLabel: 'Profil'    },
];

export default function ClientLayout() {
  const [unreadCount, setUnread]      = useState(0);
  const [unreadConvs, setUnreadConvs] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showBell, setShowBell]       = useState(false);
  const { user, logout }              = useAuth();
  const navigate                      = useNavigate();
  const location                      = useLocation();
  const currentPath                   = location.pathname;
  const profileRef                    = useRef(null);
  const bellRef                       = useRef(null);

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
  }, [user?.id, currentPath]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/deconnexion'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff' }}>

      {/* ══ SIDEBAR (desktop) ══ */}
      <aside className="cl-sidebar" style={{ width: '288px', backgroundColor: '#2F3E34', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logo} alt="logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
          <div className="cl-brand">
            <h1 style={{ color: '#F5F2EC', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Bricolage</h1>
            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.7rem', fontWeight: 500, margin: 0 }}>PORTAIL CLIENT</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map(({ icon, label, path }) => {
            const active = currentPath === path || currentPath.startsWith(path + '/');
            const isMsgs = path === '/client/messages';
            return (
              <Link key={path} to={path} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
                backgroundColor: active ? 'rgba(184,115,50,0.2)' : 'transparent',
                borderLeft: active ? '4px solid #b87332' : '4px solid transparent',
                color: active ? '#F5F2EC' : 'rgba(245,242,236,0.65)',
                position: 'relative',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
                <span className="cl-nav-label">{label}</span>
                {isMsgs && unreadCount > 0 && (
                  <span className="cl-nav-badge" style={{ position: 'absolute', right: '0.75rem', backgroundColor: '#22c55e', color: 'white', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', minWidth: '20px', textAlign: 'center' }}>
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
            <span className="cl-nav-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="cl-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header className="cl-header" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ minWidth: 0 }}>
            <h2 className="cl-header-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Bienvenue, {user?.nom || 'Client'} 👋
            </h2>
            <p className="cl-header-sub" style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Gérez vos projets et connexions professionnelles.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>

            {/* Cloche */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowBell(v => !v)}
                style={{ width: 40, height: 40, borderRadius: '50%', border: unreadCount > 0 ? '2px solid #22c55e' : 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: unreadCount > 0 ? '#b87332' : '#475569', position: 'relative' }}>
                <span className="material-symbols-outlined">{unreadCount > 0 ? 'notifications_active' : 'notifications'}</span>
                {unreadCount > 0 && <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }} />}
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

            {/* Avatar */}
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

        {/* Page content via Outlet */}
        <div className="cl-outlet" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>

      {/* ══ BOTTOM NAV (mobile uniquement) ══ */}
      <nav className="cl-bottom-nav">
        {NAV_ITEMS.map(({ icon, label, shortLabel, path }) => {
          const active = currentPath === path || currentPath.startsWith(path + '/');
          const isMsgs = path === '/client/messages';
          return (
            <Link key={path} to={path} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              textDecoration: 'none', color: active ? '#b87332' : '#94a3b8',
              fontSize: '0.6rem', fontWeight: 600, position: 'relative', flex: 1, padding: '0.5rem 0',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>{icon}</span>
              <span>{shortLabel || label}</span>
              {isMsgs && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: '50%', transform: 'translateX(10px)', backgroundColor: '#22c55e', color: 'white', borderRadius: '999px', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{unreadCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <style>{`
        /* ══ Sidebar icon-only (≤ 1024px) ══ */
        @media (max-width: 1024px) {
          .cl-sidebar    { width: 72px !important; }
          .cl-brand      { display: none !important; }
          .cl-nav-label  { display: none !important; }
          .cl-nav-badge  { right: 4px !important; }
          .cl-header     { padding: 0 1.25rem !important; }
        }

        /* ══ Mobile (≤ 768px) : sidebar cachée, bottom nav visible ══ */
        @media (max-width: 768px) {
          .cl-sidebar        { display: none !important; }
          .cl-bottom-nav     { display: flex !important; }
          .cl-main           { padding-bottom: 64px; }
          .cl-header         { padding: 0 1rem !important; height: 64px !important; }
          .cl-header-sub     { display: none !important; }
          .cl-header-title   { font-size: 1.1rem !important; }
          /* Stats : 1 colonne → Jobs acceptés sous Total demandes */
          .db-stats-grid     { grid-template-columns: 1fr !important; }
        }

        /* ══ iPhone SE (≤ 375px) ══ */
        @media (max-width: 375px) {
          .cl-header         { padding: 0 0.75rem !important; }
          .cl-header-title   { font-size: 1rem !important; }
        }

        /* Bottom nav — caché par défaut, visible mobile */
        .cl-bottom-nav {
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