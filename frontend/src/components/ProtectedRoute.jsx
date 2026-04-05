import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex justify-center items-center text-sage text-xl font-bold">Loading Brilocage Connect...</div>;

    if (!user) return <Navigate to="/" replace />;  // ✅ FIX: était /login → 404

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}