import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, friendsAPI } from '../services/api';
import {
    Plus, LogOut, Settings, Search, UserPlus,
    Clock, UserCheck, X, User, ChevronDown
} from 'lucide-react';

const Navbar = ({ onOpenCreate }) => {
    const { logout, user: currentUser } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const searchRef = useRef(null);
    const profileRef = useRef(null);

    // Close search and profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearching(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Live Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 1) {
                try {
                    const res = await usersAPI.searchUsers(query);
                    setResults(res.data.data.users);
                    setIsSearching(true);
                } catch (err) { console.error(err); }
            } else {
                setResults([]);
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSendRequest = async (e, userId) => {
        e.preventDefault(); e.stopPropagation();
        try {
            await friendsAPI.sendRequest(userId);
            setResults(prev => prev.map(u => u.id === userId ? { ...u, friendshipStatus: 'request_sent' } : u));
        } catch (err) { console.error(err); }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6">
            <div className="max-w-full mx-auto h-full flex items-center justify-between">

                 {/* Branding */}
                <Link to="/" className="flex items-center gap-3 lg:w-52">
                    <div className="h-9 w-9 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                        <span className="text-white font-black text-lg">S</span>
                    </div>
                    <span className="hidden lg:block text-lg font-black tracking-tighter uppercase italic">
                        Stream<span className="text-rose-600">.</span>
                    </span>
                </Link>

                {/* Global Search Bar */}
                <div className="relative flex-1 max-w-md mx-8" ref={searchRef}>
                    <div className="relative group">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${query ? 'text-rose-600 scale-110' : 'text-slate-400'}`} size={18} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search people..."
                            className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-3 pl-12 pr-10 text-sm font-medium focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200/50 p-1 rounded-full transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Search Dropdown Results */}
                    {isSearching && (
                        <div className="absolute top-full mt-3 w-full bg-white border border-slate-100 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] shadow-indigo-500/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {results.length > 0 ? (
                                <div className="p-2">
                                    <div className="px-4 py-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Top Matches</span>
                                    </div>
                                    {results.map((u) => {
                                        const isAlreadyFriend = u.isFriend || u.friendshipStatus === 'friends';
                                        const isRequestSent = u.requestSent || u.friendshipStatus === 'request_sent';

                                        return (
                                            <div key={u.id} className="group/item flex items-center justify-between p-3 hover:bg-indigo-50/50 rounded-[20px] transition-all">
                                                <Link to={`/profile/${u.id}`} className="flex items-center gap-3 flex-1" onClick={() => setIsSearching(false)}>
                                                    <div className="relative">
                                                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="w-11 h-11 rounded-xl object-cover border border-slate-100" alt="" />
                                                        {isAlreadyFriend && (
                                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-tight italic text-slate-800 group-hover/item:text-rose-600 transition-colors">{u.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="opacity-0 group-hover/item:opacity-100 text-[9px] font-black text-rose-400 uppercase transition-opacity tracking-tighter">View Profile →</span>
                                                        </div>
                                                    </div>
                                                </Link>

                                                <div className="flex items-center">
                                                    {u.id === currentUser?.id ? (
                                                        <span className="text-[9px] font-black uppercase text-slate-300 px-3 italic">You</span>
                                                    ) : isAlreadyFriend ? (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                                            <UserCheck size={14} />
                                                            <span className="text-[9px] font-black uppercase">Friends</span>
                                                        </div>
                                                    ) : isRequestSent ? (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg">
                                                            <Clock size={14} />
                                                            <span className="text-[9px] font-black uppercase">Pending</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => handleSendRequest(e, u.id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all active:scale-95"
                                                        >
                                                            <UserPlus size={14} />
                                                            Connect
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : query.length > 1 && (
                                <div className="p-10 text-center flex flex-col items-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-3 border border-slate-100">
                                        <Search size={20} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        No users found for "{query}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onOpenCreate}
                        className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-slate-900 transition-all shadow-lg shadow-rose-100 active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Create Post
                    </button>

                    <div className="h-8 w-px bg-slate-200 mx-1" />

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1 pr-3 rounded-2xl hover:bg-slate-50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border-2 border-transparent group-hover:border-indigo-100 transition-all shadow-sm">
                                <img
                                    src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=EEF2FF&color=4F46E5`}
                                    className="w-full h-full object-cover"
                                    alt="Me"
                                />
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-2 animate-in fade-in zoom-in-95 duration-200">
                                <Link
                                    to="/profile/me"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 transition-all mx-2 rounded-xl group"
                                >
                                    <User size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-black uppercase tracking-tight">My Profile</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 transition-all mx-2 rounded-xl group"
                                >
                                    <Settings size={18} className="group-hover:rotate-45 transition-transform" />
                                    <span className="text-xs font-black uppercase tracking-tight">Settings</span>
                                </Link>

                                <div className="h-px bg-slate-50 my-2 mx-4" />

                                <button
                                    onClick={() => { setIsProfileOpen(false); logout(); }}
                                    className="flex items-center gap-3 w-[calc(100%-16px)] mx-2 px-4 py-3 text-rose-500 hover:bg-rose-50 transition-all rounded-xl group"
                                >
                                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                    <span className="text-xs font-black uppercase tracking-tight">Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;