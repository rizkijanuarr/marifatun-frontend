import axios from 'axios';
import { AUTH_TOKEN_STORAGE_KEY, BASE_URL } from '../common/Constant';

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12_000,
});

httpClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  return config;
});
