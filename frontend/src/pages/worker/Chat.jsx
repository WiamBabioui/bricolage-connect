import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { io } from 'socket.io-client';

export default function Chat() {
  const { id: otherId }           = useParams();
  const { user }                  = useAuth();
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping]   = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const endRef    = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    socketRef.current = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current.on('connect', () => {
      setConnected(true);
      socketRef.current.emit('join', String(user.id));
    });
    socketRef.current.on('receive_message', (data) => {
      setMessages(prev => [...prev, {
        id_expediteur: String(data.from),
        message: data.message,
        date_envoi: new Date().toISOString(),
      }]);
    });
    socketRef.current.on('user_typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    api.get(`/messages/${otherId}`)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]));

    api.get(`/utilisateurs/${otherId}`)
      .then(res => setOtherUser(res.data))
      .catch(() => setOtherUser({ nom: 'Utilisateur' }));

    return () => { socketRef.current?.disconnect(); setConnected(false); };
  }, [otherId, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msgText = text.trim();
    setText('');
    setMessages(prev => [...prev, {
      id_expediteur: String(user?.id),
      message: msgText,
      date_envoi: new Date().toISOString(),
    }]);
    socketRef.current?.emit('send_message', {
      from: String(user?.id),
      to: String(otherId),
      message: msgText,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    else socketRef.current?.emit('typing', { from: String(user?.id), to: String(otherId) });
  };

  const isMe  = (msg) => String(msg.id_expediteur) === String(user?.id);
  const fTime = (d)   => d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ── */}
      <div className="chat-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#ffffff' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#2F3E34', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
          {(otherUser?.nom || '?')[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {otherUser?.nom || 'Chargement...'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: connected ? '#22c55e' : '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
            {isTyping ? "En train d'écrire..." : connected ? 'En ligne' : 'Connexion...'}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className="chat-btn" style={{ padding: '0.5rem 1rem', backgroundColor: '#2F3E34', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>call</span>
            <span className="chat-btn-label">Appel</span>
          </button>
          <button className="chat-btn" style={{ padding: '0.5rem 1rem', backgroundColor: '#2F3E34', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>videocam</span>
            <span className="chat-btn-label">Vidéo</span>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>chat_bubble_outline</span>
            Commencez la conversation !
          </div>
        ) : messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: isMe(msg) ? 'flex-end' : 'flex-start' }}>
            <div className="chat-bubble-wrap">
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: isMe(msg) ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: isMe(msg) ? '#ffffff' : '#2F3E34',
                color:           isMe(msg) ? '#1e293b'  : '#F5F2EC',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                fontSize: '0.9rem', lineHeight: 1.5,
                border: isMe(msg) ? '1px solid #e2e8f0' : 'none'
              }}>
                {msg.message}
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.2rem 0.5rem 0', textAlign: isMe(msg) ? 'right' : 'left' }}>
                {fTime(msg.date_envoi)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#2F3E34', borderRadius: '18px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0,1,2].map(j => (
                  <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#F5F2EC', display: 'inline-block', animation: `bounce 0.8s ${j * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Input ── */}
      <div className="chat-input-bar" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <button style={{ padding: '0.6rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: '8px', flexShrink: 0 }}>
          <span className="material-symbols-outlined">attach_file</span>
        </button>
        <div style={{ flex: 1 }}>
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Écrire un message... (Entrée pour envoyer)" rows={1}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'none', backgroundColor: '#f8fafc', color: '#1e293b', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#2F3E34'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>
        <button onClick={sendMessage} disabled={!text.trim()}
          style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: text.trim() ? '#2F3E34' : '#e2e8f0', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text.trim() ? 'white' : '#94a3b8', transition: 'all 0.2s', flexShrink: 0 }}>
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

        /* Bulle max-width par défaut */
        .chat-bubble-wrap { max-width: 65%; }

        /* ══ iPad Pro / Surface Pro 7 / Nest Hub (≤ 1024px) ══ */
        @media (max-width: 1024px) {
          .chat-header     { padding: 1rem 1.25rem !important; }
          .chat-messages   { padding: 1.25rem !important; }
          .chat-input-bar  { padding: 0.875rem 1.25rem !important; }
          .chat-bubble-wrap{ max-width: 70%; }
        }

        /* ══ iPad Air / Asus Zenbook Fold (≤ 853px) ══ */
        @media (max-width: 853px) {
          .chat-bubble-wrap { max-width: 75%; }
        }

        /* ══ iPad Mini / Tablettes (≤ 768px) ══ */
        @media (max-width: 768px) {
          .chat-header    { padding: 0.875rem 1rem !important; gap: 0.75rem !important; }
          .chat-messages  { padding: 1rem !important; }
          .chat-input-bar { padding: 0.75rem 1rem !important; gap: 0.5rem !important; }
          .chat-bubble-wrap{ max-width: 78%; }
        }

        /* ══ Galaxy Z Fold 5 déplié / Surface Duo (≤ 653px) ══ */
        @media (max-width: 653px) {
          .chat-bubble-wrap { max-width: 82%; }
        }

        /* ══ Surface Duo (≤ 540px) ══ */
        @media (max-width: 540px) {
          .chat-bubble-wrap { max-width: 85%; }
        }

        /* ══ iPhone 14 Pro Max / Pixel 7 / S20 Ultra (≤ 430px) ══ */
        @media (max-width: 430px) {
          .chat-header    { padding: 0.75rem 0.875rem !important; }
          .chat-messages  { padding: 0.875rem !important; }
          .chat-input-bar { padding: 0.625rem 0.875rem !important; }
          .chat-bubble-wrap{ max-width: 88%; }
          /* Boutons header : icône seulement */
          .chat-btn       { padding: 0.5rem !important; }
          .chat-btn-label { display: none !important; }
        }

        /* ══ iPhone 12 Pro / Galaxy S8+ (≤ 412px) ══ */
        @media (max-width: 412px) {
          .chat-bubble-wrap { max-width: 90%; }
        }

        /* ══ iPhone SE (≤ 375px) ══ */
        @media (max-width: 375px) {
          .chat-header    { padding: 0.625rem 0.75rem !important; gap: 0.5rem !important; }
          .chat-messages  { padding: 0.75rem !important; gap: 0.5rem !important; }
          .chat-input-bar { padding: 0.5rem 0.75rem !important; gap: 0.35rem !important; }
          .chat-bubble-wrap{ max-width: 92%; }
        }

        /* ══ Galaxy Z Fold 5 plié / très petits écrans (≤ 344px) ══ */
        @media (max-width: 344px) {
          .chat-bubble-wrap { max-width: 95%; }
          .chat-messages  { padding: 0.625rem !important; }
        }
      `}</style>
    </div>
  );
}