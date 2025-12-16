// src/components/CreatePost.jsx
import { useState } from 'react';
import { postsAPI } from '../services/api';

const CreatePost = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ... LOGIC REMAINS ...
      await postsAPI.create(formData);
      setFormData({ title: '', content: '' });
      onPostCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    // REVAMP: Glass card style
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">What's on your mind?</h2>
      
      {error && (
        // Error style matching auth pages
        <div className="mb-4 rounded-lg bg-red-800/70 p-4 border border-red-500 shadow-lg">
          <p className="text-sm font-medium text-white">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="title"
            placeholder="Post title..."
            value={formData.title}
            onChange={handleChange}
            required
            // Input style matching auth pages
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner"
          />
        </div>
        
        <div>
          <textarea
            name="content"
            placeholder="Share your thoughts..."
            value={formData.content}
            onChange={handleChange}
            required
            rows="3"
            // Input style matching auth pages
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 sm:text-sm transition duration-150 shadow-inner resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          // Button style matching auth pages
          className="w-full py-3 px-4 border border-transparent text-lg font-bold rounded-xl text-gray-900 bg-teal-400 hover:bg-teal-300 shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.005] focus:ring-offset-gray-900"
        >
          {loading ? 'POSTING...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;