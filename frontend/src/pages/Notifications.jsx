import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { notificationsAPI } from '../services/api';
import {
    Heart, MessageSquare, UserPlus, CheckCircle2,
    Inbox, Loader2, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const { notifications, unreadCount, refresh } = useNotifications();

    useEffect(() => {
        // Optional: Mark all as read automatically when opening this page
        // handleMarkAllRead();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            refresh();
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const handleMarkOneRead = async (id, isRead) => {
        if (isRead) return; // Already read, no need to call API
        try {
            await notificationsAPI.markOneRead(id);
            refresh(); // This updates the unreadCount globally
        } catch (err) {
            console.error("Failed to mark single notification as read", err);
        }
    };

    const getNotifConfig = (type) => {
        const configs = {
            LIKE: {
                icon: <Heart size={16} className="fill-rose-500 text-rose-500" />,
                text: "liked your post",
                bg: "bg-rose-50",
            },
            COMMENT: {
                icon: <MessageSquare size={16} className="fill-indigo-500 text-indigo-500" />,
                text: "commented on your feed",
                bg: "bg-indigo-50",
            },
            FRIEND_REQUEST: {
                icon: <UserPlus size={16} className="text-amber-500" />,
                text: "sent you a network request",
                bg: "bg-amber-50",
            },
            FRIEND_ACCEPT: {
                icon: <CheckCircle2 size={16} className="text-emerald-500" />,
                text: "accepted your connection",
                bg: "bg-emerald-50",
            },
        };
        return configs[type] || configs.LIKE;
    };

    return (
        <main className="max-w-2xl mx-auto py-10 px-6 min-h-screen">
            <header className="flex items-end justify-between mb-10">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Inbox size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Inbox</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
                        Activity Hub<span className="text-indigo-600">.</span>
                    </h2>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        Clear New ({unreadCount})
                    </button>
                )}
            </header>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[32px] py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                            <Inbox size={32} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Your stream is quiet</p>
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const config = getNotifConfig(notif.type);
                        return (
                            <div
                                key={notif.id}
                                onClick={() => handleMarkOneRead(notif.id, notif.isRead)}
                                className={`group relative flex items-center gap-4 p-5 rounded-[28px] border transition-all hover:shadow-xl hover:shadow-indigo-500/5 ${!notif.isRead
                                        ? 'bg-white border-indigo-100 shadow-md'
                                        : 'bg-slate-50/50 border-transparent grayscale-[0.5] opacity-80'
                                    }`}
                            >
                                {/* User Avatar */}
                                <Link to={`/profile/${notif.senderId}`} className="shrink-0 relative">
                                    <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                                        <img
                                            src={notif.sender.avatar || `https://ui-avatars.com/api/?name=${notif.sender.name}`}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg shadow-sm ${config.bg} border-2 border-white`}>
                                        {config.icon}
                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-600 leading-tight">
                                        <Link to={`/profile/${notif.senderId}`} className="font-black uppercase tracking-tighter italic text-slate-900 hover:text-indigo-600 transition-colors mr-1.5">
                                            {notif.sender.name}
                                        </Link>
                                        {config.text}
                                    </p>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* Interaction Target (Optional Link to post) */}
                                {notif.postId && (
                                    <Link
                                        to={`/post/${notif.postId}`}
                                        className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    >
                                        View
                                    </Link>
                                )}

                                {!notif.isRead && (
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
};

export default Notifications;