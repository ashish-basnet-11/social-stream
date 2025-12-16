// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      // Loading screen uses the dark background and teal spinner
      <div className="min-h-screen flex items-center justify-center bg-gray-900" style={{ backgroundImage: 'radial-gradient(at 0% 0%, #2a3854 0%, #171923 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  // ... Logic REMAINS ...
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;