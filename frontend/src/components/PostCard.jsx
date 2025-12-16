// src/components/PostCard.jsx
import { useState } from 'react';
import { postsAPI, likesAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: post.title, content: post.content });
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
      // REVAMP: Edit mode card uses glass style
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            // Input style matching auth pages
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner"
          />
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            rows="3"
            // Input style matching auth pages
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner resize-none"
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

  // RENDER VIEW MODE
  return (
    // REVAMP: View mode card uses glass style
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{post.title}</h3>
          <p className="text-sm text-gray-400">by <span className="font-medium text-teal-400">{post.author.name}</span></p>
        </div>
        {isAuthor && (
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-teal-400 hover:text-teal-300 transition duration-150">
              Edit
            </button>
            <button onClick={handleDelete} className="text-sm font-medium text-red-500 hover:text-red-400 transition duration-150">
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Action bar and divider */}
      <div className="flex items-center gap-6 text-base text-gray-400 border-t border-white/10 pt-4">
        {/* Like Button */}
        <button onClick={handleLike} className={`flex items-center gap-1 font-medium transition duration-150 ${isLiked ? 'text-red-400' : 'hover:text-red-400'}`}>
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{likesCount} Likes</span>
        </button>
        
        {/* Comment Button */}
        <button onClick={loadComments} className="flex items-center gap-1 hover:text-teal-400 font-medium transition duration-150">
          <span>💬</span>
          <span>{commentsCount} Comments</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              // Input style matching glassmorphism inputs
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150"
            />
          </form>

          <div className="space-y-3">
            {comments.map((comment) => (
              // Comment bubble style
              <div key={comment.id} className="bg-gray-800/70 p-3 rounded-lg border border-gray-700/50">
                <p className="text-xs font-semibold text-teal-400">{comment.author.name}</p>
                <p className="text-sm text-gray-200">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;