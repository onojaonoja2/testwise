import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If authenticated, redirect away from public pages (like login) to the dashboard.
  // Otherwise, render the public page.
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}