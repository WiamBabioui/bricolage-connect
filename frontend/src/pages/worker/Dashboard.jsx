import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logo from '../../assets/logo.jpg';

const seenKey = (userId, otherId) => `seenCount_${userId}_${otherId}`;

const NAV_ITEMS = [
  { icon: 'dashboard',      label: 'Dashboard',        shortLabel: 'Dashboard', path: '/worker/dashboard' },
  { icon: 'work',           label: 'Jobs disponibles',  shortLabel: 'Jobs',      path: '/worker/jobs'      },
  { icon: 'chat_bubble',    label: 'Messages',          shortLabel: 'Messages',  path: '/worker/messages'  },
  { icon: 'star',           label: 'Mes avis',          shortLabel: 'Mes avis',  path: '/worker/ratings'   },
  { icon: 'account_circle', label: 'Profil',            shortLabel: 'Profil',    path: '/worker/profile'   },
];

export default function WorkerDashboard() {
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [applying, setApplying]       = useState(null);
  const [earnings, setEarnings]       = useState(null);
  const [unreadCount, setUnread]      = useState(0);
  const [unreadConvs, setUnreadConvs] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showBell, setShowBell]       = useState(false);
  const { user, logout }              = useAuth();
  const navigate                      = useNavigate();
  const currentPath                   = '/worker/dashboard';
  const profileRef                    = useRef(null);
  const bellRef                       = useRef(null);

  useEffect(() => {
    api.get('/annonces')
      .then(res => setJobs(res.data.slice(0, 4)))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));

    api.get('/services/earnings')
      .then(res => setEarnings(res.data.total))
      .catch(() => setEarnings(0));
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

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await api.put(`/annonces/${jobId}/accept`);
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la candidature');
    } finally { setApplying(null); }
  };

  const handleLogout = () => { logout(); navigate('/deconnexion'); };

  const formatEarnings = (val) => {
    if (val === null) return '...';
    if (val === 0) return '0 MAD';
    return `${val.toLocaleString('fr-FR')} MAD`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff' }}>

      {/* ══ SIDEBAR ══ */}
      <aside className="db-sidebar" style={{ width: '288px', backgroundColor: '#2F3E34', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logo} alt="logo" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
          <div className="db-sidebar-brand">
            <h1 style={{ color: '#F5F2EC', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Bricolage</h1>
            <p style={{ color: 'rgba(245,242,236,0.5)', fontSize: '0.7rem', fontWeight: 500, margin: 0 }}>PORTAIL TRAVAILLEUR</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map(({ icon, label, path }) => {
            const active  = path === currentPath;
            const isMsgs  = path === '/worker/messages';
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
            <h2 className="db-header-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Bonjour, {user?.nom || 'Professionnel'} 👷</h2>
            <p className="db-header-sub" style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Gérez vos missions et votre profil professionnel.</p>
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
                        <Link key={conv.other_id} to="/worker/messages" onClick={() => setShowBell(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', textDecoration: 'none', borderBottom: '1px solid #f8fafc', backgroundColor: 'rgba(34,197,94,0.04)' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.04)'}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#b87332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
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
                        <Link to="/worker/messages" onClick={() => setShowBell(false)} style={{ color: '#b87332', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>Voir tous les messages →</Link>
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
                {(user?.nom || 'W')[0].toUpperCase()}
              </div>

              {showProfile && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', zIndex: 100, backgroundColor: '#ffffff', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', width: '260px', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem', backgroundColor: '#2F3E34', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#b87332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.25rem', flexShrink: 0 }}>
                      {(user?.nom || 'W')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: 'white', margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nom}</p>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'rgba(184,115,50,0.3)', color: '#f5c89a', padding: '2px 8px', borderRadius: '999px' }}>Professionnel</span>
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
                    <Link to="/worker/profile" onClick={() => setShowProfile(false)}
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

          {/* Stats — Exactement comme le Dashboard Client */}
          <div className="db-stats-grid" style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              { icon: 'work',        label: 'Jobs disponibles', value: String(jobs.length),       bg: '#eff6ff', color: '#3b82f6' },
              { icon: 'star',        label: 'Note moyenne',      value: '4.9',                    bg: '#fefce8', color: '#eab308' },
              { icon: 'trending_up', label: 'Gains ce mois',     value: formatEarnings(earnings), bg: '#f0fdf4', color: '#22c55e' },
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

          {/* Jobs disponibles */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div className="db-table-header" style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Jobs disponibles récents</h3>
              <Link to="/worker/jobs" style={{ color: '#b87332', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Voir tout →</Link>
            </div>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chargement...</div>
              ) : jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>work_off</span>
                  <p style={{ fontWeight: 600, color: '#475569', margin: '0 0 0.25rem 0' }}>Aucun job disponible pour le moment</p>
                  <Link to="/worker/jobs" style={{ color: '#b87332', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>Actualiser →</Link>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="db-job-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa', transition: 'all 0.2s', gap: '1rem' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(184,115,50,0.4)'; e.currentTarget.style.backgroundColor = '#fffbf7'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.backgroundColor = '#fafafa'; }}>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.titre}</h4>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                        {job.ville}
                        {job.budget && <span style={{ fontWeight: 600, color: '#2F3E34' }}> • Budget : {parseFloat(job.budget).toFixed(0)} MAD</span>}
                      </p>
                    </div>
                    <button onClick={() => handleApply(job.id)} disabled={applying === job.id}
                      style={{ backgroundColor: applying === job.id ? '#d4a46a' : '#2F3E34', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: applying === job.id ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', transition: 'background 0.2s', flexShrink: 0 }}
                      onMouseOver={e => { if (applying !== job.id) e.currentTarget.style.backgroundColor = '#b87332'; }}
                      onMouseOut={e => { if (applying !== job.id) e.currentTarget.style.backgroundColor = '#2F3E34'; }}>
                      {applying === job.id ? 'Envoi...' : 'Postuler'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Promo Cards */}
          <div className="db-promo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingBottom: '2rem' }}>
            <div style={{ backgroundColor: '#2F3E34', borderRadius: '16px', padding: '2rem', color: '#F5F2EC', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Complétez votre profil</h4>
                <p style={{ color: 'rgba(245,242,236,0.65)', marginBottom: '1.5rem', maxWidth: '280px', fontSize: '0.9rem' }}>Un profil complet augmente vos chances d'être sélectionné par les clients.</p>
                <Link to="/worker/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F5F2EC', color: '#2F3E34', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                  Mon profil <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
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
          const isMsgs = path === '/worker/messages';
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
          .db-sidebar           { width: 72px !important; }
          .db-sidebar-brand     { display: none !important; }
          .db-nav-label         { display: none !important; }
          .db-nav-badge         { right: 4px !important; }
          .db-header            { padding: 0 1.25rem !important; }
          .db-content           { padding: 1.5rem !important; }
          .db-stats-grid        { gap: 1rem !important; }
          .db-promo-grid        { gap: 1rem !important; }
        }

        /* ══ Tablettes / Mobile (≤ 768px) ══ */
        @media (max-width: 768px) {
          .db-sidebar           { display: none !important; }
          .db-mobile-nav        { display: flex !important; }
          .db-main              { padding-bottom: 64px !important; }
          .db-header            { padding: 0 1rem !important; height: 64px !important; }
          .db-header-sub        { display: none !important; }
          .db-header-title      { font-size: 1.15rem !important; }
          .db-content           { padding: 1rem !important; gap: 1.25rem !important; }
          
          /* ✅ Stats empilées : 1 par ligne (comme client) */
          .db-stats-grid        { grid-template-columns: 1fr !important; gap: 0.75rem !important; }
          .db-stat-value        { font-size: 1.5rem !important; }
          
          .db-promo-grid        { grid-template-columns: 1fr !important; }
          .db-table-header      { padding: 1rem !important; }
          .db-job-item          { padding: 1rem !important; }
        }

        /* ══ iPhone 14 Pro Max / Pixel 7 (≤ 430px) ══ */
        @media (max-width: 430px) {
          .db-content           { padding: 0.875rem !important; gap: 1rem !important; }
          .db-header-title      { font-size: 1rem !important; }
          .db-job-item          { flex-direction: column !important; align-items: flex-start !important; }
          .db-job-item button   { width: 100% !important; }
        }

        /* ══ iPhone SE (≤ 375px) ══ */
        @media (max-width: 375px) {
          .db-content           { padding: 0.75rem !important; }
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