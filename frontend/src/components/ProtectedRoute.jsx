import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// 💡 Beginner Note: This component acts as a security guard for our routes.
// If you're not logged in, or don't have the right role, it kicks you back to login or your allowed dashboard.

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Not logged in -> Kick to login page
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role -> Kick to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'Admin': return <Navigate to="/admin" replace />;
      case 'Manager': return <Navigate to="/manager" replace />;
      case 'Staff': return <Navigate to="/staff" replace />;
      case 'Client': return <Navigate to="/client" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  // Good to go! Render the requested page
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
