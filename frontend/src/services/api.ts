import axios from 'axios';

// Hardcode the Render backend URL for now
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
<<<<<<< HEAD

=======
>>>>>>> 11fbfdca5dbd642b03f37de4cb98397e04654f5a

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
