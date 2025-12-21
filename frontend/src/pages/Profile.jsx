import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI, friendsAPI, postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/EditProfileModal';
import PostCard from '../components/PostCard';
import {
  UserPlus,
  UserX,
  Grid,
  Bookmark,
  Heart,
  MessageCircle,
  X,
  Settings
} from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [friendLoading, setFriendLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getUserProfile(userId);
      setProfile(response.data.data.user);
    } catch (err) { setError('Profile not found'); }
    finally { setLoading(false); }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await postsAPI.getUserPosts(userId);
      setPosts(response.data.data.posts || []);
    } catch (err) { console.error('Failed to fetch posts:', err); }
  };

  const handleFriendAction = async (action) => {
    setFriendLoading(true);
    try {
      if (action === 'send') await friendsAPI.sendRequest(parseInt(userId));
      if (action === 'remove') await friendsAPI.removeFriend(parseInt(userId));
      fetchProfile();
    } catch (err) { console.error('Friend action failed:', err); }
    finally { setFriendLoading(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-12 pb-20">
      <div className="max-w-[935px] mx-auto px-6">

        {/* Profile Header - Minimalist Studio Style */}
        <header className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 mb-16">
          {/* Avatar with soft shadow instead of gradient */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white border border-slate-200 p-1.5 shadow-xl shadow-slate-200/50 rotate-2">
              <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden -rotate-2">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300">
                    {profile?.name[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-6 pt-2 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
                {profile?.name}<span className="text-indigo-600">.</span>
              </h1>
              <div className="flex items-center gap-3">
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold transition-all border border-slate-200 shadow-sm flex items-center gap-2"
                  >
                    <Settings size={16} /> Update Profile
                  </button>
                ) : (
                  <FriendshipButton status={profile?.friendshipStatus} onClick={handleFriendAction} loading={friendLoading} />
                )}
              </div>
            </div>

            {/* Stats - Clean Divider Style */}
            <div className="flex items-center justify-center md:justify-start">
              <div className="pr-8 border-r border-slate-200">
                <span className="block text-2xl font-black text-slate-800">{profile?.postsCount || 0}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Posts</span>
              </div>
              <div className="pl-8">
                <span className="block text-2xl font-black text-slate-800">{profile?.friendsCount || 0}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Network</span>
              </div>
            </div>

            {/* Bio */}
            <div className="max-w-md">
              {/* <p className="text-sm font-bold text-indigo-600 mb-1">{profile?.email}</p> */}
              <p className="text-[15px] leading-relaxed text-slate-500 font-medium">
                {profile?.bio || "This user prefers to keep their story a mystery."}
              </p>
            </div>
          </div>
        </header>

        {/* Tabs - Modern Minimalist */}
        <nav className="flex justify-center mb-10">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">
              <Grid size={14} /> My Feed
            </button>
            <button className="flex items-center gap-2 px-8 py-2.5 text-slate-400 text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
              <Bookmark size={14} /> Saved
            </button>
          </div>
        </nav>

        {/* Grid - Card Style */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-200 border-dashed py-24 flex flex-col items-center justify-center text-slate-300">
            <Grid size={48} strokeWidth={1} className="mb-4" />
            <p className="font-bold tracking-tighter text-xl">No content published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group relative aspect-[4/5] cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1"
              >
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8 text-sm text-slate-400 italic text-center font-medium">
                    {post.caption?.substring(0, 80)}...
                  </div>
                )}

                {/* Hover Overlay with Indigo tint */}
                <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-rose-500 font-black"><Heart size={18} fill="currentColor" /> {post.likesCount || 0}</div>
                    <div className="flex items-center gap-1.5 text-indigo-600 font-black"><MessageCircle size={18} fill="currentColor" /> {post.commentsCount || 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal remains the same but you should update its internal classes later */}
        {isEditModalOpen && (
          <EditProfileModal profile={profile} onClose={() => setIsEditModalOpen(false)} onUpdate={fetchProfile} />
        )}

        {/* Post Detail Modal - White Mode */}
        {/* Post Detail Modal - White Mode */}
        {selectedPost && (
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all"
            onClick={() => setSelectedPost(null)} // Click backdrop to close
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-8 right-8 text-slate-800 hover:text-indigo-600 transition p-2 bg-white rounded-full shadow-lg z-[160]"
            >
              <X size={24} />
            </button>

            <div
              /* Added 'no-scrollbar' class here */
              className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto no-scrollbar bg-[#F8FAFC] rounded-[40px] shadow-2xl border border-white"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
            >
              <PostCard
                post={selectedPost}
                onDelete={() => { setSelectedPost(null); fetchUserPosts(); }}
                onUpdate={fetchUserPosts}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

const FriendshipButton = ({ status, onClick, loading }) => {
  if (loading) return <div className="h-10 w-28 bg-slate-200 rounded-xl animate-pulse" />;

  const baseStyles = "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm shadow-indigo-100";

  switch (status) {
    case 'friends':
      return <button onClick={() => onClick('remove')} className={`${baseStyles} bg-white text-slate-400 hover:text-rose-500 border border-slate-200 hover:border-rose-100`}><UserX size={16} /> Disconnect</button>;
    case 'request_sent':
      return <button disabled className={`${baseStyles} bg-slate-100 text-slate-400 cursor-default border border-slate-200 shadow-none`}>Pending</button>;
    case 'request_received':
      return <button className={`${baseStyles} bg-indigo-600 hover:bg-indigo-700 text-white`}>Accept Invitation</button>;
    default:
      return <button onClick={() => onClick('send')} className={`${baseStyles} bg-indigo-600 hover:bg-indigo-700 text-white`}><UserPlus size={16} /> Connect</button>;
  }
};

export default Profile;