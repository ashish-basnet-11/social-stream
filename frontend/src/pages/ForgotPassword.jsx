import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Snowfall from 'react-snowfall';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  // Step 1: Request Reset Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setMessage('If an account exists, a reset code has been sent.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { 
        email, 
        code, 
        newPassword 
      });
      navigate('/login', { state: { message: 'Password updated! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 relative">
      <Snowfall color='#C7D2FE' />
      
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            {step === 1 ? 'Reset Password' : 'New Credentials'}
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {step === 1 
              ? "Enter your email to receive a recovery code." 
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-tight">{error}</p>
          </div>
        )}

        {message && step === 2 && (
          <div className="mb-6 rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-tight">{message}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full py-4 px-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
            >
              {loading ? 'Sending...' : 'Send Recovery Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1 text-center">
                6-Digit Code
              </label>
              <input
                type="text"
                required
                maxLength="6"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength="6"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full py-4 px-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;