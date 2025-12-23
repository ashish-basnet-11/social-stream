import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { friendsAPI } from '../services/api';
import { UserCheck, Clock, UserMinus, ChevronRight, Users } from 'lucide-react';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove friend?')) return;
    try {
      await friendsAPI.removeFriend(friendId);
      fetchFriends();
    } catch (err) { console.error(err); }
  };

  return (
    <main className="max-w-[700px] mx-auto py-12 px-6">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
            Network<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage your professional circle.</p>
        </div>
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
           <Users size={24} />
        </div>
      </header>

      <div className="flex bg-white p-1.5 rounded-[22px] mb-10 border border-slate-200 shadow-sm">
        {[
          { id: 'friends', label: 'Friends', icon: UserCheck, count: friends.length },
          { id: 'requests', label: 'Requests', icon: Clock, count: requests.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-3 py-3 text-[11px] font-black uppercase tracking-widest rounded-[18px] transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'
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

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-600"></div></div>
        ) : (
          <>
            {activeTab === 'friends' && friends.map(friend => (
              <UserRow key={friend.id} user={friend} action={
                <button onClick={() => handleRemoveFriend(friend.id)} className="text-slate-300 hover:text-rose-500 p-2 transition-all"><UserMinus size={20} /></button>
              } />
            ))}
            {activeTab === 'requests' && requests.map(req => (
              <UserRow key={req.id} user={req.sender} action={
                <div className="flex gap-2">
                  <button onClick={() => handleAcceptRequest(req.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Accept</button>
                </div>
              } />
            ))}
            {((activeTab === 'friends' && friends.length === 0) || (activeTab === 'requests' && requests.length === 0)) && !loading && (
              <div className="text-center py-20 text-slate-400 text-[10px] font-black uppercase tracking-widest">No activity found</div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

// Internal Helper for User Rows
const UserRow = ({ user, action }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[24px] hover:shadow-md transition-all group">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100">
          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">{user.name[0]}</div>}
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors">{user.name}</p>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Member</span>
        </div>
      </Link>
      {action}
    </div>
);

export default Friends;