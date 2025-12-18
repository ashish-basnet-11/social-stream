// frontend/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI, friendsAPI, postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [friendLoading, setFriendLoading] = useState(false);

  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getUserProfile(userId);
      setProfile(response.data.data.user);
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await postsAPI.getUserPosts(userId);
      setPosts(response.data.data.posts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  const handleSendFriendRequest = async () => {
    setFriendLoading(true);
    try {
      await friendsAPI.sendRequest(parseInt(userId));
      fetchProfile(); // Refresh to update friendship status
    } catch (err) {
      console.error('Failed to send friend request:', err);
    } finally {
      setFriendLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    
    setFriendLoading(true);
    try {
      await friendsAPI.removeFriend(parseInt(userId));
      fetchProfile();
    } catch (err) {
      console.error('Failed to remove friend:', err);
    } finally {
      setFriendLoading(false);
    }
  };

  const renderFriendButton = () => {
    if (isOwnProfile) return null;

    const { friendshipStatus } = profile;

    if (friendshipStatus === 'friends') {
      return (
        <button
          onClick={handleRemoveFriend}
          disabled={friendLoading}
          className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
        >
          {friendLoading ? 'Loading...' : 'Remove Friend'}
        </button>
      );
    }

    if (friendshipStatus === 'request_sent') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md cursor-not-allowed"
        >
          Request Sent
        </button>
      );
    }

    if (friendshipStatus === 'request_received') {
      return (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Respond to Request
        </button>
      );
    }

    return (
      <button
        onClick={handleSendFriendRequest}
        disabled={friendLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {friendLoading ? 'Sending...' : 'Add Friend'}
      </button>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">{error || 'Profile not found'}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                  {profile.bio && (
                    <p className="text-gray-700 mt-2">{profile.bio}</p>
                  )}
                </div>
              </div>
              {renderFriendButton()}
            </div>

            <div className="flex gap-6 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.postsCount}</div>
                <div className="text-gray-600 text-sm">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profile.friendsCount}</div>
                <div className="text-gray-600 text-sm">Friends</div>
              </div>
            </div>
          </div>

          {/* User's Posts */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              {isOwnProfile ? 'Your Posts' : `${profile.name}'s Posts`}
            </h2>
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No posts yet
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={fetchUserPosts}
                    onUpdate={fetchUserPosts}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;