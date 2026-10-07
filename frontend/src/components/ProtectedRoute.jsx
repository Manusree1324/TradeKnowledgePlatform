import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="page-shell"><p className="loading-line">Checking your session…</p></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children || <Outlet />;
}