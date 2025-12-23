import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { notificationsAPI, friendsAPI } from '../services/api';
import {
    Heart, MessageSquare, UserPlus, CheckCircle2,
    Inbox, Trash2, Check, X, BellDot, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const { notifications, unreadCount, refresh } = useNotifications();
    const [filter, setFilter] = useState('all');

    // Confirmation States
    const [showConfirm, setShowConfirm] = useState(false);
    const [notifToDelete, setNotifToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.isRead;
        if (filter === 'requests') return notif.type === 'FRIEND_REQUEST';
        return true;
    });

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            refresh();
        } catch (err) { console.error("Failed to mark read", err); }
    };

    const handleMarkOneRead = async (id, isRead) => {
        if (isRead) return;
        try {
            await notificationsAPI.markOneRead(id);
            refresh();
        } catch (err) { console.error("Error marking read", err); }
    };

    // Trigger confirmation modal
    const confirmDelete = (e, id) => {
        e.stopPropagation();
        setNotifToDelete(id);
        setShowConfirm(true);
    };

    // Execute actual delete
    const handleDelete = async () => {
        if (!notifToDelete) return;
        try {
            setIsDeleting(true);
            await notificationsAPI.deleteOne(notifToDelete);
            setShowConfirm(false);
            setNotifToDelete(null);
            refresh();
        } catch (err) {
            console.error("Failed to delete notification", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFriendAction = async (e, action, requestId, notificationId) => {
        e.stopPropagation();
        try {
            if (action === 'accept') {
                await friendsAPI.acceptRequest(requestId);
            } else {
                await friendsAPI.rejectRequest(requestId);
            }
            await notificationsAPI.markOneRead(notificationId);
            refresh();
        } catch (err) { console.error(`Failed to ${action} request`, err); }
    };

    const getNotifConfig = (type) => {
        const configs = {
            LIKE: { icon: <Heart size={14} className="fill-rose-500 text-rose-500" />, text: "liked your post", bg: "bg-rose-50" },
            COMMENT: { icon: <MessageSquare size={14} className="fill-indigo-500 text-indigo-500" />, text: "commented on your post", bg: "bg-indigo-50" },
            FRIEND_REQUEST: { icon: <UserPlus size={14} className="text-amber-500" />, text: "sent you a friend request", bg: "bg-amber-50" },
            FRIEND_ACCEPT: { icon: <CheckCircle2 size={14} className="text-emerald-500" />, text: "accepted your friend request", bg: "bg-emerald-50" },
        };
        return configs[type] || configs.LIKE;
    };

    return (
        <main className="max-w-2xl mx-auto py-10 px-6 min-h-screen">
            {/* 1. CONFIRM DELETE MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-rose-50 rounded-2xl text-rose-500">
                                <AlertCircle size={32} />
                            </div>
                        </div>
                        <h3 className="text-center font-black uppercase tracking-tighter text-xl mb-2">Remove Notification?</h3>
                        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                            This notification will be deleted permanently.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isDeleting ? 'Removing...' : 'Confirm Delete'}
                            </button>
                            <button
                                onClick={() => { setShowConfirm(false); setNotifToDelete(null); }}
                                className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-10 flex items-center justify-between">
                <div>
                    {/* Optional: Keeping the small "Inbox" tag but styled like a subtitle or removing it for total consistency */}
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Inbox size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Inbox</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
                        Activity Hub<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Stay updated with your latest interactions.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mark All Read Button - Styled to fit the new layout */}
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            <BellDot size={14} /> Mark All Read
                        </button>
                    )}

                    {/* The Right-Side Icon Box (Consistent with Network page) */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
                        <BellDot size={24} />
                    </div>
                </div>
            </header>

            {/* FILTER TABS */}
            <div className="flex bg-white p-1.5 rounded-[22px] mb-10 border border-slate-200 shadow-sm">
                {[
                    { id: 'all', label: 'All Activity', icon: Inbox },
                    { id: 'unread', label: 'Unread', icon: BellDot, count: unreadCount },
                    { id: 'requests', label: 'Requests', icon: UserPlus }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-3 py-3 text-[11px] font-black uppercase tracking-widest rounded-[18px] transition-all ${filter === tab.id
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${filter === tab.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[32px] py-20 flex flex-col items-center justify-center text-center">
                        <Inbox size={32} className="text-slate-200 mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">
                            No {filter !== 'all' ? filter : ''} activity yet
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => {
                        const config = getNotifConfig(notif.type);
                        return (
                            <div
                                key={notif.id}
                                onClick={() => handleMarkOneRead(notif.id, notif.isRead)}
                                className={`group relative flex flex-col p-5 rounded-[28px] border transition-all hover:shadow-xl ${!notif.isRead
                                    ? 'bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50'
                                    : 'bg-slate-50/50 border-transparent opacity-80'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <Link to={`/profile/${notif.senderId}`} className="shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                                        <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                                            <img src={notif.sender.avatar || `https://ui-avatars.com/api/?name=${notif.sender.name}`} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-lg shadow-sm ${config.bg} border-2 border-white`}>
                                            {config.icon}
                                        </div>
                                    </Link>

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

                                    <div className="flex items-center gap-2">
                                        {notif.postId && (
                                            <Link to={`/post/${notif.postId}`} className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                View
                                            </Link>
                                        )}

                                        <button
                                            onClick={(e) => confirmDelete(e, notif.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        {!notif.isRead && (
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                        )}
                                    </div>
                                </div>

                                {notif.type === 'FRIEND_REQUEST' && !notif.isRead && notif.requestId && (
                                    <div className="flex gap-2 mt-4 ml-16">
                                        <button
                                            onClick={(e) => handleFriendAction(e, 'accept', notif.requestId, notif.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                        >
                                            <Check size={14} /> Accept
                                        </button>
                                        <button
                                            onClick={(e) => handleFriendAction(e, 'decline', notif.requestId, notif.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                                        >
                                            <X size={14} /> Ignore
                                        </button>
                                    </div>
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