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
};

// Posts endpoints
export const postsAPI = {
  getAll: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/posts/${id}`),
  getUserPosts: (userId, page = 1) => api.get(`/posts/user/${userId}?page=${page}`),
  create: (postData) => api.post('/posts', postData),
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

export default api;