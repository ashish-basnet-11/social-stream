// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (email, code) => api.post('/auth/verify-email', { email, code }),
  resendCode: (email) => api.post('/auth/resend-code', { email }),
  // OAuth
  googleLogin: () => window.location.href = `${API_URL}/auth/google`,
  getOAuthUser: () => api.get('/auth/oauth/user'),
  checkAuth: () => api.get('/auth/check'),
};

// Posts endpoints
export const postsAPI = {
  getAll: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId, page = 1) => api.get(`/posts/user/${userId}?page=${page}`),
  create: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, postData) => api.put(`/posts/${id}`, postData),
  delete: (id) => api.delete(`/posts/${id}`),
};

// Likes endpoints
export const likesAPI = {
  toggle: (postId) => api.post(`/likes/${postId}`),
  getPostLikes: (postId) => api.get(`/likes/${postId}`),
};

// Comments endpoints
export const commentsAPI = {
  getPostComments: (postId, page = 1) => api.get(`/comments/${postId}?page=${page}`),
  create: (postId, content) => api.post(`/comments/${postId}`, { content }),
  update: (id, content) => api.put(`/comments/${id}`, { content }),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Users endpoints
export const usersAPI = {
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (data) => api.put('/users/me', data),
  uploadAvatar: (formData) => api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
  
  // ADD THIS: For the "New Discoveries" sidebar
  getSuggestions: () => api.get('/users/suggestions'),
};

// Friends endpoints
export const friendsAPI = {
  // Note: updated the name to 'sendRequest' to match your Home.jsx usage 
  // or you can change Home.jsx to use friendsAPI.sendRequest
  sendRequest: (receiverId) => api.post('/friends/request', { receiverId }),
  
  acceptRequest: (requestId) => api.put(`/friends/request/${requestId}/accept`),
  rejectRequest: (requestId) => api.put(`/friends/request/${requestId}/reject`),
  cancelRequest: (requestId) => api.delete(`/friends/request/${requestId}`),
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
  getPendingRequests: () => api.get('/friends/requests/pending'),
  getFriends: () => api.get('/friends'),
};
export default api;