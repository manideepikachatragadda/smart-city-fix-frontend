import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const detail = error.response?.data?.detail;

        if (status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }

        // Import toast dynamically to avoid circular deps
        import('react-hot-toast').then(({ default: toast }) => {
            if (detail) {
                toast.error(typeof detail === 'string' ? detail : 'An error occurred');
            } else if (status >= 500) {
                toast.error('Server error. Please try again later.');
            }
        });

        return Promise.reject(error);
    }
);

// Auth login endpoint: application/x-www-form-urlencoded
export const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
};

// Forgot Password Flow
export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const verifyOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
};

export const resetPassword = async (email, otp, new_password) => {
    const response = await api.post('/auth/reset-password', {
        email,
        otp,
        new_password
    });
    return response.data;
};

// Public issue submission (supports optional image file upload)
export const submitComplaint = async (data, file = null) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        }
    });

    if (file) {
        formData.append('file', file);
    }

    const response = await api.post('/complaints/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
};

// Admin metrics
export const getDashboardMetrics = async () => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
};

// Admin ALL complaints list
export const getAdminComplaints = async () => {
    const response = await api.get('/admin/complaints');
    return response.data;
};

// Department specific complaints list
export const getDepartmentComplaints = async () => {
    const response = await api.get('/complaints/');
    return response.data;
};

// Get single complaint details
export const getComplaintDetails = async (complaintId) => {
    const response = await api.get(`/complaints/${complaintId}`);
    return response.data;
};

// Admin update complaint status
export const updateComplaintStatus = async (complaintId, newStatus) => {
    const response = await api.put(`/complaints/${complaintId}/status`, null, {
        params: { new_status: newStatus },
    });
    return response.data;
};

// Worker resolve complaint with proof-of-work image
export const resolveComplaint = async (complaintId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.put(`/complaints/${complaintId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// Manager review resolved complaint (approve or revert)
export const reviewComplaint = async (complaintId, action, reason = null) => {
    const params = { action };
    if (reason) params.reason = reason;
    const response = await api.put(`/complaints/${complaintId}/review`, null, { params });
    return response.data;
};

// Manager assign worker to complaint
export const assignWorker = async (complaintId, workerId) => {
    const response = await api.put(`/complaints/${complaintId}/assign/${workerId}`);
    return response.data;
};

// Public feedback
export const submitFeedback = async (complaintId, data) => {
    const response = await api.post(`/complaints/${complaintId}/feedback`, data);
    return response.data;
};

// Public tracking
export const trackComplaint = async (complaintId) => {
    const response = await api.get(`/complaints/track/${complaintId}`);
    return response.data;
};

// Admin create user
export const registerUser = async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

// Get current user details
export const getCurrentUser = async () => {
    const response = await api.get('/user/me');
    return response.data;
};

// Create staff (Admin/Manager only)
export const createStaff = async (data) => {
    const response = await api.post('/user/create-staff', data);
    return response.data;
};

// Update password
export const changePassword = async (data) => {
    const response = await api.put('/user/password', data);
    return response.data;
};

// Trigger escalations cron (Admin only)
export const triggerEscalations = async () => {
    const response = await api.post('/complaints/trigger-escalations');
    return response.data;
};

// Delete a complaint entirely (Admin only)
export const deleteComplaint = async (complaintId) => {
    const response = await api.delete(`/admin/complaints/${complaintId}`);
    return response.data;
};

// Get user hierarchy
export const getHierarchy = async () => {
    const response = await api.get('/user/hierarchy');
    return response.data;
};

// Get all users (Admin only)
export const getAllUsers = async () => {
    const response = await api.get('/user/all');
    return response.data;
};

// Manager: Get Team Members
export const getTeamMembers = async () => {
    const response = await api.get('/user/my-team');
    return response.data;
};

// Manager: Remove Worker
export const removeWorker = async (targetUserId) => {
    const response = await api.delete(`/user/${targetUserId}`);
    return response.data;
};

// Send direct push notification to a worker (Manager only)
export const sendMessageToWorker = async (workerData) => {
    const response = await api.post('/notifications/send-message', workerData);
    return response.data;
};

// Subscribe to push notifications
export const subscribePushNotification = async (subscription) => {
    const response = await api.post('/notifications/subscribe', subscription);
    return response.data;
};

// Health Check
export const checkHealth = async () => {
    const response = await api.get('/health');
    return response.data;
};

export default api;
