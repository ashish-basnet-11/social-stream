// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- START LOGIC (DO NOT CHANGE) ---
    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    // --- END LOGIC (DO NOT CHANGE) ---
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900" style={{ backgroundImage: 'radial-gradient(at 0% 0%, #2a3854 0%, #171923 100%)' }}>
      
      <div className="max-w-md w-full p-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl space-y-8">
        
        {/* HEADING AND SUBTITLE REMAINS AT THE TOP */}
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-white tracking-wider">
            JOIN SOCIAL STREAM
          </h2>
          <p className="mt-4 text-center text-md text-gray-300 font-light">
            Start sharing your voice today.
          </p>
          {/* NOTE: THE LOGIN LINK IS REMOVED FROM HERE */}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-800/70 p-4 border border-red-500 shadow-lg">
              <p className="text-sm font-medium text-white">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Input 1: Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            {/* Input 2: Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            {/* Input 3: Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner"
                placeholder="•••••••• (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-xl text-gray-900 bg-teal-400 hover:bg-teal-300 shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] focus:ring-offset-gray-900"
            >
              {loading ? 'CREATING ACCOUNT...' : 'Register'}
            </button>
          </div>
          
          {/* MOVED PARAGRAPH: Now directly below the main button */}
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-semibold text-teal-400 hover:text-teal-300 transition duration-150 ease-in-out hover:underline"
            >
              Sign in
            </Link>
          </p>

        </form>
        
      </div>
    </div>
  );
};

export default Register;