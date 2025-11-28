import axios from 'axios';

const API_URL = import.meta.env.API_BASE_URL

const client = axios.create({
  baseURL: API_URL,
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

export const mcqAPI = {
  // Mentor routes
  getQuestions: (entryId) => client.get(`/mcq/entries/${entryId}/questions`),
  createQuestion: (entryId, data) => client.post(`/mcq/entries/${entryId}/questions`, data),
  updateQuestion: (questionId, data) => client.put(`/mcq/questions/${questionId}`, data),
  deleteQuestion: (questionId) => client.delete(`/mcq/questions/${questionId}`),
  getStudentAnswers: (entryId) => client.get(`/mcq/entries/${entryId}/student-answers`),
  
  // Student routes
  getQuestionsForStudent: (entryId) => client.get(`/mcq/entries/${entryId}/questions/student`),
  submitAnswers: (entryId, answers) => client.post(`/mcq/entries/${entryId}/answers`, answers),
  getMyAnswers: (entryId) => client.get(`/mcq/entries/${entryId}/answers`),
};

// Generic API export for components that need the axios client directly
export const api = client;

export default client;
