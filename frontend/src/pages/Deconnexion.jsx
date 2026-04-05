import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

export default function Deconnexion() {
  const navigate  = useNavigate();
  const [count, setCount] = useState(3);

  /* Compte à rebours 3s puis redirige vers l'accueil */
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(interval); navigate('/'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F5F2EC', fontFamily: 'Inter, sans-serif', padding: '2rem',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
        <img src={logo} alt="logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10 }} />
        <span style={{ color: '#b87332', fontWeight: 900, fontSize: '1.3rem' }}>Bricolage Connect</span>
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '3rem 2.5rem',
        textAlign: 'center', maxWidth: '420px', width: '100%', border: '1px solid #f1f5f9',
      }}>
        {/* Icône succès */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', backgroundColor: '#dcfce7',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#15803d' }}>
            check_circle
          </span>
        </div>

        {/* Badge succès */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>check</span>
          Déconnexion réussie
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.75rem 0' }}>
          Vous êtes déconnecté
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 0.5rem 0', lineHeight: 1.6 }}>
          Votre session a été fermée avec succès.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 2rem 0' }}>
          Redirection vers l'accueil dans <strong style={{ color: '#b87332' }}>{count}</strong> seconde{count > 1 ? 's' : ''}...
        </p>

        {/* Barre de progression */}
        <div style={{ height: 4, backgroundColor: '#f1f5f9', borderRadius: '999px', marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{
            height: '100%', backgroundColor: '#b87332', borderRadius: '999px',
            width: `${((3 - count) / 3) * 100}%`, transition: 'width 0.9s linear',
          }} />
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/" style={{
            padding: '0.875rem 2rem', backgroundColor: '#b87332', color: 'white',
            borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem',
            textDecoration: 'none', display: 'block',
            boxShadow: '0 4px 12px rgba(184,115,50,0.25)',
          }}>
            Retour à l'accueil
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login/client" style={{
              flex: 1, padding: '0.75rem', backgroundColor: '#2F3E34', color: 'white',
              borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem',
              textDecoration: 'none', display: 'block', textAlign: 'center',
            }}>Espace Client</Link>
            <Link to="/login/worker" style={{
              flex: 1, padding: '0.75rem', backgroundColor: 'transparent', color: '#2F3E34',
              borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem',
              textDecoration: 'none', display: 'block', textAlign: 'center',
              border: '1.5px solid #2F3E34',
            }}>Espace Pro</Link>
          </div>
        </div>
      </div>
    </div>
  );
}