// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    // REVAMP: Dark background, slight shadow, fixed position
    <nav className="bg-gray-800 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo: Teal accent color */}
            <Link to="/" className="text-2xl font-extrabold tracking-widest text-teal-400">
              SOCIAL STREAM
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User name: White text */}
            <span className="text-gray-200 text-sm hidden sm:block">
              Welcome, <span className="font-semibold text-white">{user?.name}</span>
            </span>
            {/* Logout button: High-contrast red button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;