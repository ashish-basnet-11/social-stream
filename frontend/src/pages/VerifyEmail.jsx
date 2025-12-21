import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Snowfall from 'react-snowfall';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Security: Redirect if accessed without email state
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold uppercase tracking-widest text-slate-400">
        Unauthorized Access. Redirecting...
        {setTimeout(() => navigate('/register'), 2000)}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/verify-email`,
        { email, code },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMessage('');
    setResending(true);

    try {
      await axios.post(`${API_URL}/auth/resend-code`, { email });
      setSuccessMessage('Code resent! Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 relative">
      <Snowfall color='#C7D2FE' />
      
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 rotate-3">
             <span className="text-2xl font-black -rotate-3">@</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            Final Step<span className="text-indigo-600">.</span>
          </h2>
          <p className="mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            We sent a code to <br />
            <span className="text-slate-900">{email}</span>
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 animate-shake">
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest text-center">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-center">
              Enter 6-digit Code
            </label>
            <input
              type="text"
              required
              maxLength="6"
              className="w-full px-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black text-center text-3xl tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder-slate-200"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-4 px-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors py-2"
            >
              {resending ? 'Resending...' : "Didn't get it? Resend Code"}
            </button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <Link to="/register" className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors">
            Wrong email? Go back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;