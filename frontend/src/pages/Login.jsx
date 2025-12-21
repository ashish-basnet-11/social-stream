import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Snowfall from 'react-snowfall'
import loginIllustration from '../assets/login.svg';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'auth_failed') {
      setError('Google sign-in failed. Please try again.');
    } else if (oauthError === 'server_error') {
      setError('Server error during sign-in. Please try again.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      navigate('/');
    } else {
      if (result.requiresVerification) {
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    authAPI.googleLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <Snowfall color='#C7D2FE' /> {/* Indigo-tinted snow */}

      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-[32px] shadow-2xl shadow-slate-200 overflow-hidden min-h-[700px] border border-slate-100">

        {/* LEFT SIDE: Illustration Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-50 p-12 flex-col justify-between relative overflow-hidden">
          <div>
            {/* BRANDING MATCHED TO SIDEBAR */}
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl rotate-3 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                <span className="text-white font-black text-xl -rotate-3">S</span>
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
                Stream<span className="text-indigo-600">.</span>
              </h1>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.1]">
              Connect with <br />
              <span className="text-indigo-600">the network.</span>
            </h2>
            <div className="w-full flex flex-col items-center">
              <img
                src={loginIllustration}
                alt="Login Illustration"
                className="w-full max-w-md object-contain drop-shadow-2xl"
              />
              <a
                href="https://storyset.com/internet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-8 opacity-50 hover:opacity-100 transition-opacity"
              >
                Illustrations by Storyset
              </a>
            </div>
          </div>

          {/* Indigo Decorative Element */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-100 rounded-full filter blur-[100px] opacity-40 -z-0"></div>
        </div>

        {/* RIGHT SIDE: Login Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                Welcome back
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Please enter your details to sign in.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4">
                  <p className="text-sm font-bold text-rose-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all sm:text-sm"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-2xl text-white bg-slate-900 hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="px-4 bg-white text-slate-400">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 border border-slate-100 rounded-2xl bg-white text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In With Google
              </button>

              <p className="mt-8 text-center text-xs font-bold text-slate-500 uppercase tracking-tight">
                New to the platform?{' '}
                <Link to="/register" className="text-indigo-600 hover:underline">
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;