import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const categories = [
  { name: 'Plomberie',   icon: 'plumbing'         },
  { name: 'Électricité', icon: 'bolt'              },
  { name: 'Menuiserie',  icon: 'carpenter'         },
  { name: 'Nettoyage',   icon: 'cleaning_services' },
  { name: 'Peinture',    icon: 'format_paint'      },
];

const steps = [
  { num: '01', icon: 'assignment',   title: 'Publiez votre annonce',      desc: "Décrivez votre besoin, votre budget et votre ville. C'est gratuit et rapide." },
  { num: '02', icon: 'person_search',title: 'Recevez des propositions',   desc: 'Des professionnels vérifiés de votre région vous contactent directement.' },
  { num: '03', icon: 'handshake',    title: 'Choisissez & travaillez',    desc: 'Comparez les profils, chattez et choisissez le professionnel idéal.' },
  { num: '04', icon: 'star',         title: 'Notez le service',           desc: 'Partagez votre expérience pour aider la communauté.' },
];

const stats = [
  { value: '5 000+',  label: 'Professionnels vérifiés' },
  { value: '12 000+', label: 'Projets réalisés'        },
  { value: '4.8 / 5', label: 'Note moyenne'            },
  { value: '48h',     label: 'Délai moyen de réponse'  },
];

const testimonials = [
  { name: 'Sophie L.', role: 'Cliente',                  text: "J'ai trouvé un plombier excellent en moins de 2 heures. Service impeccable, je recommande vivement !", stars: 5 },
  { name: 'Karim B.',  role: 'Électricien professionnel',text: "Grâce à Bricolage Connect, j'ai multiplié mes clients par 3 en un mois. Une plateforme vraiment professionnelle.", stars: 5 },
  { name: 'Marie D.',  role: 'Cliente',                  text: 'Rapide, fiable et transparent. Le chat avec le professionnel avant le rendez-vous est très rassurant.', stars: 5 },
];

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      <style>{`
        /* ── BASE desktop ── */
        .home-nav            { display: flex; gap: 2.5rem; }
        .home-nav-btn-group  { display: flex; gap: 0.75rem; }
        .home-header         { padding: 0.75rem 5rem; }
        .home-hero           { padding: 6rem 5rem; grid-template-columns: 1fr 1fr; gap: 4rem; }
        .home-hero-title     { font-size: 3.5rem; }
        .home-stats          { padding: 3rem 5rem; grid-template-columns: repeat(4, 1fr); }
        .home-categories-section { padding: 6rem 5rem; }
        .home-categories-grid    { grid-template-columns: repeat(5, 1fr); }
        .home-steps-section  { padding: 6rem 5rem; }
        .home-steps-grid     { grid-template-columns: repeat(4, 1fr); }
        .home-testimonials-section { padding: 6rem 5rem; }
        .home-testimonials-grid    { grid-template-columns: repeat(3, 1fr); }
        .home-cta-section    { padding: 6rem 5rem; }
        .home-footer         { padding: 3rem 5rem; }

        /* ══ iPad Pro / Nest Hub (≤ 1024px) ══ */
        @media (max-width: 1024px) {
          .home-header { padding: 0.75rem 2.5rem; }
          .home-nav    { gap: 1.25rem; }
          .home-hero   { padding: 4rem 2.5rem; gap: 2.5rem; }
          .home-hero-title { font-size: 2.75rem; }
          .home-stats  { padding: 2.5rem 2.5rem; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
          .home-categories-section { padding: 4.5rem 2.5rem; }
          .home-categories-grid    { grid-template-columns: repeat(3, 1fr); }
          .home-steps-section  { padding: 4.5rem 2.5rem; }
          .home-steps-grid     { grid-template-columns: repeat(2, 1fr); }
          .home-testimonials-section { padding: 4.5rem 2.5rem; }
          .home-testimonials-grid    { grid-template-columns: repeat(3, 1fr); }
          .home-cta-section    { padding: 4.5rem 2.5rem; }
          .home-footer         { padding: 2.5rem 2.5rem; }
        }

        /* ══ Surface Pro 7 (≤ 912px) ══ */
        @media (max-width: 912px) {
          .home-header { padding: 0.75rem 2rem; }
          .home-hero   { padding: 3.5rem 2rem; gap: 2rem; }
          .home-hero-title { font-size: 2.5rem; }
          .home-stats  { padding: 2rem 2rem; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
          .home-categories-section { padding: 4rem 2rem; }
          .home-categories-grid    { grid-template-columns: repeat(3, 1fr); }
          .home-steps-section  { padding: 4rem 2rem; }
          .home-steps-grid     { grid-template-columns: repeat(2, 1fr); }
          .home-testimonials-section { padding: 4rem 2rem; }
          .home-testimonials-grid    { grid-template-columns: repeat(2, 1fr); }
          .home-cta-section    { padding: 4rem 2rem; }
          .home-footer         { padding: 2rem 2rem; }
        }

        /* ══ iPad Air (≤ 853px) ══ */
        @media (max-width: 853px) {
          .home-nav { gap: 1rem; font-size: 0.8rem; }
          .home-hero-title { font-size: 2.25rem; }
          .home-categories-grid { grid-template-columns: repeat(3, 1fr); }
          .home-testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ══ iPad Mini / Mobile (≤ 768px) ══ */
        @media (max-width: 768px) {

          .home-header {
            padding: 1rem 1.25rem !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 0.75rem !important;
          }
          .home-header-brand { justify-content: center !important; }
          .home-nav { display: none; }
          
          /* ✅ MODIFICATION ICI : Boutons sur la même ligne et même largeur */
          .home-nav-btn-group {
            flex-direction: row !important; 
            width: 100% !important;
            max-width: 100% !important;
            gap: 0.5rem !important;
            display: flex !important;
          }
          .home-nav-btn-group a {
            flex: 1 !important; /* Force la même largeur */
            width: auto !important;
            min-width: unset !important;
            height: 44px !important;
            font-size: 0.8rem !important; /* Légèrement plus petit pour que ça tienne */
            justify-content: center !important;
            box-sizing: border-box !important;
            padding: 0 0.5rem !important;
            text-align: center;
          }

          .home-hero { padding: 3.5rem 1.5rem !important; grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .home-hero-title { font-size: 2.25rem !important; }
          .home-hero-cta { flex-direction: column; }
          .home-hero-cta a { text-align: center; }

          .home-stats { padding: 2rem 1.5rem; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }

          .home-categories-section { padding: 3.5rem 1.5rem; }
          .home-categories-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem !important; }

          .home-categories-grid > *:last-child:nth-child(odd) {
            grid-column: 1 / -1;
            width: calc(50% - 0.5rem);
            margin-inline: auto;
          }

          .home-steps-section  { padding: 3.5rem 1.5rem; }
          .home-steps-grid     { grid-template-columns: repeat(2, 1fr) !important; }

          .home-testimonials-section { padding: 3.5rem 1.5rem; }
          .home-testimonials-grid    { grid-template-columns: 1fr !important; }

          .home-cta-section    { padding: 3.5rem 1.5rem; }
          .home-cta-btns       { flex-direction: column; align-items: center; }
          .home-cta-btns a     { width: 100%; text-align: center; }

          .home-footer         { padding: 2rem 1.5rem; flex-direction: column; align-items: center; text-align: center; gap: 1rem; }
          .home-footer-links   { flex-wrap: wrap; justify-content: center; gap: 1rem !important; }
        }

        /* ══ Galaxy Z Fold 5 / Surface Duo (≤ 653px) ══ */
        @media (max-width: 653px) {
          .home-hero-title { font-size: 2rem !important; }
          .home-stats p:first-child { font-size: 1.85rem !important; }
          .home-categories-grid { grid-template-columns: repeat(2, 1fr); }
          .home-steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* ══ Surface Duo (≤ 540px) ══ */
        @media (max-width: 540px) {
          .home-hero   { padding: 2.75rem 1.25rem !important; }
          .home-hero-title { font-size: 1.9rem !important; }
          .home-steps-grid { grid-template-columns: 1fr !important; }
          .home-stats  { grid-template-columns: repeat(2, 1fr); padding: 1.75rem 1.25rem; }
        }

        /* ══ iPhone 14 Pro Max (≤ 430px) ══ */
        @media (max-width: 430px) {
          .home-hero-title { font-size: 1.875rem !important; }
          .home-categories-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.875rem !important; }
          .home-steps-grid { grid-template-columns: 1fr !important; }
          .home-stats      { grid-template-columns: repeat(2, 1fr) !important; padding: 1.5rem 1.25rem; }
          .home-stats p:first-child { font-size: 1.75rem !important; }
        }

        /* ══ iPhone 12 Pro (≤ 412px) ══ */
        @media (max-width: 412px) {
          .home-hero-title { font-size: 1.8rem !important; }
          .home-categories-section { padding: 2.5rem 1rem; }
          .home-steps-section      { padding: 2.5rem 1rem; }
          .home-testimonials-section { padding: 2.5rem 1rem; }
          .home-cta-section        { padding: 2.5rem 1rem; }
        }

        /* ══ iPhone SE (≤ 375px) ══ */
        @media (max-width: 375px) {
          .home-header { padding: 0.875rem 1rem !important; }
          .home-hero   { padding: 2.5rem 1rem !important; }
          .home-hero-title { font-size: 1.65rem !important; }
          .home-categories-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.75rem !important; }
          .home-stats p:first-child { font-size: 1.6rem !important; }
          .home-cta-section { padding: 2.5rem 1rem; }
          .home-footer      { padding: 1.75rem 1rem; }
        }

        /* ══ Galaxy Z Fold 5 plié (≤ 344px) ══ */
        @media (max-width: 344px) {
          .home-hero-title { font-size: 1.5rem !important; }
          .home-nav-btn-group { gap: 0.35rem !important; }
          .home-categories-grid { grid-template-columns: 1fr 1fr !important; gap: 0.625rem !important; }
          .home-stats { grid-template-columns: 1fr 1fr !important; gap: 0.75rem; }
          .home-stats p:first-child { font-size: 1.45rem !important; }
        }
      `}</style>

      {/* ════════ NAVBAR ════════ */}
      <header className="home-header" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: '#2F3E34', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="home-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src={logo} alt="logo" style={{ width: 50, height: 50, objectFit: 'contain', borderRadius: 8 }} />
          <span style={{ color: '#b87332', fontWeight: 900, fontSize: '1.2rem' }}>Bricolage Connect</span>
        </div>

        <nav className="home-nav">
          {[
            { label: 'Services',          id: 'services'          },
            { label: 'Comment ça marche', id: 'comment-ca-marche'  },
            { label: 'Tarifs',            id: 'tarifs'            },
            { label: 'À propos',          id: 'a-propos'          },
          ].map(({ label, id }) => (
            <a key={id} href={`#${id}`}
              onClick={e => { e.preventDefault(); scrollTo(id); }}
              style={{ color: '#f1f5f9', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color .2s', cursor: 'pointer' }}
              onMouseOver={e => e.target.style.color = '#b87332'}
              onMouseOut={e  => e.target.style.color = '#f1f5f9'}
            >{label}</a>
          ))}
        </nav>

        <div className="home-nav-btn-group">
          <Link to="/login/client" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 1.25rem', height: 42, minWidth: 130,
            backgroundColor: '#b87332', color: 'white', borderRadius: 8,
            fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#a0652a'}
          onMouseOut={e  => e.currentTarget.style.backgroundColor = '#b87332'}>
            Espace Client
          </Link>
          <Link to="/login/worker" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 1.25rem', height: 42, minWidth: 130,
            backgroundColor: 'transparent', color: 'white', borderRadius: 8,
            fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseOut={e  => e.currentTarget.style.backgroundColor = 'transparent'}>
            Espace Travailleur
          </Link>
        </div>
      </header>

      {/* ════════ HERO ════════ */}
      <section className="home-hero" style={{ backgroundColor: '#2F3E34', color: '#F5F2EC', display: 'grid', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 540 }}>
          <h1 className="home-hero-title" style={{ fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
            Connectez-vous avec des{' '}
            <span style={{ color: '#b87332' }}>Professionnels</span>{' '}
            de Confiance
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(245,242,236,0.75)', lineHeight: 1.7, margin: 0 }}>
            Trouvez des plombiers, électriciens, menuisiers et nettoyeurs fiables près de chez vous.
            Qualité professionnelle pour vos projets à domicile.
          </p>
          <div className="home-hero-cta" style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login/client" style={{ padding: '1rem 2rem', backgroundColor: '#b87332', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(184,115,50,0.3)', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = '#a0652a'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e  => { e.currentTarget.style.backgroundColor = '#b87332'; e.currentTarget.style.transform = 'none'; }}>
              Espace Client
            </Link>
            <Link to="/login/worker" style={{ padding: '1rem 2rem', backgroundColor: 'transparent', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e  => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'none'; }}>
              Espace Travailleur
            </Link>
          </div>
        </div>
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop" alt="Artisan" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, backdropFilter: 'blur(12px)', backgroundColor: 'rgba(47,62,52,0.7)', padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Ali M.</p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(245,242,236,0.75)', margin: 0 }}>Expert Menuisier • 10+ ans</p>
            </div>
            <span style={{ backgroundColor: 'rgba(184,115,50,0.9)', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>PRO VÉRIFIÉ</span>
          </div>
        </div>
      </section>

      {/* ════════ STATS ════════ */}
      <section style={{ backgroundColor: '#b87332' }}>
        <div className="home-stats" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: '2rem', textAlign: 'center' }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', margin: '0 0 0.25rem 0' }}>{value}</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ CATEGORIES ════════ */}
      <section id="services" className="home-categories-section" style={{ backgroundColor: '#E8E3D9' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', margin: '0 0 1rem 0' }}>Nos Catégories de Services</h2>
            <div style={{ width: 80, height: 4, backgroundColor: '#b87332', margin: '0 auto', borderRadius: 999 }} />
          </div>
          <div className="home-categories-grid" style={{ display: 'grid', gap: '1.5rem' }}>
            {categories.map((cat, i) => (
              <div key={i}
                style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', cursor: 'default', transition: 'all 0.3s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; }}
                onMouseOut={e  => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(184,115,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b87332' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.875rem' }}>{cat.icon}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b', margin: 0 }}>{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ COMMENT ÇA MARCHE ════════ */}
      <section id="comment-ca-marche" className="home-steps-section" style={{ backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', margin: '0 0 1rem 0' }}>Comment ça marche ?</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>4 étapes simples pour trouver votre professionnel idéal</p>
            <div style={{ width: 80, height: 4, backgroundColor: '#b87332', margin: '1rem auto 0', borderRadius: 999 }} />
          </div>
          <div className="home-steps-grid" style={{ display: 'grid', gap: '2rem' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '2rem 1.5rem', borderRadius: 16, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#b87332', color: 'white', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>{step.num}</div>
                <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'rgba(184,115,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#b87332' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>{step.icon}</span>
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.75rem 0', fontSize: '1rem' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TÉMOIGNAGES ════════ */}
      <section id="a-propos" className="home-testimonials-section" style={{ backgroundColor: '#2F3E34', color: '#F5F2EC' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Ce que disent nos utilisateurs</h2>
            <div style={{ width: 80, height: 4, backgroundColor: '#b87332', margin: '0 auto', borderRadius: 999 }} />
          </div>
          <div className="home-testimonials-grid" style={{ display: 'grid', gap: '2rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ marginBottom: '1rem' }}>{'★'.repeat(t.stars).split('').map((s, j) => <span key={j} style={{ color: '#b87332', fontSize: '1.2rem' }}>★</span>)}</div>
                <p style={{ color: 'rgba(245,242,236,0.85)', lineHeight: 1.7, margin: '0 0 1.5rem 0', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#b87332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{t.name[0]}</div>
                  <div>
                    <p style={{ fontWeight: 700, margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(245,242,236,0.55)', margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section id="tarifs" className="home-cta-section" style={{ backgroundColor: '#E8E3D9', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', margin: '0 0 1rem 0' }}>Prêt à démarrer votre projet ?</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>Rejoignez des milliers de clients satisfaits et trouvez le professionnel idéal pour votre projet.</p>
          <div className="home-cta-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register/client" style={{ padding: '1rem 2.5rem', backgroundColor: '#b87332', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(184,115,50,0.3)' }}>Je cherche un professionnel</Link>
            <Link to="/register/worker" style={{ padding: '1rem 2.5rem', backgroundColor: '#2F3E34', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>Je suis professionnel</Link>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ backgroundColor: '#1e2b23', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8' }}>
        <div className="home-footer" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={logo} alt="logo" style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 6 }} />
            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>Bricolage Connect</span>
          </div>
          <div className="home-footer-links" style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
            {["Conditions d'utilisation", "Confidentialité", "Contact"].map(link => (
              <a key={link} href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color .2s' }}
                onMouseOver={e => e.target.style.color = '#b87332'}
                onMouseOut={e  => e.target.style.color = '#94a3b8'}
              >{link}</a>
            ))}
          </div>
          <div style={{ fontSize: '0.875rem' }}>© 2026 Bricolage Connect. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}