import axios from 'axios';
import { ApiResponse, ApiError } from '@/types';
import { getApiConfig } from '@/config/api';

// Get API configuration
const apiConfig = getApiConfig();

const api = axios.create({
  baseURL: apiConfig.BASE_URL,
  timeout: apiConfig.TIMEOUT,
  headers: apiConfig.DEFAULT_HEADERS,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token when available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'Erro desconhecido',
      code: error.response?.status?.toString(),
      details: error.response?.data,
    };
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login when implemented
      localStorage.removeItem('authToken');
    }
    
    return Promise.reject(apiError);
  }
);

export default api;

// Generic API methods
export const apiGet = <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
  return api.get(url, { params });
};

export const apiPost = <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return api.post(url, data);
};

export const apiPut = <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return api.put(url, data);
};

export const apiDelete = <T>(url: string): Promise<ApiResponse<T>> => {
  return api.delete(url);
};

// File upload helper
export const apiUpload = <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};