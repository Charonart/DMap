import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Crucial for HttpOnly cookies
});

// Response interceptor to handle errors globally and format response
api.interceptors.response.use(
  (response) => {
    // We can extract the typical { status, data, message } wrapper here if we want,
    // or let the react-query fetchers handle it. For now, returning entire response.
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle Unauthorized globally
      // In Phase 4, we will trigger the Zustand useAuthStore's clearAuth here
      // and potentially pop up the login modal without redirecting.
      console.warn('Unauthorized request. User needs to log in.');
    }
    return Promise.reject(error);
  }
);

export default api;
