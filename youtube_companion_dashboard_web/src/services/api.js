import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://youtube-companion-dashboard-sigma.vercel.app/';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Video API methods
export const videoAPI = {
  // Get video details
  getVideoDetails: (videoId) => api.get(`/videos/${videoId}`),
  
  // Update video title and description
  updateVideo: (videoId, data) => api.put(`/videos/${videoId}`, data),
  
  // Get video comments
  getComments: (videoId, maxResults = 100) => 
    api.get(`/videos/${videoId}/comments`, { params: { maxResults } }),
  
  // Add comment
  addComment: (videoId, text) => 
    api.post(`/videos/${videoId}/comments`, { text }),
  
  // Add reply
  addReply: (commentId, text) => 
    api.post(`/videos/comments/${commentId}/replies`, { text }),
  
  // Delete comment
  deleteComment: (commentId) => 
    api.delete(`/videos/comments/${commentId}`),
  
  // Delete reply
  deleteReply: (replyId) => 
    api.delete(`/videos/comments/${replyId}/reply`),
};

// Notes API methods
export const notesAPI = {
  // Get all notes for a video
  getNotes: (videoId) => api.get(`/${videoId}/notes`),
  
  // Get notes by category
  getNotesByCategory: (videoId, category) => 
    api.get(`/${videoId}/notes/category`, { params: { category } }),
  
  // Get notes by priority
  getNotesByPriority: (videoId, priority) => 
    api.get(`/${videoId}/notes/priority`, { params: { priority } }),
  
  // Create note
  createNote: (videoId, data) => api.post(`/${videoId}/notes`, data),
  
  // Get single note
  getNote: (noteId) => api.get(`/notes/${noteId}`),
  
  // Update note
  updateNote: (noteId, data) => api.put(`/notes/${noteId}`, data),
  
  // Delete note
  deleteNote: (noteId) => api.delete(`/notes/${noteId}`),
  
  // Toggle note completion
  toggleCompletion: (noteId) => api.patch(`/notes/${noteId}/toggle`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 