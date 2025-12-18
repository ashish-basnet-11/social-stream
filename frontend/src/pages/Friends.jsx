// frontend/src/pages/Friends.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { friendsAPI, usersAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search'
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await friendsAPI.getFriends();
      setFriends(response.data.data.friends);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await friendsAPI.getPendingRequests();
      setRequests(response.data.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;

    setLoading(true);
    try {
      const response = await usersAPI.searchUsers(searchQuery);
      setSearchResults(response.data.data.users);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsAPI.acceptRequest(requestId);
      fetchRequests();
      fetchFriends();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendsAPI.rejectRequest(requestId);
      fetchRequests();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await friendsAPI.removeFriend(friendId);
      fetchFriends();
    } catch (err) {
      console.error('Failed to remove friend:', err);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId);
      alert('Friend request sent!');
    } catch (err) {
      console.error('Failed to send request:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <h1 className="text-3xl font-bold mb-6">Friends</h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'friends'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'requests'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Requests ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'search'
                    ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Find Friends
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'friends' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No friends yet. Start connecting!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <Link to={`/profile/${friend.id}`} className="flex items-center gap-4 hover:opacity-80">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{friend.name}</div>
                            <div className="text-sm text-gray-600">{friend.email}</div>
                          </div>
                        </Link>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <Link to={`/profile/${request.sender.id}`} className="flex items-center gap-4 hover:opacity-80">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {request.sender.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{request.sender.name}</div>
                            <div className="text-sm text-gray-600">{request.sender.email}</div>
                          </div>
                        </Link>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'search' && (
              <div className="p-6">
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {searchQuery ? 'No users found' : 'Search for users to connect'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <Link to={`/profile/${user.id}`} className="flex items-center gap-4 hover:opacity-80">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            {user.bio && <div className="text-sm text-gray-500">{user.bio}</div>}
                          </div>
                        </Link>
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add Friend
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Friends;