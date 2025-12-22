import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Snowfall from 'react-snowfall';
import { ArrowLeft, ShieldCheck, Mail, KeyRound, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Verify Code, 3: New Password
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
      setMessage('Recovery code dispatched.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate Code (Logic-only step)
  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setError('');
    setStep(3); // Proceed to set new password
  };

  // Step 3: Final Reset
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
      navigate('/login', { state: { message: 'Identity secured. Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 relative font-sans">
      <Snowfall color='#C7D2FE' />
      
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-10 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-10 bg-indigo-500' : 'w-4 bg-slate-100'}`} 
            />
          ))}
        </div>

        <div className="mb-10 text-center">
          <div className="inline-flex p-4 rounded-3xl bg-indigo-50 text-indigo-500 mb-6">
            {step === 1 && <Mail size={32} />}
            {step === 2 && <ShieldCheck size={32} />}
            {step === 3 && <KeyRound size={32} />}
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">
            {step === 1 && 'Recovery.'}
            {step === 2 && 'Identity.'}
            {step === 3 && 'Security.'}
          </h2>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
            {step === 1 && "Request a password reset link."}
            {step === 2 && `Enter the sequence sent to ${email}`}
            {step === 3 && "Please enter your new password."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest text-center">{error}</p>
          </div>
        )}

        {/* STEP 1: EMAIL REQUEST */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <input
              type="email"
              required
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
              placeholder="Enter your email here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button disabled={loading} className="w-full py-5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-[0.98]">
              {loading ? 'Processing...' : 'Send Recovery Code'}
            </button>
          </form>
        )}

        {/* STEP 2: CODE VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <input
              type="text"
              required
              maxLength="6"
              className="w-full px-6 py-8 bg-slate-50 border border-slate-100 rounded-[32px] text-slate-900 font-black text-center text-4xl tracking-[0.4em] focus:border-indigo-500 outline-none transition-all"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <button className="w-full py-5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]">
              Verify
            </button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <input
              type="password"
              required
              minLength="6"
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 outline-none transition-all"
              placeholder="NEW SECURE PASSWORD"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button disabled={loading} className="w-full py-5 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 active:scale-[0.98]">
              {loading ? 'Syncing...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="mt-10 text-center flex flex-col items-center gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              <ArrowLeft size={12} /> Step back
            </button>
          )}
          <Link to="/login" className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-indigo-600 transition-colors">
            Cancel and Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;