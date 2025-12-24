import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { friendsAPI } from '../services/api';
import { UserCheck, Clock, UserMinus, Users, AlertCircle, X } from 'lucide-react';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDisconnect, setUserToDisconnect] = useState(null);

  useEffect(() => {
    if (activeTab === 'friends') fetchFriends();
    else fetchRequests();
  }, [activeTab]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await friendsAPI.getFriends();
      setFriends(response.data.data.friends || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await friendsAPI.getPendingRequests();
      setRequests(response.data.data.requests || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsAPI.acceptRequest(requestId);
      fetchRequests();
    } catch (err) { console.error(err); }
  };

  const handleConfirmDisconnect = async () => {
    if (!userToDisconnect) return;
    try {
      await friendsAPI.removeFriend(userToDisconnect.id);
      setShowConfirmModal(false);
      setUserToDisconnect(null);
      fetchFriends();
    } catch (err) { console.error(err); }
  };

  const EmptyState = ({ icon, title, desc }) => (
    <div className="py-20 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
        {icon}
      </div>
      <h3 className="text-sm font-black uppercase tracking-tighter text-slate-800 italic mb-2">
        {title}
      </h3>
      <p className="max-w-[240px] text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
        {desc}
      </p>
    </div>
  );

  return (
    <main className="max-w-[700px] mx-auto py-12 px-6">
      {/* 1. CONSISTENT DELETE MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-rose-50 rounded-2xl text-rose-500">
                <AlertCircle size={32} />
              </div>
            </div>
            <h3 className="text-center font-black uppercase tracking-tighter text-xl mb-2 text-slate-900">
              Remove Friend?
            </h3>
            <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
              Are you sure you want to remove <span className="text-slate-900 italic">{userToDisconnect?.name}</span> as your friend?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmDisconnect}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-100"
              >
                Confirm Removal
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); setUserToDisconnect(null); }}
                className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
            Network<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">Manage your professional circle.</p>
        </div>
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-indigo-600">
          <Users size={24} />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-[22px] mb-10 border border-slate-200 shadow-sm">
        {[
          { id: 'friends', label: 'Friends', icon: UserCheck, count: friends.length },
          { id: 'requests', label: 'Requests', icon: Clock, count: requests.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-3 py-3 text-[11px] font-black uppercase tracking-widest rounded-[18px] transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-indigo-500' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List Area */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'friends' && (
              friends.length > 0 ? (
                friends.map(friend => (
                  <UserRow
                    key={friend.id}
                    user={friend}
                    onActionClick={() => {
                      setUserToDisconnect(friend);
                      setShowConfirmModal(true);
                    }}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Users size={32} />}
                  title="Your circle is empty"
                  desc="Use the search bar above to find and connect with creators."
                />
              )
            )}

            {activeTab === 'requests' && (
              requests.length > 0 ? (
                requests.map(req => (
                  <UserRow
                    key={req.id}
                    user={req.sender}
                    action={
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-100"
                      >
                        Accept
                      </button>
                    }
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Clock size={32} />}
                  title="No pending requests"
                  desc="You're all caught up! New friend requests will appear here."
                />
              )
            )}
          </>
        )}
      </div>
    </main>
  );
};

const UserRow = ({ user, action, onActionClick }) => (
  <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[24px] hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
    <Link to={`/profile/${user.id}`} className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100">
        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-black text-slate-300 bg-slate-50 uppercase">{user.name[0]}</div>}
      </div>
      <div>
        <p className="text-sm font-black text-slate-800 uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors">{user.name}</p>
      </div>
    </Link>

    {action ? (
      action
    ) : (
      <button
        onClick={onActionClick}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-all"
      >
        <UserMinus size={20} />
      </button>
    )}
  </div>
);

export default Friends;