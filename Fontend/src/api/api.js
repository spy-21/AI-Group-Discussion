import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
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
            // Handle unauthorized access
            localStorage.removeItem('authToken');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Session API endpoints
export const sessionAPI = {
    // Create a new session
    create: (sessionData) => api.post('/sessions', sessionData),

    // Get session by ID
    getById: (sessionId) => api.get(`/sessions/${sessionId}`),

    // Update session
    update: (sessionId, updateData) => api.put(`/sessions/${sessionId}`, updateData),

    // Delete session
    delete: (sessionId) => api.delete(`/sessions/${sessionId}`),

    // Join session
    join: (sessionId, userData) => api.post(`/sessions/${sessionId}/join`, userData),

    // Leave session
    leave: (sessionId, userId) => api.post(`/sessions/${sessionId}/leave`, { userId }),

    // Get session participants
    getParticipants: (sessionId) => api.get(`/sessions/${sessionId}/participants`),

    // Get session reports
    getReports: (sessionId) => api.get(`/sessions/${sessionId}/reports`),
};

// User API endpoints
export const userAPI = {
    // Register user
    register: (userData) => api.post('/users/register', userData),

    // Login user
    login: (credentials) => api.post('/users/login', credentials),

    // Get user profile
    getProfile: () => api.get('/users/profile'),

    // Update user profile
    updateProfile: (userData) => api.put('/users/profile', userData),
};

// AI API endpoints
export const aiAPI = {
    // Generate AI response
    generateResponse: (context, participantId) =>
        api.post('/ai/generate-response', { context, participantId }),

    // Analyze conversation
    analyzeConversation: (sessionId) =>
        api.post(`/ai/analyze/${sessionId}`),

    // Get AI participant info
    getAIParticipants: () => api.get('/ai/participants'),
};

// WebRTC/Socket API endpoints
export const webrtcAPI = {
    // Get signaling server info
    getSignalingInfo: () => api.get('/webrtc/signaling-info'),

    // Get ICE servers
    getICEServers: () => api.get('/webrtc/ice-servers'),
};

export default api; 