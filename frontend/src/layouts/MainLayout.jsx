import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    // ✅ min-h-screen permet le scroll naturel de la page
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <Outlet />
    </div>
  );
}