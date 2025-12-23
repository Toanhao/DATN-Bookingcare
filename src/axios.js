import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  // withCredentials: true
});

// Request interceptor để tự động thêm token vào header
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


instance.interceptors.response.use(
  (response) => {
    // Thrown error for request with OK status code
    // Use destructured data so eslint recognizes it as used.
    return response.data;
  },
  (error) => {
    // Error handler
    if (error.response) {
      // Server responded with error status
      return Promise.reject(error.response.data || error);
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject(error);
    } else {
      // Error in request setup
      return Promise.reject(error);
    }
  }
);

export default instance;
