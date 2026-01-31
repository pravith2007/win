import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  // Use localhost to match backend CORS allow_origins
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;