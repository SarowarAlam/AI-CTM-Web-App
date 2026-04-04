import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.',
        originalError: error,
      });
    }

    // Handle specific HTTP status codes
    const { status, data } = error.response;
    let userMessage = 'An unexpected error occurred.';

    switch (status) {
      case 400:
        userMessage = data?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        userMessage = 'Your session has expired. Please log in again.';
        // Optionally redirect to login
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        break;
      case 403:
        userMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        userMessage = 'The requested resource was not found.';
        break;
      case 422:
        userMessage = data?.message || 'Validation error. Please check your data.';
        break;
      case 500:
        userMessage = 'Server error. Please try again later.';
        break;
      default:
        userMessage = data?.message || 'Something went wrong. Please try again.';
    }

    return Promise.reject({
      message: userMessage,
      status,
      originalError: error,
    });
  }
);

export default api;