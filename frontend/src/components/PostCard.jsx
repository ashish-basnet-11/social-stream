import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, likesAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const PostCard = ({ post, onUpdate }) => {
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ caption: post.caption || '' });
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false); // Added loading state
  const [showToast, setShowToast] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isAuthor = currentUser?.id === post.authorId;

  const handleDelete = async () => {
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      await postsAPI.delete(post.id);
      setShowToast(true);
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

  if (isDeleting) {
    return (
      <div className="relative">
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 mb-8 flex flex-col items-center justify-center transition-all duration-700 scale-95 opacity-50">
          <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 animate-pulse text-center">Purging Transmission</p>
        </div>
        {showToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
              <div className="bg-emerald-500 p-1 rounded-full"><CheckCircle2 size={16} /></div>
              <span className="text-[11px] font-black uppercase tracking-widest">Post vanished from stream.</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
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

      {isEditing ? (
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 mb-8 shadow-sm">
          <form onSubmit={async (e) => {
            e.preventDefault();
            await postsAPI.update(post.id, editData);
            setIsEditing(false);
            onUpdate();
          }} className="space-y-4">
            <textarea
              value={editData.caption}
              onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none font-medium"
              rows="3"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsEditing(false)} type="button" className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-indigo-600 transition-all">Save Changes</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] group/card">
          <div className="p-5 flex items-start justify-between">
            <Link to={`/profile/${post.authorId}`} className="flex items-center gap-3 group/author">
              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                {post.author.avatar ? (
                  <img src={post.author.avatar} className="w-full h-full object-cover transition-transform group-hover/author:scale-110" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-bold">{post.author.name[0]}</div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 leading-none group-hover/author:text-indigo-600 transition-colors italic uppercase tracking-tighter">{post.author.name}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            </Link>

            {isAuthor && (
              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <button onClick={() => setIsEditing(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">Edit</button>
                <button onClick={() => setShowConfirm(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all">Delete</button>
              </div>
            )}
          </div>

          <div className="px-6 pb-4">
            <p className="text-slate-600 leading-relaxed text-[15px] font-medium">{post.caption}</p>
          </div>

          {post.imageUrl && (
            <div className="px-4 pb-4">
              <div className="rounded-[24px] overflow-hidden border border-slate-100 bg-slate-50 relative group/img">
                <img src={post.imageUrl} className="w-full h-auto object-cover max-h-[600px] transition-transform duration-700 group-hover/img:scale-[1.02]" alt="" />
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={handleLike} className="flex items-center gap-2 group">
                <Heart size={22} className={`transition-all ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-300 group-hover:text-slate-500'}`} />
                <span className={`text-sm font-black ${isLiked ? 'text-rose-600' : 'text-slate-400'}`}>{likesCount}</span>
              </button>

              <button onClick={loadComments} className="flex items-center gap-2 group">
                <MessageCircle size={22} className={`transition-all ${showComments ? 'text-indigo-600 fill-indigo-50' : 'text-slate-300 group-hover:text-slate-500'}`} />
                <span className={`text-sm font-black ${showComments ? 'text-indigo-600' : 'text-slate-400'}`}>{commentsCount}</span>
              </button>
            </div>
            <button className="text-slate-300 hover:text-slate-900 transition-colors"><Bookmark size={22} /></button>
          </div>

          {showComments && (
            <div className="px-6 pb-6 pt-4 bg-slate-50/50 border-t border-slate-100">
              {/* COMMENTS LIST */}
              <div className="space-y-5 mt-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {commentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-indigo-500/50" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
                      Thread is currently silent.
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 items-start group/comment">
                      {/* LARGER, REFINED AVATAR */}
                      <Link
                        to={`/profile/${comment.author?.id || comment.author?._id}`}
                        className="shrink-0 pt-0.5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400 overflow-hidden shadow-sm group-hover/comment:border-indigo-200 transition-all duration-300">
                          {comment.author?.avatar ? (
                            <img
                              src={comment.author.avatar}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/comment:scale-110"
                              alt={comment.author?.name}
                            />
                          ) : (
                            <span className="uppercase">{comment.author?.name[0]}</span>
                          )}
                        </div>
                      </Link>

                      {/* SUBSTANTIAL COMMENT BUBBLE */}
                      <div className="flex-1 bg-white px-5 py-4 rounded-[24px] rounded-tl-none border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] transition-all group-hover/comment:shadow-md">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/profile/${comment.author?.id || comment.author?._id}`}
                              className="font-black text-indigo-600 uppercase text-[11px] tracking-tight hover:underline"
                            >
                              {comment.author?.name}
                            </Link>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                              {/* Optional: Add timestamp logic here if available */}
                              Just now
                            </span>
                          </div>
                          <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* INPUT SECTION */}
              <form
                onSubmit={handleCommentSubmit}
                className="mt-6 flex items-center gap-3 bg-white p-2 pl-5 rounded-[22px] border border-slate-200 focus-within:ring-8 focus-within:ring-indigo-500/5 focus-within:border-indigo-200 transition-all shadow-sm"
              >
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-300 font-medium"
                />
                <button
                  disabled={!newComment.trim()}
                  className="bg-slate-900 text-white p-3 rounded-[16px] hover:bg-indigo-600 disabled:opacity-10 transition-all active:scale-90 shadow-lg shadow-slate-100"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PostCard;