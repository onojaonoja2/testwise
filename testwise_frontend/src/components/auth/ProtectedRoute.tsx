import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is at the root dashboard, redirect based on role
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
    const defaultRoute = user?.role === 'Test Creator' ? '/dashboard/tests' : '/dashboard/available-tests';
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}