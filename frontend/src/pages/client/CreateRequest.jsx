import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

/* ══════════════════════════════════════════
   Calendrier élégant custom
══════════════════════════════════════════ */
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

function Calendar({ value, onChange, onClose }) {
  const today = new Date();
  const initDate = value ? new Date(value) : today;
  const [year, setYear]   = useState(initDate.getFullYear());
  const [month, setMonth] = useState(initDate.getMonth());

  const firstDay = new Date(year, month, 1).getDay(); // 0=dim
  const offset   = firstDay === 0 ? 6 : firstDay - 1; // adjust to Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const selectedStr = value || '';
  const todayStr    = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const isPast  = (d) => dateStr(d) < todayStr;

  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, zIndex: 100,
      backgroundColor: '#ffffff', borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)', padding: '1.25rem',
      width: '300px', fontFamily: 'Inter, sans-serif',
      border: '1px solid #f1f5f9',
    }}>

      {/* Header mois/année */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button type="button" onClick={prevMonth}
          style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chevron_left</span>
        </button>
        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
          {MOIS[month]} {year}
        </span>
        <button type="button" onClick={nextMonth}
          style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chevron_right</span>
        </button>
      </div>

      {/* Jours de la semaine */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
        {JOURS.map(j => (
          <div key={j} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', padding: '0.25rem 0' }}>{j}</div>
        ))}
      </div>

      {/* Grille des jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const ds       = dateStr(d);
          const isToday  = ds === todayStr;
          const isSelected = ds === selectedStr;
          const past     = isPast(d);

          return (
            <button key={ds} type="button"
              disabled={past}
              onClick={() => { onChange(ds); onClose(); }}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: '8px', border: 'none',
                cursor: past ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', fontWeight: isSelected || isToday ? 700 : 400,
                backgroundColor: isSelected ? '#b87332' : isToday ? 'rgba(184,115,50,0.12)' : 'transparent',
                color: isSelected ? 'white' : past ? '#cbd5e1' : isToday ? '#b87332' : '#1e293b',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { if (!isSelected && !past) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseOut={e => { if (!isSelected && !past) e.currentTarget.style.backgroundColor = isToday ? 'rgba(184,115,50,0.12)' : 'transparent'; }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Boutons bas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
        <button type="button" onClick={() => { onChange(''); onClose(); }}
          style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
          Effacer
        </button>
        <button type="button" onClick={() => { onChange(todayStr); onClose(); }}
          style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b87332', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
          Aujourd'hui
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Page CreateRequest
══════════════════════════════════════════ */
export default function CreateRequest() {
  const [form, setForm] = useState({
    titre: '', description: '', ville: '', budget: '', date_service: '', id_specialite: ''
  });
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const calRef   = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/specialites')
      .then(res => setSpecialites(res.data))
      .catch(() => setSpecialites([
        { id: 1, nom: 'Plomberie' }, { id: 2, nom: 'Électricité' },
        { id: 3, nom: 'Menuiserie' }, { id: 4, nom: 'Peinture' },
        { id: 5, nom: 'Nettoyage' }, { id: 6, nom: 'Climatisation' },
      ]));
  }, []);

  /* Ferme le calendrier si clic dehors */
  useEffect(() => {
    const handler = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre || !form.ville || !form.budget) return setError('Titre, ville et budget sont obligatoires.');
    setLoading(true); setError('');
    try {
      await api.post('/services', form);
      setSuccess(true);
      setTimeout(() => navigate('/client/requests'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  /* Formate la date pour l'affichage */
  const formatDate = (str) => {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  };

  const inputStyle = {
    display: 'block', width: '100%', padding: '0.8rem 1rem',
    borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter, sans-serif',
    backgroundColor: '#ffffff', color: '#1e293b', boxSizing: 'border-box', transition: 'border-color 0.2s'
  };
  const iconInputStyle = { ...inputStyle, paddingLeft: '2.75rem' };

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#22c55e' }}>check_circle</span>
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Annonce créée !</h2>
      <p style={{ color: '#64748b' }}>Redirection vers vos demandes...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Nouvelle demande de service</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Décrivez votre besoin pour recevoir des propositions de professionnels.</p>
        </div>

        {error && <div style={{ padding: '0.875rem 1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Titre */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Titre de la demande *</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}>title</span>
              <input type="text" required placeholder="Ex: Réparation fuite plomberie cuisine"
                style={iconInputStyle} value={form.titre}
                onFocus={e => e.target.style.borderColor = '#b87332'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                onChange={e => setForm({ ...form, titre: e.target.value })} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Description détaillée</label>
            <textarea placeholder="Décrivez le problème, la surface, les matériaux, vos attentes..."
              rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              value={form.description}
              onFocus={e => e.target.style.borderColor = '#b87332'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Spécialité + Ville */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Spécialité</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}>handyman</span>
                <select style={{ ...iconInputStyle, appearance: 'none' }} value={form.id_specialite}
                  onFocus={e => e.target.style.borderColor = '#b87332'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  onChange={e => setForm({ ...form, id_specialite: e.target.value })}>
                  <option value="">Toutes spécialités</option>
                  {specialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem', pointerEvents: 'none' }}>expand_more</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Ville *</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}>location_on</span>
                <input type="text" required placeholder="Ex: Casablanca"
                  style={iconInputStyle} value={form.ville}
                  onFocus={e => e.target.style.borderColor = '#b87332'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  onChange={e => setForm({ ...form, ville: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Budget + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Budget (MAD) *</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}>payments</span>
                <input type="number" required placeholder="500" min="0"
                  style={iconInputStyle} value={form.budget}
                  onFocus={e => e.target.style.borderColor = '#b87332'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  onChange={e => setForm({ ...form, budget: e.target.value })} />
              </div>
            </div>

            {/* ✅ Date avec calendrier custom élégant */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Date souhaitée</label>
              <div ref={calRef} style={{ position: 'relative' }}>
                {/* Champ cliquable */}
                <div
                  onClick={() => setShowCal(v => !v)}
                  style={{
                    ...iconInputStyle,
                    display: 'flex', alignItems: 'center', cursor: 'pointer',
                    borderColor: showCal ? '#b87332' : '#e2e8f0',
                    userSelect: 'none',
                    paddingRight: '2.75rem',
                  }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', color: '#94a3b8', fontSize: '1.1rem' }}>calendar_today</span>
                  <span style={{ marginLeft: '1.75rem', color: form.date_service ? '#1e293b' : '#94a3b8', fontSize: '0.875rem' }}>
                    {form.date_service ? formatDate(form.date_service) : 'jj/mm/aaaa'}
                  </span>
                  {form.date_service && (
                    <span
                      className="material-symbols-outlined"
                      onClick={e => { e.stopPropagation(); setForm({ ...form, date_service: '' }); }}
                      style={{ position: 'absolute', right: '0.875rem', color: '#94a3b8', fontSize: '1rem', cursor: 'pointer' }}>
                      close
                    </span>
                  )}
                </div>

                {/* Calendrier */}
                {showCal && (
                  <Calendar
                    value={form.date_service}
                    onChange={d => setForm({ ...form, date_service: d })}
                    onClose={() => setShowCal(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => navigate('/client/requests')}
              style={{ flex: 1, padding: '0.875rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: '0.875rem', borderRadius: '10px', backgroundColor: loading ? '#d4a46a' : '#b87332', color: 'white', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(184,115,50,0.25)' }}>
              {loading ? 'Création...' : 'Publier la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}