// frontend/src/pages/OAuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        // Get user data from backend
        const response = await authAPI.getOAuthUser();
        
        if (response.data.status === 'success') {
          // Refresh auth state
          await checkAuth();
          // Redirect to home
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('OAuth success error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleOAuthSuccess();
  }, [navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;