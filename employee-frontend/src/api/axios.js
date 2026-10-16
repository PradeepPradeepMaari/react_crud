import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
  },
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422) {
      error.validationErrors = error.response.data.errors || {};
    }
    return Promise.reject(error);
  }
);

export default api;
