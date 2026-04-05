import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',   /* ✅ overflow hidden SEULEMENT pour le dashboard */
      fontFamily: 'Inter, sans-serif',
    }}>
      <Outlet />
    </div>
  );
}