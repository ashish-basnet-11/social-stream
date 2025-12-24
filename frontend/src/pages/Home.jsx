import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, usersAPI } from '../services/api';
import PostCard from '../components/PostCard';
import { Sparkles, TrendingUp, Zap, UserPlus } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPosts();
    fetchSuggestions();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll(page);
      setPosts(response.data.data.posts);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      // This endpoint should return users who aren't currently friends
      const response = await usersAPI.getSuggestions(); 
      setSuggestedUsers(response.data.data.users.slice(0, 5));
    } catch (err) {
      console.error('Failed to load suggestions', err);
    }
  };

  // NEW: Handle instant UI update when following someone
  const handleFollow = async (userId) => {
    try {
      // Optimistically remove from suggestion list
      setSuggestedUsers(prev => prev.filter(user => user.id !== userId));
      
      // Call your API (Assuming friendRequest or follow endpoint)
      await usersAPI.sendFriendRequest(userId); 
    } catch (err) {
      console.error('Follow failed', err);
      // Optional: re-fetch if error occurs to sync UI
      fetchSuggestions();
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Feed</p>
      </div>
    );
  }

  return (
    <main className="flex justify-center gap-12 py-10 px-8 bg-[#F8FAFC] min-h-screen">
      {/* --- FEED COLUMN --- */}
      <div className="max-w-[680px] w-full space-y-8">
        <header className="flex items-end justify-between mb-4 px-2">
          <div>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Discovery</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">
              Recent Activity<span className="text-rose-600">.</span>
            </h2>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
             <button className="text-[11px] font-black uppercase tracking-tight px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 transition-all">Relevant</button>
             <button className="text-[11px] font-black uppercase tracking-tight px-4 py-2 text-slate-400 hover:text-slate-600 transition-colors">Latest</button>
          </div>
        </header>

        <div className="grid gap-10">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      </div>

      {/* --- RIGHT ASIDE (BIG SCREEN ONLY) --- */}
      <aside className="hidden xl:flex flex-col w-[320px] space-y-8">
        
        {/* Updated Discovery Card */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <div className="p-2 bg-indigo-50 rounded-lg text-rose-600">
              <Zap size={18} fill="currentColor" />
            </div>
            <h3 className="font-black uppercase tracking-tighter text-sm italic">New Discoveries</h3>
          </div>
          
          <div className="space-y-6">
            {suggestedUsers.length > 0 ? (
              suggestedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between group">
                  <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm transition-transform group-hover:scale-105 duration-300">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=EEF2FF&color=4F46E5`} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                      </div>
                      {/* Status indicator: Suggests they are online or just "new" */}
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-800 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        Not in network
                      </p>
                    </div>
                  </Link>
                  
                  <button 
                    onClick={() => handleFollow(user.id)}
                    className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-100 active:scale-90"
                    title="Add to Network"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-[24px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  No new people found
                </p>
              </div>
            )}
          </div>
          
          <button className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-600 border-t border-slate-50 transition-colors">
            Expand Discovery
          </button>
        </div>

        {/* Trending/Footer Card */}
        <div className="px-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Trending Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['#design', '#stream', '#dev', '#studio'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 hover:border-rose-200 hover:text-rose-600 cursor-pointer transition-all">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">
              © 2025 Stream Studio <br/>
              <span className="opacity-50 uppercase tracking-widest mt-1 block">Privacy • Terms • Press</span>
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Home;