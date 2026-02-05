import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, friendsAPI, postsAPI, chatAPI } from '../services/api';
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
  Settings,
  ArrowLeft,
  Maximize2,
  Mail,
  ShieldCheck,
  ShieldOff
} from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [friendLoading, setFriendLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  const isOwnProfile = userId === 'me' || currentUser?.id === parseInt(userId);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId, currentUser]);
  const fetchProfile = async () => {
    try {
      setLoading(true);
      let response;

      if (userId === 'me') {
        response = await usersAPI.getMyProfile();
      } else {
        response = await usersAPI.getUserProfile(userId);
      }

      const userData = response.data.data.user;
      setProfile(userData);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      // If userId is "me", use the currentUser.id from context
      const targetId = userId === 'me' ? currentUser?.id : userId;

      if (!targetId) return; // Wait until we have a valid ID

      const response = await postsAPI.getUserPosts(targetId);
      setPosts(response.data.data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  const handleFriendAction = async (action) => {
    setFriendLoading(true);
    try {
      if (action === 'send') await friendsAPI.sendRequest(parseInt(userId));
      if (action === 'remove') await friendsAPI.removeFriend(parseInt(userId));
      fetchProfile();
    } catch (err) {
      console.error('Friend action failed:', err);
    } finally {
      setFriendLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const response = await chatAPI.getOrCreateConversation(parseInt(userId));
      navigate(`/chats/${response.data.id}`);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] gap-4">
      <p className="font-black uppercase tracking-widest text-slate-400">{error}</p>
      <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold flex items-center gap-2">
        <ArrowLeft size={16} /> Go Back
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-12 pb-20">
      <div className="max-w-[935px] mx-auto px-6">

        {/* Profile Header */}
        <header className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 mb-16">
          <div className="relative group">
            <div
              onClick={() => profile?.avatar && setIsAvatarOpen(true)}
              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white border border-slate-200 p-1.5 shadow-xl shadow-slate-200/50 rotate-2 cursor-zoom-in transition-transform hover:scale-105 active:scale-95"
            >
              <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden -rotate-2 relative">
                {profile?.avatar ? (
                  <>
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300">
                    {profile?.name[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6 pt-2 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
                {profile?.name}
                <span className="text-rose-600">.</span>
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
                  <>
                    <FriendshipButton
                      status={profile?.friendshipStatus}
                      onClick={handleFriendAction}
                      loading={friendLoading}
                    />
                    {profile?.friendshipStatus === 'friends' && (
                      <button
                        onClick={handleMessage}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                      >
                        <MessageCircle size={16} /> Message
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start">
              <div className="pr-8 border-r border-slate-200">
                <span className="block text-2xl font-black text-slate-800">{profile?.postsCount || 0}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Posts</span>
              </div>
              <div className="pl-8">
                <span className="block text-2xl font-black text-slate-800">{profile?.friendsCount || 0}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Friends</span>
              </div>
            </div>

            <div className="max-w-md space-y-5">
              <p className="text-[15px] leading-relaxed text-slate-500 font-medium">
                {profile?.bio || (isOwnProfile ? "Tell the world your story..." : "This user prefers to keep their story a mystery.")}
              </p>

              {/* CONTACT SECTION (Email Badge) */}
              {profile?.email && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm group hover:border-indigo-200 transition-all">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-rose-600 group-hover:bg-indigo-50 transition-colors">
                      <Mail size={16} />
                    </div>
                    <div className="text-left">
                      <span className="block text-[9px] uppercase font-black tracking-[0.15em] text-slate-400 leading-none mb-1">Email Address</span>
                      <span className="text-xs font-bold text-slate-700">{profile.email}</span>
                    </div>
                  </div>

                  {/* Privacy Status - Visible only to owner */}
                  {isOwnProfile && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
                      {profile.showEmail ? (
                        <ShieldCheck size={14} className="text-emerald-500" />
                      ) : (
                        <ShieldOff size={14} className="text-slate-400" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {profile.showEmail ? 'Public' : 'Private'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* MUTUAL FRIENDS */}
              {!isOwnProfile && profile?.mutualFriends?.length > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                  <div className="flex -space-x-2.5">
                    {profile.mutualFriends.slice(0, 3).map((friend, i) => (
                      <div
                        key={i}
                        onClick={() => navigate(`/profile/${friend.id}`)}
                        className="w-7 h-7 rounded-lg border-2 border-white overflow-hidden bg-slate-200 shadow-sm rotate-3 cursor-pointer hover:rotate-0 hover:z-10 transition-all"
                      >
                        <img src={friend.avatar} className="w-full h-full object-cover -rotate-3 hover:rotate-0" alt="" />
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                    Friends with{' '}
                    <span
                      onClick={() => navigate(`/profile/${profile.mutualFriends[0].id}`)}
                      className="text-rose-600 cursor-pointer hover:underline decoration-2 underline-offset-2"
                    >
                      {profile.mutualFriends[0].name}
                    </span>
                    {profile.mutualFriends.length > 1 && (
                      <span className="text-slate-400">
                        {` +${profile.mutualFriends.length - 1} more`}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Zoomed Avatar Overlay */}
        {isAvatarOpen && profile?.avatar && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={() => setIsAvatarOpen(false)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition">
              <X size={32} />
            </button>
            <div
              className="relative max-w-full max-h-full aspect-square w-[500px] overflow-hidden rounded-[48px] shadow-2xl border-8 border-white animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={profile.avatar} className="w-full h-full object-cover" alt="Profile" />
            </div>
          </div>
        )}

        {/* Tabs */}
        <nav className="flex justify-center mb-10">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">
              <Grid size={14} />
              {isOwnProfile ? 'My Feed' : "User's Feed"}
            </button>
            <button className="flex items-center gap-2 px-8 py-2.5 text-slate-400 text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
              <Bookmark size={14} /> Saved
            </button>
          </div>
        </nav>

        {/* Post Grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-200 border-dashed py-24 flex flex-col items-center justify-center text-slate-300">
            <Grid size={48} strokeWidth={1} className="mb-4" />
            <p className="font-bold tracking-tighter text-xl">
              {isOwnProfile ? "You haven't posted yet." : "No content published yet."}
            </p>
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
                  <div className="w-full h-full flex items-center justify-center p-8 text-sm text-slate-400 italic text-center font-medium bg-slate-50">
                    {post.caption?.substring(0, 80)}...
                  </div>
                )}
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

        {/* Modals */}
        {isEditModalOpen && (
          <EditProfileModal profile={profile} onClose={() => setIsEditModalOpen(false)} onUpdate={fetchProfile} />
        )}

        {selectedPost && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4" onClick={() => setSelectedPost(null)}>
            <button onClick={() => setSelectedPost(null)} className="absolute top-8 right-8 text-slate-800 hover:text-indigo-600 p-2 bg-white rounded-full shadow-lg z-[160]"><X size={24} /></button>
            <div className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto no-scrollbar bg-[#F8FAFC] rounded-[40px] shadow-2xl border border-white" onClick={(e) => e.stopPropagation()}>
              <PostCard post={selectedPost} onDelete={() => { setSelectedPost(null); fetchUserPosts(); }} onUpdate={fetchUserPosts} />
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
      return <button disabled className={`${baseStyles} bg-slate-100 text-slate-400 cursor-default border border-slate-200 shadow-none`}>Pending...</button>;
    case 'request_received':
      return <button onClick={() => onClick('send')} className={`${baseStyles} bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse`}>Accept Invitation</button>;
    default:
      return <button onClick={() => onClick('send')} className={`${baseStyles} bg-indigo-600 hover:bg-indigo-700 text-white`}><UserPlus size={16} /> Connect</button>;
  }
};

export default Profile;