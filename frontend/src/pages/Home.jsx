// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import Navbar from '../components/Navbar';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll(page);
      setPosts(response.data.data.posts);
      setTotalPages(response.data.data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setPage(1);
    fetchPosts();
  };

  const handlePostDeleted = () => {
    fetchPosts();
  };

  const handlePostUpdated = () => {
    fetchPosts();
  };

 if (loading && posts.length === 0) {
    return (
      <>
        <Navbar />
        {/* Loading spinner uses the background style */}
        <div className="min-h-screen flex items-center justify-center bg-gray-900" style={{ backgroundImage: 'radial-gradient(at 0% 0%, #2a3854 0%, #171923 100%)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
        </div>
      </>
    );
  }

  // MAIN RENDER
  return (
    <>
      <Navbar />
      {/* REVAMP: Apply dark gradient background to the main content area */}
      <div className="min-h-screen bg-gray-900 pb-16" style={{ backgroundImage: 'radial-gradient(at 0% 0%, #2a3854 0%, #171923 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <CreatePost onPostCreated={handlePostCreated} />
          
          {error && (
            // Error style matching auth pages
            <div className="mt-4 rounded-lg bg-red-800/70 p-4 border border-red-500 shadow-lg">
              <p className="text-sm font-medium text-white">{error}</p>
            </div>
          )}

          <div className="mt-8 space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No posts yet. Be the first to post!</p>
              </div>
            ) : (
              // ... Post mapping REMAINS ...
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handlePostDeleted}
                  onUpdate={handlePostUpdated}
                />
              ))
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                // Pagination button style
                className="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-300 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                // Pagination button style
                className="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;