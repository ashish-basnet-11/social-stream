// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    // --- START LOGIC (DO NOT CHANGE) ---
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
    // --- END LOGIC (DO NOT CHANGE) ---
  };

  return (
    // REVAMP 1: Dark, subtle radial gradient background
    <div className="min-h-screen flex items-center justify-center bg-gray-900" style={{ backgroundImage: 'radial-gradient(at 0% 0%, #2a3854 0%, #171923 100%)' }}>
      
      {/* REVAMP 2: Glassmorphism Card Style */}
      <div className="max-w-md w-full p-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl space-y-8">
        
        <div>
          {/* REVAMP 3: Bright, engaging headline for a dark theme */}
          <h2 className="mt-2 text-center text-4xl font-extrabold text-white tracking-wider">
            SOCIAL STREAM
          </h2>
          <p className="mt-4 text-center text-md text-gray-300 font-light">
            Sign in to share your thoughts with the world.
          </p>
          {/* NOTE: THE SIGN UP LINK IS REMOVED FROM HERE */}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            // Modern, slightly transparent error alert
            <div className="rounded-lg bg-red-800/70 p-4 border border-red-500 shadow-lg">
              <p className="text-sm font-medium text-white">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Input fields redesigned for dark card, glass effect */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              // REVAMP 4: High-contrast button with shadow and subtle scale on hover
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-xl text-gray-900 bg-teal-400 hover:bg-teal-300 shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] focus:ring-offset-gray-900"
            >
              {loading ? 'AUTHENTICATING...' : 'Login'}
            </button>
          </div>

          {/* MOVED PARAGRAPH: Now directly below the main button */}
          <p className="mt-2 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-teal-400 hover:text-teal-300 transition duration-150 ease-in-out hover:underline"
            >
              Register here
            </Link>
          </p>

        </form>
        
      </div>
    </div>
  );
};

export default Login;