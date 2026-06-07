import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// Types
// ============================================================
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Laporan {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  image: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user?: User;
  category?: Category;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  laporan_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: User;
  laporan?: Laporan;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    total_pages: number;
    current_page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LaporanParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// ============================================================
// API Configuration
// ============================================================

// Android emulator uses 10.0.2.2 to access host's localhost. iOS uses localhost.
// Change this URL if deploying or testing on a physical device on the same WiFi network.
export const DEFAULT_API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_PORT = '3001';

// We can load a custom IP if saved in AsyncStorage, otherwise fallback to default
let apiBaseUrl = `http://${DEFAULT_API_HOST}:${API_PORT}`;

export const getApiBaseUrl = async () => {
  try {
    const customHost = await AsyncStorage.getItem('custom_api_host');
    if (customHost) {
      return `http://${customHost}:${API_PORT}`;
    }
  } catch (e) {
    // Ignore error
  }
  return `http://${DEFAULT_API_HOST}:${API_PORT}`;
};

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject baseURL asynchronously before each request
api.interceptors.request.use(
  async (config) => {
    const activeBaseUrl = await getApiBaseUrl();
    config.baseURL = activeBaseUrl;

    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to clear auth on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// Auth API Endpoints
// ============================================================
export async function login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function register(payload: RegisterData): Promise<ApiResponse<{ token: string; user: User }>> {
  const { data } = await api.post('/auth/register', { ...payload, role: 'user' });
  return data;
}

export async function getMe(): Promise<ApiResponse<User>> {
  const { data } = await api.get('/auth/me');
  return data;
}

// ============================================================
// Categories API Endpoints
// ============================================================
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const { data } = await api.get('/categories');
  return data;
}

// ============================================================
// Laporan API Endpoints
// ============================================================
export async function getLaporan(params?: LaporanParams): Promise<PaginatedResponse<Laporan>> {
  const { data } = await api.get('/laporan', { params });
  return data;
}

export async function getLaporanById(id: number): Promise<ApiResponse<Laporan>> {
  const { data } = await api.get(`/laporan/${id}`);
  return data;
}

export async function createLaporan(formData: FormData): Promise<ApiResponse<Laporan>> {
  const { data } = await api.post('/laporan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateLaporan(id: number, formData: FormData): Promise<ApiResponse<Laporan>> {
  const { data } = await api.put(`/laporan/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteLaporan(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/laporan/${id}`);
  return data;
}

// ============================================================
// Comments API Endpoints
// ============================================================
export async function getComments(laporanId?: number): Promise<ApiResponse<Comment[]>> {
  const { data } = await api.get('/comments', {
    params: laporanId ? { laporan_id: laporanId } : undefined,
  });
  return data;
}

export async function createComment(laporanId: number, comment: string): Promise<ApiResponse<Comment>> {
  const { data } = await api.post('/comments', {
    laporan_id: laporanId,
    comment,
  });
  return data;
}

export async function deleteComment(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/comments/${id}`);
  return data;
}

// ============================================================
// Shared helper: build full image URL from image path
// ============================================================
export function buildImageUrl(baseUrl: string, imagePath: string | null): string | null {
  if (!imagePath || !baseUrl) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const cleaned = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  if (cleaned.startsWith('uploads/')) return `${baseUrl}/${cleaned}`;
  return `${baseUrl}/uploads/${cleaned}`;
}

// ============================================================
// Users API Endpoints (restricted to super_admin)
// ============================================================
export async function getUsers(): Promise<ApiResponse<User[]>> {
  const { data } = await api.get('/users');
  return data;
}

export async function createUser(payload: RegisterData & { role: 'user' | 'admin' | 'super_admin' }): Promise<ApiResponse<User>> {
  const { data } = await api.post('/users', payload);
  return data;
}

export async function updateUser(id: number, payload: Partial<User>): Promise<ApiResponse<User>> {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: number): Promise<ApiResponse<null>> {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}
