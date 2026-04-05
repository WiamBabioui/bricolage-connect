import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.jpg';

const C = {
  bg: '#2F3E34', toggleBg: 'rgba(15,23,42,0.5)', activeBg: '#334155',
  inputBg: 'rgba(15,23,42,0.6)', inputBorder: '#334155',
  labelColor: '#cbd5e1', mutedColor: '#94a3b8', copper: '#b87332', white: '#ffffff',
};

const inputStyle = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  padding: '0.75rem 1rem 0.75rem 2.5rem',
  borderRadius: '0.5rem', border: `1px solid ${C.inputBorder}`,
  backgroundColor: C.inputBg, color: C.white, fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.15s',
  WebkitTextFillColor: C.white,
};

export default function RegisterClient() {
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', mot_de_passe: '', ville: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [terms, setTerms]       = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!terms) return setError("Veuillez accepter les conditions.");
    setLoading(true); setError('');
    try {
      await register({ ...formData, role: 'client' });
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally { setLoading(false); }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* GAUCHE */}
      <div style={{ position: 'relative', width: '50%', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem', overflow: 'hidden', display: 'none' }} className="lg-left">
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1 }} />
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSjFrMm_BjuaZ5L5i-8O15VnSWgyK6-mhkrK3YWmvadxol_qKVMIVYO5--bhLWieW3OTgwA-hociXut83Kp9tvohV3KaA7TTAYgHxNriRCVCs_Ptq9k02cBTIxXXO5T3Hd9L5DOLBP4wthXLo_4XF9URCDPzHglq0MVR2Fef8Tvz8Ds-btsFv7Wl4TCQHVtzDS5NKHt8wMuuS2C2CE1aLN6C8SotpsieL-a8IivUxDVXh21zAKAE7mg7p-aZuzpePQpKzPhL3rkw"
            alt="Artisan" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '0.5rem', backgroundColor: 'rgba(184,115,50,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logo} alt="logo" style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 4 }} />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>Bricolage Connect</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
          <h2 style={{ fontSize: '3.25rem', fontWeight: 800, color: 'white', lineHeight: 1.15, margin: '0 0 1.5rem 0' }}>La maîtrise dans chaque connexion.</h2>
          <p style={{ fontSize: '1.15rem', color: '#e2e8f0', lineHeight: 1.7, margin: 0 }}>Rejoignez le réseau premier où l'artisanat d'élite rencontre la vision exigeante. Que vous soyez maître de votre métier ou en quête d'excellence, votre parcours commence ici.</p>
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '2.5rem' }}>
          {[['5k+', 'MAÎTRES ARTISANS'], ['12k+', 'PROJETS PREMIUM']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{n}</div>
              <div style={{ fontSize: '0.7rem', color: '#cbd5e1', letterSpacing: '0.1em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DROITE */}
      <div className="form-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 6rem', backgroundColor: C.bg, overflowY: 'auto' }}>
        <div style={{ margin: '0 auto', width: '100%', maxWidth: '28rem' }}>

          {/* Logo mobile uniquement */}
          <div className="mobile-logo" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <img src={logo} alt="logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 12 }} />
            <span style={{ color: C.copper, fontWeight: 900, fontSize: '1.2rem' }}>Bricolage Connect</span>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: C.white, margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>Créer votre compte</h2>
            <p style={{ fontSize: '1rem', color: C.mutedColor, margin: 0 }}>Rejoignez notre communauté d'artisanat premium.</p>
          </div>

          {/* Toggle */}
          <div style={{ padding: '0.25rem', backgroundColor: C.toggleBg, borderRadius: '0.75rem', display: 'flex', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: C.activeBg, boxShadow: '0 1px 3px rgba(0,0,0,0.3)', color: C.white, fontWeight: 600, fontSize: '0.875rem', cursor: 'default' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>person</span>
              Client
            </div>
            <Link to="/register/worker" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: C.mutedColor, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseOver={e => e.currentTarget.style.color = C.white}
              onMouseOut={e => e.currentTarget.style.color = C.mutedColor}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>handyman</span>
              Professionnel
            </Link>
          </div>

          {error && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '0.5rem', color: '#fca5a5', fontSize: '0.875rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {[
              { key: 'nom',       label: 'Nom complet',         icon: 'badge', type: 'text',  ph: 'Nom Prénom',               req: true  },
              { key: 'email',     label: 'Adresse email',       icon: 'mail',  type: 'email', ph: 'votreemail@example.com',   req: true  },
              { key: 'telephone', label: 'Numéro de téléphone', icon: 'call',  type: 'tel',   ph: '+212 6 00 00 00 00',        req: false },
            ].map(({ key, label, icon, type, ph, req }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: C.labelColor, marginBottom: '0.25rem' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: C.mutedColor, fontSize: '1.25rem', pointerEvents: 'none' }}>{icon}</span>
                  <input type={type} required={req} placeholder={ph} style={inputStyle} value={formData[key]}
                    onFocus={e => e.target.style.borderColor = C.copper}
                    onBlur={e => e.target.style.borderColor = C.inputBorder}
                    onChange={set(key)} />
                </div>
              </div>
            ))}

            {/* Mot de passe */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: C.labelColor, marginBottom: '0.25rem' }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: C.mutedColor, fontSize: '1.25rem', pointerEvents: 'none' }}>lock</span>
                <input type={showPwd ? 'text' : 'password'} required placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '2.75rem' }} value={formData.mot_de_passe}
                  onFocus={e => e.target.style.borderColor = C.copper}
                  onBlur={e => e.target.style.borderColor = C.inputBorder}
                  onChange={set('mot_de_passe')} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.mutedColor, padding: 0, lineHeight: 0, zIndex: 2 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Conditions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: C.copper, flexShrink: 0, cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: '0.875rem', color: C.mutedColor, cursor: 'pointer' }}>
                J'accepte les <a href="#" style={{ color: C.copper, fontWeight: 600, textDecoration: 'none' }}>Conditions d'utilisation</a> et la <a href="#" style={{ color: C.copper, fontWeight: 600, textDecoration: 'none' }}>Politique de confidentialité</a>.
              </label>
            </div>

            <button type="submit" disabled={loading}
              style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', padding: '1rem 1.5rem', borderRadius: '0.5rem', backgroundColor: C.copper, color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: C.mutedColor }}>
            Déjà membre ?{' '}
            <Link to="/login/client" style={{ color: C.copper, fontWeight: 700, textDecoration: 'none', marginLeft: '0.25rem' }}>Se connecter ici</Link>
          </p>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            {[
              'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
              'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
            ].map((d, i) => (
              <a key={i} href="#" style={{ color: C.mutedColor, transition: 'color 0.15s', lineHeight: 0 }}
                onMouseOver={e => e.currentTarget.style.color = C.copper}
                onMouseOut={e => e.currentTarget.style.color = C.mutedColor}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d={d} /></svg>
              </a>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        /* ── Desktop lg+ ── */
        @media(min-width:1024px){ .lg-left{ display:flex !important; } }

        /* Logo mobile : visible seulement quand le panneau gauche est caché */
        @media (max-width: 1023px) {
          .mobile-logo { display: flex !important; }
        }

        /* ══ iPad Pro / Nest Hub Max / Surface Pro 7 (≤ 1024px) ══ */
        @media (max-width: 1024px) {
          .form-panel { padding: 3rem 3.5rem !important; }
        }

        /* ══ iPad Air / Asus Zenbook Fold (≤ 853px) ══ */
        @media (max-width: 853px) {
          .form-panel { padding: 2.5rem 2.5rem !important; }
        }

        /* ══ iPad Mini / Tablettes (≤ 768px) ══ */
        @media (max-width: 768px) {
          .form-panel { padding: 2.5rem 2rem !important; }
        }

        /* ══ Surface Duo / Galaxy Z Fold 5 déplié (≤ 653px) ══ */
        @media (max-width: 653px) {
          .form-panel { padding: 2rem 1.75rem !important; }
        }

        /* ══ Surface Duo (≤ 540px) ══ */
        @media (max-width: 540px) {
          .form-panel { padding: 2rem 1.5rem !important; }
        }

        /* ══ iPhone 14 Pro Max / Pixel 7 / S20 Ultra / A51/71 (≤ 430px) ══ */
        @media (max-width: 430px) {
          .form-panel { padding: 1.75rem 1.25rem !important; }
        }

        /* ══ iPhone 12 Pro / Pixel 7 / Galaxy S8+ (≤ 412px) ══ */
        @media (max-width: 412px) {
          .form-panel { padding: 1.5rem 1.1rem !important; }
        }

        /* ══ iPhone SE / Galaxy S8+ (≤ 375px) ══ */
        @media (max-width: 375px) {
          .form-panel { padding: 1.25rem 1rem !important; }
        }

        /* ══ Galaxy Z Fold 5 plié / très petits écrans (≤ 344px) ══ */
        @media (max-width: 344px) {
          .form-panel { padding: 1rem 0.75rem !important; }
        }

        input::placeholder { color: #64748b !important; }
        input::-ms-reveal, input::-ms-clear,
        input::-webkit-credentials-auto-fill-button { display: none !important; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(15,23,42,0.6) inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}