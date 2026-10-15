import axios from 'axios';
import { getToken, removeToken } from '../utils/helpers';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
