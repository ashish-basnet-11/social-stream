import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsAPI } from '../services/api';
import { Shield, Mail, CheckCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user, setUser, loading } = useAuth();
    const navigate = useNavigate();

    const [showEmail, setShowEmail] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        if (user) {
            setShowEmail(!!user.showEmail);
        }
    }, [user]);

    const handleToggleEmail = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        setSaveStatus(null); // Reset status before new attempt

        const newValue = !showEmail;

        try {
            const response = await settingsAPI.updatePrivacy({ showEmail: newValue });
            if (response.data.status === 'success') {
                setShowEmail(newValue);
                setUser({ ...user, showEmail: newValue });
                setSaveStatus('saved');
                // Toast auto-hide
                setTimeout(() => setSaveStatus(null), 3000);
            }
        } catch (err) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 4000);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-12 pb-20 px-6 relative">
            
            {/* --- TOAST NOTIFICATIONS --- */}
            {saveStatus === 'saved' && (
                <div className="fixed bottom-10 inset-x-0 z-[100] flex justify-center px-6 pointer-events-none">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-toast">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <CheckCircle size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 leading-none mb-1">Updated</span>
                            <span className="text-xs font-bold tracking-tight">Privacy preferences synced successfully</span>
                        </div>
                    </div>
                </div>
            )}

            {saveStatus === 'error' && (
                <div className="fixed bottom-10 inset-x-0 z-[100] flex justify-center px-6 pointer-events-none">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-toast">
                        <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                            <AlertCircle size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 leading-none mb-1">System Error</span>
                            <span className="text-xs font-bold tracking-tight">Failed to update settings. Try again.</span>
                        </div>
                    </div>
                </div>
            )}
            {/* --------------------------- */}

            <div className="max-w-2xl mx-auto">
               
                <header className="mb-12">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
                        Control Center<span className="text-indigo-600">.</span>
                    </h1>
                  
                </header>

                <div className="space-y-6">
                    <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3">
                                <Shield size={24} className="-rotate-3" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Privacy</h2>
                                <p className="text-xs text-slate-400 font-medium">Manage what you share with the network</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-all shadow-sm">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700">Show Email Address</p>
                                    <p className="text-xs text-slate-400">Allow others to see your email on your profile</p>
                                </div>
                            </div>

                            <button
                                onClick={handleToggleEmail}
                                disabled={isUpdating}
                                className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center px-1 ${
                                    showEmail ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center ${
                                    showEmail ? 'translate-x-6' : 'translate-x-0'
                                }`}>
                                    {isUpdating && <Loader2 size={12} className="animate-spin text-indigo-600" />}
                                </div>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;