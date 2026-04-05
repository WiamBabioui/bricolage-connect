import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { io } from 'socket.io-client';

/* ── localStorage helpers ─────────────────────────────────
   On stocke le nombre de msgs de l'autre qu'on a déjà vus.
   Unread = total_from_other (backend) - seenCount (localStorage)
──────────────────────────────────────────────────────────── */
const seenKey  = (uid, oid) => `seenCount_${uid}_${oid}`;
const getUnread = (conv, uid) => {
  if (!conv || !uid) return 0;
  const total = parseInt(conv.total_from_other || 0, 10);
  const seen  = parseInt(localStorage.getItem(seenKey(uid, conv.other_id)) || '0', 10);
  return Math.max(0, total - seen);
};
const markRead = (conv, uid) => {
  if (!conv || !uid) return;
  localStorage.setItem(seenKey(uid, conv.other_id), String(conv.total_from_other || 0));
};

/* ══ ChatPanel ══ */
function ChatPanel({ conv, user, onBack }) {
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [connected, setConnected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [callModal, setCallModal]  = useState(''); // 'call' | 'video' | ''
  const socketRef = useRef(null);
  const endRef    = useRef(null);

  useEffect(() => {
    if (!conv?.other_id || !user?.id) return;
    socketRef.current = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current.on('connect', () => { setConnected(true); socketRef.current.emit('join', String(user.id)); });
    socketRef.current.on('receive_message', (data) => {
      setMessages(prev => [...prev, { id_expediteur: String(data.from), message: data.message, date_envoi: new Date().toISOString() }]);
    });
    socketRef.current.on('user_typing', () => { setIsTyping(true); setTimeout(() => setIsTyping(false), 2000); });
    api.get(`/messages/${conv.other_id}`).then(res => setMessages(res.data)).catch(() => setMessages([]));
    return () => { socketRef.current?.disconnect(); setConnected(false); };
  }, [conv?.other_id, user?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const emitAndAdd = (msg) => {
    setMessages(prev => [...prev, { id_expediteur: String(user?.id), message: msg, date_envoi: new Date().toISOString() }]);
    socketRef.current?.emit('send_message', { from: String(user?.id), to: String(conv.other_id), message: msg });
  };

  const sendMessage = () => { if (!text.trim()) return; emitAndAdd(text.trim()); setText(''); };

  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await api.post('/messages/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      emitAndAdd(`📎 ${res.data.url}`);
    } catch { alert("Erreur lors de l'envoi du fichier"); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    else socketRef.current?.emit('typing', { from: String(user?.id), to: String(conv.other_id) });
  };

  const isMe  = (msg) => String(msg.id_expediteur) === String(user?.id);
  const fTime = (d)   => d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

  const renderMsg = (msg) => {
    const t = msg.message || '';
    if (t.startsWith('📎 http')) {
      const url = t.replace('📎 ', '');
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return <img src={url} alt="img" style={{ maxWidth: 200, borderRadius: 8, display: 'block' }} />;
      return <a href={url} target="_blank" rel="noreferrer" style={{ color: isMe(msg) ? '#1e293b' : '#F5F2EC', textDecoration: 'underline' }}>📄 {url.split('/').pop()}</a>;
    }
    return t;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>

      {/* Header */}
      <div className="cp-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2F3E34', display: 'flex', alignItems: 'center', padding: 4, flexShrink: 0 }}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#2F3E34', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
          {(conv.other_nom || '?')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.other_nom}</h3>
          <p style={{ fontSize: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: connected ? '#22c55e' : '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
            {isTyping ? "En train d'écrire..." : connected ? 'En ligne' : 'Connexion...'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {[['call','Appel','call'], ['videocam','Vidéo','video']].map(([icon, label, type]) => (
            <button key={icon} onClick={() => setCallModal(type)} className="cp-call-btn"
              style={{ padding: '0.5rem 1rem', backgroundColor: '#2F3E34', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{icon}</span>
              <span className="cp-call-label">{label}</span>
            </button>
          ))}
        </div>

        {/* Modal appel/vidéo */}
        {callModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setCallModal('')}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', maxWidth: '360px', width: '90%', textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(47,62,52,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#2F3E34' }}>
                  {callModal === 'call' ? 'smartphone' : 'videocam'}
                </span>
              </div>
              <h3 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>
                {callModal === 'call' ? 'Appel vocal' : 'Appel vidéo'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>
                Cette fonctionnalité est disponible uniquement sur <strong style={{ color: '#2F3E34' }}>l'application mobile</strong> Bricolage Connect.
              </p>
              <button onClick={() => setCallModal('')}
                style={{ padding: '0.75rem 2rem', backgroundColor: '#2F3E34', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
                Compris
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="cp-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>chat_bubble_outline</span>
            Commencez la conversation !
          </div>
        ) : messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: isMe(msg) ? 'flex-end' : 'flex-start' }}>
            <div className="cp-bubble">
              <div style={{ padding: '0.75rem 1rem', borderRadius: isMe(msg) ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: isMe(msg) ? '#ffffff' : '#2F3E34', color: isMe(msg) ? '#1e293b' : '#F5F2EC', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', fontSize: '0.9rem', lineHeight: 1.5, border: isMe(msg) ? '1px solid #e2e8f0' : 'none' }}>
                {renderMsg(msg)}
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.2rem 0.5rem 0', textAlign: isMe(msg) ? 'right' : 'left' }}>{fTime(msg.date_envoi)}</p>
            </div>
          </div>
        ))}
        {isTyping && <div style={{ display: 'flex' }}><div style={{ padding: '0.75rem 1rem', backgroundColor: '#2F3E34', borderRadius: 18 }}><div style={{ display: 'flex', gap: 4 }}>{[0,1,2].map(j => <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#F5F2EC', display: 'inline-block', animation: `bounce 0.8s ${j*0.2}s infinite` }} />)}</div></div></div>}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="cp-input-bar" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexShrink: 0 }}>
        {['attach_file|image/*,.pdf,.doc,.docx', 'image|image/*'].map(s => {
          const [icon, accept] = s.split('|');
          return <label key={icon} style={{ padding: '0.6rem', cursor: uploading ? 'not-allowed' : 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined">{uploading && icon === 'attach_file' ? 'hourglass_empty' : icon}</span>
            <input type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} disabled={uploading} />
          </label>;
        })}
        <div style={{ flex: 1 }}>
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
            placeholder="Écrire un message..." rows={1}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'none', backgroundColor: '#f8fafc', color: '#1e293b', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#2F3E34'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
        <button onClick={sendMessage} disabled={!text.trim()}
          style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: text.trim() ? '#2F3E34' : '#e2e8f0', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text.trim() ? 'white' : '#94a3b8', transition: 'all 0.2s', flexShrink: 0 }}>
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

        /* Bulle par défaut */
        .cp-bubble { max-width: 65%; }

        /* ══ iPad Pro / Surface Pro 7 / Nest Hub (≤ 1024px) ══ */
        @media (max-width: 1024px) {
          .cp-header    { padding: 0.875rem 1.25rem !important; }
          .cp-messages  { padding: 1.25rem !important; }
          .cp-input-bar { padding: 0.875rem 1.25rem !important; }
          .cp-bubble    { max-width: 70%; }
        }

        /* ══ iPad Air / Asus Zenbook Fold (≤ 853px) ══ */
        @media (max-width: 853px) {
          .cp-bubble { max-width: 75%; }
        }

        /* ══ iPad Mini / Tablettes (≤ 768px) ══ */
        @media (max-width: 768px) {
          .cp-header    { padding: 0.75rem 1rem !important; gap: 0.75rem !important; }
          .cp-messages  { padding: 1rem !important; }
          .cp-input-bar { padding: 0.75rem 1rem !important; gap: 0.5rem !important; }
          .cp-bubble    { max-width: 78%; }
        }

        /* ══ Galaxy Z Fold 5 déplié / Surface Duo (≤ 653px) ══ */
        @media (max-width: 653px) {
          .cp-bubble { max-width: 82%; }
        }

        /* ══ Surface Duo (≤ 540px) ══ */
        @media (max-width: 540px) {
          .cp-bubble { max-width: 85%; }
        }

        /* ══ iPhone 14 Pro Max / Pixel 7 / S20 Ultra (≤ 430px) ══ */
        @media (max-width: 430px) {
          .cp-header    { padding: 0.75rem 0.875rem !important; }
          .cp-messages  { padding: 0.875rem !important; }
          .cp-input-bar { padding: 0.625rem 0.875rem !important; }
          .cp-bubble    { max-width: 88%; }
          /* Boutons appel/vidéo : icône seule */
          .cp-call-btn  { padding: 0.5rem !important; }
          .cp-call-label{ display: none !important; }
        }

        /* ══ iPhone 12 Pro / Galaxy S8+ (≤ 412px) ══ */
        @media (max-width: 412px) {
          .cp-bubble { max-width: 90%; }
        }

        /* ══ iPhone SE (≤ 375px) ══ */
        @media (max-width: 375px) {
          .cp-header    { padding: 0.625rem 0.75rem !important; gap: 0.5rem !important; }
          .cp-messages  { padding: 0.75rem !important; gap: 0.5rem !important; }
          .cp-input-bar { padding: 0.5rem 0.75rem !important; gap: 0.35rem !important; }
          .cp-bubble    { max-width: 92%; }
        }

        /* ══ Galaxy Z Fold 5 plié / très petits écrans (≤ 344px) ══ */
        @media (max-width: 344px) {
          .cp-messages  { padding: 0.625rem !important; }
          .cp-bubble    { max-width: 95%; }
        }
      `}</style>
    </div>
  );
}

/* ══ Page Messages ══ */
export default function Messages() {
  const { user }                          = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [tick, setTick]                   = useState(0);

  useEffect(() => {
    api.get('/messages/conversations')
      .then(res => setConversations(res.data))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter(c => !search || c.other_nom?.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (conv) => {
    markRead(conv, user?.id);
    setSelectedConv(conv);
    setTick(n => n + 1);
  };

  if (selectedConv) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#ffffff', zIndex: 10 }}>
        <ChatPanel conv={selectedConv} user={user} onBack={() => setSelectedConv(null)} />
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* Header liste */}
      <div className="msg-list-header" style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: '0 0 1rem 0' }}>Messages</h1>
        <div style={{ position: 'relative' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}>search</span>
          <input type="text" placeholder="Rechercher une conversation..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', boxSizing: 'border-box', color: '#1e293b' }}
            onFocus={e => e.target.style.borderColor = '#2F3E34'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
      </div>

      {/* Liste conversations */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#ffffff' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>hourglass_empty</span>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>chat_bubble_outline</span>
            <p style={{ fontWeight: 600, color: '#475569', margin: '0 0 0.5rem 0' }}>Aucune conversation</p>
            <p style={{ fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
              {user?.role === 'client' ? 'Contactez un professionnel pour commencer.' : 'Postulez à des jobs pour démarrer.'}
            </p>
            <Link to={user?.role === 'client' ? '/client/workers' : '/worker/jobs'}
              style={{ backgroundColor: '#2F3E34', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{user?.role === 'client' ? 'person_search' : 'work'}</span>
              {user?.role === 'client' ? 'Trouver un professionnel' : 'Voir les jobs'}
            </Link>
          </div>
        ) : filtered.map((conv, i) => {
          const unread    = getUnread(conv, user?.id);
          const hasUnread = unread > 0;

          return (
            <div key={conv.other_id || i}
              onClick={() => handleSelect(conv)}
              className="msg-conv-item"
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s', backgroundColor: hasUnread ? 'rgba(47,62,52,0.03)' : '#ffffff' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = hasUnread ? 'rgba(47,62,52,0.03)' : '#ffffff'}>

              <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#2F3E34', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                {(conv.other_nom || '?')[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <p style={{ fontWeight: hasUnread ? 800 : 700, color: '#1e293b', margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.other_nom}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                    {hasUnread && (
                      <span style={{ backgroundColor: '#15803d', color: 'white', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', minWidth: 20, textAlign: 'center' }}>
                        {unread}
                      </span>
                    )}
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                      {conv.date ? new Date(conv.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
                <p style={{ color: hasUnread ? '#475569' : '#94a3b8', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: hasUnread ? 600 : 400 }}>
                  {conv.last_message?.startsWith('📎') ? '📎 Fichier partagé' : conv.last_message || '...'}
                </p>
              </div>

              <span className="material-symbols-outlined" style={{ color: '#cbd5e1', fontSize: '1.1rem', flexShrink: 0 }}>chevron_right</span>
            </div>
          );
        })}
      </div>

      <style>{`
        /* ══ iPad Pro / Surface Pro 7 / Nest Hub (≤ 1024px) ══ */
        @media (max-width: 1024px) {
          .msg-list-header { padding: 1.25rem 1.25rem 0.875rem !important; }
          .msg-conv-item   { padding: 0.875rem 1.25rem !important; }
        }

        /* ══ iPad Mini / Tablettes (≤ 768px) ══ */
        @media (max-width: 768px) {
          .msg-list-header { padding: 1rem 1rem 0.75rem !important; }
          .msg-conv-item   { padding: 0.875rem 1rem !important; gap: 0.75rem !important; }
        }

        /* ══ iPhone 14 Pro Max / Pixel 7 / S20 Ultra (≤ 430px) ══ */
        @media (max-width: 430px) {
          .msg-list-header { padding: 0.875rem 0.875rem 0.625rem !important; }
          .msg-conv-item   { padding: 0.75rem 0.875rem !important; gap: 0.625rem !important; }
        }

        /* ══ iPhone SE (≤ 375px) ══ */
        @media (max-width: 375px) {
          .msg-list-header { padding: 0.75rem 0.75rem 0.5rem !important; }
          .msg-conv-item   { padding: 0.625rem 0.75rem !important; gap: 0.5rem !important; }
        }

        /* ══ Galaxy Z Fold 5 plié (≤ 344px) ══ */
        @media (max-width: 344px) {
          .msg-list-header { padding: 0.625rem 0.625rem 0.5rem !important; }
          .msg-conv-item   { padding: 0.5rem 0.625rem !important; }
        }
      `}</style>
    </div>
  );
}