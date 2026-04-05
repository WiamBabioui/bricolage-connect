import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ✅ PwdField DEHORS du composant — évite le remontage à chaque frappe */
function PwdField({ label, value, onChange, show, onToggle, inputStyle }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}>
          lock
        </span>
        <input
          type={show ? 'text' : 'password'}
          required
          placeholder="••••••••"
          style={{ ...inputStyle, paddingRight: '2.75rem' }}
          value={value}
          onChange={onChange}
          onFocus={e => e.target.style.borderColor = '#b87332'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, lineHeight: 0 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function ClientProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nom: '', email: '', telephone: '', ville: '' });
  const [pwd, setPwd]   = useState({ ancien: '', nouveau: '', confirm: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCfm, setShowCfm] = useState(false);

  const [loading, setLoading]       = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [saved, setSaved]           = useState(false);
  const [pwdSaved, setPwdSaved]     = useState(false);
  const [error, setError]           = useState('');
  const [pwdError, setPwdError]     = useState('');

  useEffect(() => {
    if (user) setForm({
      nom:       user.nom       || '',
      email:     user.email     || '',
      telephone: user.telephone || '',
      ville:     user.ville     || '',
    });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSaved(false);
    try {
      await api.put('/utilisateurs/me', form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally { setLoading(false); }
  };

  const handlePwd = async (e) => {
    e.preventDefault();
    setPwdError(''); setPwdSaved(false);
    if (pwd.nouveau !== pwd.confirm) return setPwdError('Les mots de passe ne correspondent pas.');
    if (pwd.nouveau.length < 6) return setPwdError('Le mot de passe doit faire au moins 6 caractères.');
    setPwdLoading(true);
    try {
      await api.put('/utilisateurs/me/password', {
        ancien_mot_de_passe:  pwd.ancien,
        nouveau_mot_de_passe: pwd.nouveau,
      });
      setPwdSaved(true);
      setPwd({ ancien: '', nouveau: '', confirm: '' });
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (err) {
      setPwdError(err.response?.data?.error || 'Erreur lors du changement.');
    } finally { setPwdLoading(false); }
  };

  const inputStyle = {
    display: 'block', width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem',
    borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter, sans-serif',
    backgroundColor: '#ffffff', color: '#1e293b', boxSizing: 'border-box', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', padding: '2rem', overflowY: 'auto' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Mon profil</h1>
        <p style={{ color: '#64748b', margin: '0 0 2rem 0' }}>Gérez vos informations personnelles.</p>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1.5px solid #f1f5f9' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#b87332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.75rem' }}>
            {(user?.nom || 'C')[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{user?.nom}</h2>
            <span style={{ padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(184,115,50,0.1)', color: '#b87332', fontSize: '0.75rem', fontWeight: 700 }}>Client</span>
          </div>
        </div>

        {/* Messages */}
        {saved  && <div style={{ padding: '0.875rem', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', color: '#15803d', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>✅ Profil mis à jour !</div>}
        {error  && <div style={{ padding: '0.875rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</div>}

        {/* ── Formulaire infos ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
          {[
            { key: 'nom',       label: 'Nom complet',   type: 'text',  icon: 'badge',       placeholder: 'Nom Prénom' },
            { key: 'email',     label: 'Email',          type: 'email', icon: 'mail',        placeholder: 'votreemail@example.com' },
            { key: 'telephone', label: 'Téléphone',      type: 'tel',   icon: 'call',        placeholder: '+212 6 00 00 00 00' },
            { key: 'ville',     label: 'Ville',          type: 'text',  icon: 'location_on', placeholder: 'Casablanca' },
          ].map(({ key, label, type, icon, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}>{icon}</span>
                <input type={type} placeholder={placeholder} style={inputStyle} value={form[key]}
                  onFocus={e => e.target.style.borderColor = '#b87332'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            </div>
          ))}

          <button type="submit" disabled={loading}
            style={{ padding: '0.875rem', borderRadius: '10px', backgroundColor: loading ? '#d4a46a' : '#b87332', color: 'white', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(184,115,50,0.25)' }}>
            {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
          </button>
        </form>

        {/* ── Changer mot de passe ── */}
        <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: 'rgba(184,115,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#b87332', fontSize: '1.1rem' }}>lock</span>
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Changer le mot de passe</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Modifiez votre mot de passe de connexion</p>
            </div>
          </div>

          {pwdSaved && <div style={{ padding: '0.875rem', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', color: '#15803d', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600 }}>✅ Mot de passe modifié avec succès !</div>}
          {pwdError && <div style={{ padding: '0.875rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{pwdError}</div>}

          <form onSubmit={handlePwd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <PwdField
              label="Ancien mot de passe"
              value={pwd.ancien}
              onChange={e => setPwd(p => ({ ...p, ancien: e.target.value }))}
              show={showOld}
              onToggle={() => setShowOld(v => !v)}
              inputStyle={inputStyle}
            />
            <PwdField
              label="Nouveau mot de passe"
              value={pwd.nouveau}
              onChange={e => setPwd(p => ({ ...p, nouveau: e.target.value }))}
              show={showNew}
              onToggle={() => setShowNew(v => !v)}
              inputStyle={inputStyle}
            />
            <PwdField
              label="Confirmer nouveau mot de passe"
              value={pwd.confirm}
              onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
              show={showCfm}
              onToggle={() => setShowCfm(v => !v)}
              inputStyle={inputStyle}
            />

            <button type="submit" disabled={pwdLoading}
              style={{ padding: '0.875rem', borderRadius: '10px', backgroundColor: pwdLoading ? '#4a6057' : '#2F3E34', color: 'white', fontWeight: 700, border: 'none', cursor: pwdLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(47,62,52,0.2)' }}>
              {pwdLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>

        <style>{`input::-ms-reveal, input::-ms-clear { display: none !important; }`}</style>
      </div>
    </div>
  );
}