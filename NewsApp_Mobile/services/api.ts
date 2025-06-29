import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/constants/Config';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      // You might want to redirect to login here
      // For now, just reject the promise
    }
    
    // Log error for debugging (only in development)
    if (__DEV__) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  getMe: () => api.get('/auth/me'),

  updateProfile: (profileData: any) => api.put('/auth/profile', profileData),
};

// User API
export const userAPI = {
  getPreferences: () => api.get('/user/preferences'),

  updatePreferences: (preferences: any) =>
    api.put('/user/preferences', preferences),

  getReadingHistory: (page = 1, limit = 20) =>
    api.get(`/user/reading-history?page=${page}&limit=${limit}`),

  addToReadingHistory: (articleData: {
    article_id: string;
    title: string;
    description?: string;
    image_url?: string;
    source_name?: string;
    source_url?: string;
    link: string;
    category?: string[];
    pubDate?: string;
    readingTime?: number;
  }) => api.post('/user/reading-history', articleData),

  clearReadingHistory: () => api.delete('/user/reading-history'),

  getUserStats: () => api.get('/user/stats'),
};

// Bookmarks API
export const bookmarksAPI = {
  getBookmarks: (page = 1, limit = 20) =>
    api.get(`/user/bookmarks?page=${page}&limit=${limit}`),

  addBookmark: (articleData: {
    article_id: string;
    title: string;
    description?: string;
    image_url?: string;
    source_name?: string;
    source_url?: string;
    link: string;
    category?: string[];
    pubDate?: string;
  }) => api.post('/user/bookmarks', articleData),

  removeBookmark: (article_id: string) =>
    api.delete(`/user/bookmarks/${article_id}`),

  checkBookmark: (article_id: string) =>
    api.get(`/user/bookmarks/check/${article_id}`),

  clearBookmarks: () => api.delete('/user/bookmarks'),
};

// News API
export const newsAPI = {
  getCachedNews: (category = 'general', type = 'latest') =>
    api.get(`/news/cached/${category}?type=${type}`),

  getBreakingNews: () => api.get('/news/breaking'),

  getPopularArticles: (days = 7) =>
    api.get(`/news/popular?days=${days}`),

  trackArticleView: (data: {
    article_id: string;
    category?: string;
    title?: string;
  }) => api.post('/news/track-view', data),

  trackCategoryView: (data: { category: string }) =>
    api.post('/news/track-category', data),
};

// Comments API
export const commentsAPI = {
  getComments: (article_id: string, page = 1, limit = 20, sort = 'newest') =>
    api.get(`/comments/${article_id}?page=${page}&limit=${limit}&sort=${sort}`),

  getReplies: (comment_id: string, page = 1, limit = 10) =>
    api.get(`/comments/${comment_id}/replies?page=${page}&limit=${limit}`),

  addComment: (data: {
    article_id: string;
    content: string;
    parent_id?: string;
  }) => api.post('/comments', data),

  updateComment: (comment_id: string, data: { content: string }) =>
    api.put(`/comments/${comment_id}`, data),

  deleteComment: (comment_id: string) =>
    api.delete(`/comments/${comment_id}`),

  toggleLike: (comment_id: string) =>
    api.post(`/comments/${comment_id}/like`),

  toggleDislike: (comment_id: string) =>
    api.post(`/comments/${comment_id}/dislike`),
};

export default api; 