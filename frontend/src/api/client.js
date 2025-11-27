import axios from 'axios';

const API_BASE_URL = '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
};

export const entriesAPI = {
  create: (data) => client.post('/entries', data),
  getAll: (params) => client.get('/entries', { params }),
  getById: (id) => client.get(`/entries/${id}`),
  update: (id, data) => client.put(`/entries/${id}`, data),
  delete: (id) => client.delete(`/entries/${id}`),
  updateStatus: (id, status) => client.patch(`/entries/${id}/status`, { status }),
};

export const commentsAPI = {
  add: (entryId, data) => client.post(`/entries/${entryId}/comments`, data),
  getAll: (entryId) => client.get(`/entries/${entryId}/comments`),
};

export const tasksAPI = {
  create: (data) => client.post('/tasks', data),
  getAll: (params) => client.get('/tasks', { params }),
  update: (id, data) => client.put(`/tasks/${id}`, data),
  delete: (id) => client.delete(`/tasks/${id}`),
};

export const mentorAPI = {
  getStudents: () => client.get('/mentor/students'),
  getAnalytics: () => client.get('/mentor/analytics'),
  getStreak: (studentId) => client.get(`/mentor/student/${studentId}/streak`),
};

export const studentAPI = {
  getDashboard: () => client.get('/student/dashboard'),
};

// Generic API export for components that need the axios client directly
export const api = client;

export default client;
