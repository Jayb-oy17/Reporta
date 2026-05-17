import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { session, ready } = useAuth();
  // Wait for the async session load before deciding to redirect.
  if (!ready) return null;
  if (!session?.isLoggedIn) return <Navigate to="/login" replace />;
  if (role && session.role !== role) return <Navigate to="/login" replace />;
  return children;
}
