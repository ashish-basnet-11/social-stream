import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { friendsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext'; // 1. Added import
import {
  Search,
  CheckCircle2,
  UserPlus,
  UserMinus,
  UserCheck,
  Clock,
  ChevronRight
} from 'lucide-react';

const Friends = () => {
  const { user: currentUser } = useAuth(); // 2. Added currentUser definition
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'friends') fetchFriends();
    else if (activeTab === 'requests') fetchRequests();
  }, [activeTab]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await friendsAPI.getFriends();
      setFriends(response.data.data.friends || []);
    } catch (err) { console.error('Failed to fetch friends:', err); }
    finally { setLoading(false); }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await friendsAPI.getPendingRequests();
      setRequests(response.data.data.requests || []);
    } catch (err) { console.error('Failed to fetch requests:', err); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await usersAPI.searchUsers(searchQuery);
      setSearchResults(response.data.data.users || []);
    } catch (err) { setError('Search failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId);
      setSearchResults(prev =>
        prev.map(u => u.id === userId ? { ...u, requestSent: true } : u)
      );
    } catch (err) { console.error('Failed to send request:', err); }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsAPI.acceptRequest(requestId);
      fetchRequests();
    } catch (err) { console.error('Failed to accept:', err); }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendsAPI.rejectRequest(requestId);
      fetchRequests();
    } catch (err) { console.error('Failed to reject:', err); }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove friend?')) return;
    try {
      await friendsAPI.removeFriend(friendId);
      fetchFriends();
    } catch (err) { console.error('Failed to remove:', err); }
  };

  return (
    <main className="flex-1 flex justify-center py-12 px-6 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[700px] w-full">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
            Network<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Grow your circle and manage connections.</p>
        </header>

        {/* Segmented Control */}
        <div className="flex bg-white p-1.5 rounded-[20px] mb-10 border border-slate-200 shadow-sm shadow-slate-200/50">
          {[
            { id: 'friends', label: 'Friends', icon: UserCheck },
            { id: 'requests', label: 'Friend Requests', icon: Clock },
            { id: 'search', label: 'Discover', icon: Search }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-300'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.id === 'requests' && requests.length > 0 && (
                <span className="bg-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full text-white animate-pulse">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-sm font-bold">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {activeTab === 'search' && (
            <form onSubmit={handleSearch} className="relative mb-10 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-slate-800 outline-none focus:border-indigo-600/50 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-sm"
              />
            </form>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Synchronizing</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeTab === 'friends' && friends.map(friend => (
                <UserRow
                  key={friend.id}
                  user={friend}
                  action={
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-slate-300 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <UserMinus size={20} />
                    </button>
                  }
                />
              ))}

              {activeTab === 'requests' && requests.map(req => (
                <UserRow
                  key={req.id}
                  user={req.sender}
                  action={
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptRequest(req.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100">Accept</button>
                      <button onClick={() => handleRejectRequest(req.id)} className="bg-white text-slate-500 px-5 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 transition">Ignore</button>
                    </div>
                  }
                />
              ))}

              {activeTab === 'search' && searchResults.map(user => {
                // Check if this user exists in our pre-loaded 'friends' state
                const isAlreadyFriend = friends.some(f => f.id === user.id);

                return (
                  <UserRow
                    key={user.id}
                    user={user}
                    action={
                      user.id === currentUser?.id ? (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 px-4">You</span>
                      ) :
                        // Logic Priority: 1. Already in friend list? 2. Backend says friends? 3. Request pending?
                        (isAlreadyFriend || user.isFriend || user.friendshipStatus === 'friends') ? (
                          <span className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-tighter bg-emerald-50 px-4 py-2 rounded-xl">
                            <UserCheck size={14} /> Connected
                          </span>
                        ) : (user.requestSent || user.friendshipStatus === 'request_sent') ? (
                          <span className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-tighter bg-indigo-50 px-4 py-2 rounded-xl">
                            <Clock size={14} /> Pending
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(user.id)}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-slate-200 active:scale-95"
                          >
                            <UserPlus size={16} /> Connect
                          </button>
                        )
                    }
                  />
                );
              })}

              {!loading && (
                ((activeTab === 'friends' && friends.length === 0) && <EmptyState message="Your network is currently quiet." />) ||
                ((activeTab === 'requests' && requests.length === 0) && <EmptyState message="No invitations pending." />) ||
                ((activeTab === 'search' && searchResults.length === 0 && searchQuery) && <EmptyState message={`No matches for "${searchQuery}"`} />)
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const UserRow = ({ user, action }) => (
  <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-[24px] transition-all duration-300 group shadow-sm hover:shadow-md hover:shadow-slate-200/50">
    <Link to={`/profile/${user.id}`} className="flex items-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xl border border-slate-100 overflow-hidden shadow-inner">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          ) : (
            <span className="text-slate-300">{user.name[0].toUpperCase()}</span>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
      </div>
      <div>
        <div className="flex items-center gap-1">
          <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight italic">
            {user.name}
          </p>
          <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
    <div className="flex items-center">
      {action}
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-slate-100 rotate-6">
      <Search size={32} className="text-slate-200 -rotate-6" />
    </div>
    <p className="text-slate-400 font-bold tracking-tight text-lg">{message}</p>
  </div>
);

export default Friends;