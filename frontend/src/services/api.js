import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'
);

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Only redirect if not already on auth pages or landing
            const publicPaths = ['/login', '/register', '/'];
            if (!publicPaths.includes(window.location.pathname)) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
};

// Posts API
export const postAPI = {
    getAll: (filters = {}) => api.get('/posts', { params: filters }),
    getById: (id) => api.get(`/posts/${id}`),
    create: (postData) => api.post('/posts', postData),
    update: (id, postData) => api.put(`/posts/${id}`, postData),
    delete: (id) => api.delete(`/posts/${id}`),
    getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
};

// Users API
export const userAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (userData) => api.put('/users/profile', userData),
    changePassword: (passwordData) => api.put('/users/change-password', passwordData),
    getStats: (userId) => api.get(`/users/${userId}/stats`),
    getVerificationStatus: () => api.get('/users/verification/status'),
    submitVerification: (docs) => api.post('/users/verification/submit', docs),
    uploadAvatar: (formData) => api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteAvatar: () => api.delete('/users/avatar'),
};

// Comments API
export const commentAPI = {
    getPostComments: (postId) => api.get(`/comments/post/${postId}`),
    create: (commentData) => api.post('/comments', commentData),
    delete: (id) => api.delete(`/comments/${id}`),
};

// Messages API
export const messageAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (userId) => api.get(`/messages/user/${userId}`),
    send: (messageData) => api.post('/messages', messageData),
    delete: (id) => api.delete(`/messages/${id}`),
    getUnreadCount: () => api.get('/messages/unread/count'),
};

// Reports API
export const reportAPI = {
    create: (reportData) => api.post('/reports', reportData),
    getMyReports: () => api.get('/reports/my'),
};

// Admin API
export const adminAPI = {
    // Dashboard
    getStats: () => api.get('/admin/stats'),
    
    // Verifications
    getPendingVerifications: (params = {}) => api.get('/admin/verifications/pending', { params }),
    getVerificationDetails: (userId) => api.get(`/admin/verifications/${userId}`),
    approveVerification: (userId, note) => api.put(`/admin/verifications/${userId}/approve`, { note }),
    rejectVerification: (userId, reason) => api.put(`/admin/verifications/${userId}/reject`, { reason }),
    
    // Users
    getAllUsers: (params = {}) => api.get('/admin/users', { params }),
    getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
    banUser: (userId, reason) => api.put(`/admin/users/${userId}/ban`, { reason }),
    unbanUser: (userId) => api.put(`/admin/users/${userId}/unban`),
    
    // Reports
    getAllReports: (params = {}) => api.get('/admin/reports', { params }),
    getReportDetails: (reportId) => api.get(`/admin/reports/${reportId}`),
    updateReport: (reportId, data) => api.put(`/admin/reports/${reportId}`, data),
    
    // Posts
    getAllPosts: (params = {}) => api.get('/admin/posts', { params }),
    deletePost: (postId, reason) => api.delete(`/admin/posts/${postId}`, { data: { reason } }),
};

// Notifications API
export const notificationAPI = {
    getAll: (params = {}) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread/count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;