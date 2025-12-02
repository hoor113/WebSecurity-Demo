import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  const csrfToken = localStorage.getItem('csrfToken');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

export const getCsrfToken = async () => { 
  const response = await api.get('/csrf-token');
  localStorage.setItem('csrfToken', response.data.csrfToken); 
  return response.data.csrfToken;
};

export const getSessionInfo = async () => {
  const response = await api.get('/session-info');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  const jwtToken = response.data.token;
  if (jwtToken) {
    localStorage.setItem('jwtToken', jwtToken);
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export default api;