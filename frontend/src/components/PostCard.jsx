import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, likesAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, MessageCircle, Send, Bookmark, Trash2, 
  CheckCircle2, AlertCircle, Loader2, X, User, Edit3 
} from 'lucide-react';

const PostCard = ({ post, onUpdate }) => {
  const { user: currentUser } = useAuth();
  
  // Post States
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ caption: post.caption || '' });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Interaction States
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  
  // Comments States
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Modal & Feedback States
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likers, setLikers] = useState([]);
  const [likersLoading, setLikersLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isAuthor = currentUser?.id === post.authorId;

  // --- HANDLERS ---

  const handleViewLikes = async () => {
    if (likesCount === 0) return;
    setShowLikesModal(true);
    setLikersLoading(true);
    try {
      const response = await likesAPI.getPostLikes(post.id);
      setLikers(response.data.data.likes);
    } catch (err) {
      console.error('Failed to fetch likers:', err);
    } finally {
      setLikersLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      await postsAPI.delete(post.id);
      setShowToast(true);
      // Wait for animation before refreshing parent list
      setTimeout(() => onUpdate(), 2000);
    } catch (err) {
      console.error('Delete error:', err);
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await likesAPI.toggle(post.id);
      setIsLiked(response.data.data.isLiked);
      setLikesCount(response.data.data.likesCount);
    } catch (err) { console.error('Like error:', err); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await commentsAPI.create(post.id, newComment);
      setComments([response.data.data.comment, ...comments]);
      setNewComment('');
      setCommentsCount(prev => prev + 1);
    } catch (err) { console.error(err); }
  };

  const loadComments = async () => {
    if (!showComments) {
      setCommentsLoading(true);
      try {
        const response = await commentsAPI.getPostComments(post.id);
        setComments(response.data.data.comments);
      } catch (err) { console.error(err); }
      finally { setCommentsLoading(false); }
    }
    setShowComments(!showComments);
  };

  // --- RENDER HELPERS ---

  if (isDeleting) {
    return (
      <div className="relative mb-8">
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 flex flex-col items-center justify-center transition-all duration-700 scale-95 opacity-50">
          <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 animate-pulse text-center">Removing Content</p>
        </div>
        {showToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-toast">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
              <div className="bg-emerald-500 p-1 rounded-full"><CheckCircle2 size={16} /></div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Post deleted from stream.</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* 1. LIKES MODAL */}
      {showLikesModal && (
        <div 
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowLikesModal(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl border border-white animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-rose-500 fill-rose-500" />
                <h3 className="font-black uppercase tracking-tighter italic text-slate-900">Likes<span className="text-indigo-600">.</span></h3>
              </div>
              <button onClick={() => setShowLikesModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-6 no-scrollbar">
              {likersLoading ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading stream</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {likers.map((item) => (
                    <Link key={item.user.id} to={`/profile/${item.user.id}`} onClick={() => setShowLikesModal(false)} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-[22px] transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm group-hover:border-indigo-200 transition-all">
                          {item.user.avatar ? <img src={item.user.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-bold uppercase">{item.user.name[0]}</div>}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors italic text-sm">{item.user.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">View Profile</p>
                        </div>
                      </div>
                      <User size={16} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CONFIRM DELETE MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-rose-50 rounded-2xl text-rose-500"><AlertCircle size={32} /></div>
            </div>
            <h3 className="text-center font-black uppercase tracking-tighter text-xl mb-2">Delete Post?</h3>
            <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">This will permanently remove this post from the grid.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all active:scale-95">Confirm Delete</button>
              <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST CARD CONTENT */}
      {isEditing ? (
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 mb-8 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={async (e) => {
            e.preventDefault();
            await postsAPI.update(post.id, editData);
            setIsEditing(false);
            onUpdate();
          }} className="space-y-4">
            <textarea
              value={editData.caption}
              onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none font-medium text-sm"
              rows="3"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsEditing(false)} type="button" className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95">Save Changes</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] group/card mb-8">
          {/* Header */}
          <div className="p-5 flex items-start justify-between">
            <Link to={`/profile/${post.authorId}`} className="flex items-center gap-3 group/author">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                {post.author.avatar ? <img src={post.author.avatar} className="w-full h-full object-cover transition-transform group-hover/author:scale-110" alt="" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-bold">{post.author.name[0]}</div>}
              </div>
              <div>
                <h4 className="font-black text-slate-900 leading-none group-hover/author:text-indigo-600 transition-colors italic uppercase tracking-tighter">{post.author.name}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </Link>

            {isAuthor && (
              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <button onClick={() => setIsEditing(true)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">Edit</button>
                <button onClick={() => setShowConfirm(true)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all">Delete</button>
              </div>
            )}
          </div>

          <div className="px-6 pb-4">
            <p className="text-slate-600 leading-relaxed text-[15px] font-medium">{post.caption}</p>
          </div>

          {post.imageUrl && (
            <div className="px-4 pb-4">
              <div className="rounded-[24px] overflow-hidden border border-slate-100 bg-slate-50 relative">
                <img src={post.imageUrl} className="w-full h-auto object-cover max-h-[600px] hover:scale-[1.01] transition-transform duration-700" alt="" />
              </div>
            </div>
          )}

          {/* Interaction Footer */}
          <div className="px-6 py-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button onClick={handleLike} className="p-1 -ml-1">
                  <Heart size={22} className={`transition-all active:scale-150 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-slate-500'}`} />
                </button>
                <button 
                  onClick={handleViewLikes} 
                  disabled={likesCount === 0} 
                  className={`text-sm font-black transition-colors ${likesCount > 0 ? 'hover:text-indigo-600' : 'cursor-default'} ${isLiked ? 'text-rose-600' : 'text-slate-400'}`}
                >
                  {likesCount}
                </button>
              </div>

              <button onClick={loadComments} className="flex items-center gap-2 group">
                <MessageCircle size={22} className={`transition-all ${showComments ? 'text-indigo-600 fill-indigo-50' : 'text-slate-300 group-hover:text-slate-500'}`} />
                <span className={`text-sm font-black ${showComments ? 'text-indigo-600' : 'text-slate-400'}`}>{commentsCount}</span>
              </button>
            </div>
            <button className="text-slate-300 hover:text-slate-900 transition-colors"><Bookmark size={22} /></button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="px-6 pb-6 pt-4 bg-slate-50/50 border-t border-slate-100 animate-in fade-in duration-300">
              <div className="space-y-5 mt-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {commentsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-indigo-500/50" /></div>
                ) : comments.length === 0 ? (
                  <div className="py-10 text-center"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Thread is currently silent.</p></div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 items-start group/comment">
                      <Link to={`/profile/${comment.author?.id || comment.author?._id}`} className="shrink-0 pt-0.5">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden shadow-sm group-hover/comment:border-indigo-200 transition-all">
                          {comment.author?.avatar ? <img src={comment.author.avatar} className="w-full h-full object-cover" alt="" /> : <span className="uppercase">{comment.author?.name[0]}</span>}
                        </div>
                      </Link>
                      <div className="flex-1 bg-white px-4 py-3 rounded-[20px] rounded-tl-none border border-slate-100 shadow-sm group-hover/comment:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <Link to={`/profile/${comment.author?.id || comment.author?._id}`} className="font-black text-indigo-600 uppercase text-[10px] tracking-tight">{comment.author?.name}</Link>
                          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleCommentSubmit} className="mt-6 flex items-center gap-3 bg-white p-2 pl-5 rounded-[22px] border border-slate-200 focus-within:ring-8 focus-within:ring-indigo-500/5 transition-all">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share thoughts..." className="flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-300 font-medium" />
                <button disabled={!newComment.trim()} className="bg-slate-900 text-white p-2.5 rounded-[16px] hover:bg-indigo-600 disabled:opacity-10 transition-all shadow-lg shadow-slate-100"><Send size={14} /></button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PostCard;