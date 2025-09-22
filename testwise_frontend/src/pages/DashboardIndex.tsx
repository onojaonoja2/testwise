import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

// This component's only job is to redirect the user to the correct
// starting page based on their role.
export default function DashboardIndex() {
  const { user } = useAuth();

  // Check for Test Creator or Admin roles
  if (['Test Creator', 'Sub Admin', 'System Admin'].includes(user?.role || '')) {
    return <Navigate to="/dashboard/tests" replace />;
  }
  
  // Default to the Test Taker view
  return <Navigate to="/dashboard/available-tests" replace />;
}