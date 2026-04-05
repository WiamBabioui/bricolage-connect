import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const home = user?.role === 'client' ? '/client/dashboard' : user?.role === 'travailleur' ? '/worker/dashboard' : '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '6rem', fontWeight: 900, color: '#b87332', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: '1rem 0 0.5rem 0' }}>Page introuvable</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '360px' }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link to={home} style={{ backgroundColor: '#b87332', color: 'white', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(184,115,50,0.3)' }}>
        Retour à l'accueil
      </Link>
    </div>
  );
}
