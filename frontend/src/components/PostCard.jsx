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
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{post.title}</h3>
          <p className="text-sm text-gray-500">by {post.author.name}</p>
        </div>
        {isAuthor && (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800 text-sm">
              Edit
            </button>
            <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm">
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4">{post.content}</p>

      <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
        <button onClick={handleLike} className={`flex items-center gap-1 ${isLiked ? 'text-red-600' : 'hover:text-red-600'}`}>
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>
        
        <button onClick={loadComments} className="flex items-center gap-1 hover:text-blue-600">
          <span>💬</span>
          <span>{commentsCount}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t pt-4">
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </form>

          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-semibold">{comment.author.name}</p>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;