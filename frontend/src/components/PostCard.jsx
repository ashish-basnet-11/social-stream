// src/components/PostCard.jsx
import { useState } from 'react';
import { postsAPI, likesAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Using post.caption as the primary content now
  const [editData, setEditData] = useState({
    caption: post.caption || post.content || ''
  });
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);

  const isAuthor = user?.id === post.authorId;

  const handleLike = async () => {
    try {
      const response = await likesAPI.toggle(post.id);
      setIsLiked(response.data.data.isLiked);
      setLikesCount(response.data.data.likesCount);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.delete(post.id);
        onDelete();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await postsAPI.update(post.id, editData);
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await commentsAPI.create(post.id, newComment);
      setComments([response.data.data.comment, ...comments]);
      setNewComment('');
      setCommentsCount(prev => prev + 1);
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      try {
        const response = await commentsAPI.getPostComments(post.id);
        setComments(response.data.data.comments);
      } catch (err) {
        console.error('Load comments error:', err);
      }
    }
    setShowComments(!showComments);
  };

  if (isEditing) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <textarea
            value={editData.caption}
            onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
            rows="3"
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner resize-none"
            placeholder="Edit your caption..."
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-medium transition duration-150">
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition duration-150">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl overflow-hidden mb-6">
      {/* Author Header */}
      <div className="p-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
            {post.author.name[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{post.author.name}</p>
            <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        {isAuthor && (
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-teal-400 hover:text-teal-300">Edit</button>
            <button onClick={handleDelete} className="text-sm font-medium text-red-500 hover:text-red-400">Delete</button>
          </div>
        )}
      </div>

      {/* Post Image Section */}
      {post.imageUrl && (
        <div className="w-full bg-black/20 border-b border-white/5">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-auto max-h-[600px] object-contain mx-auto"
            // Added onError to handle broken Cloudinary links
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Post Content/Caption */}
      <div className="p-4">
        {post.caption && (
          <p className="text-gray-200 whitespace-pre-wrap text-base mb-4">
            {post.caption}
          </p>
        )}
        {/* Action Bar */}
        <div className="flex items-center gap-6 text-base text-gray-400 border-t border-white/10 pt-4">
          <button onClick={handleLike} className={`flex items-center gap-1 font-medium transition ${isLiked ? 'text-red-400' : 'hover:text-red-400'}`}>
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likesCount}</span>
          </button>

          <button onClick={loadComments} className="flex items-center gap-1 hover:text-teal-400 font-medium transition">
            <span>💬</span>
            <span>{commentsCount}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4">
            <form onSubmit={handleCommentSubmit}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-400"
              />
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-800/70 p-3 rounded-lg border border-gray-700/50">
                  <p className="text-xs font-semibold text-teal-400">{comment.author.name}</p>
                  <p className="text-sm text-gray-200">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;