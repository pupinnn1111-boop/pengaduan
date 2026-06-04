// ============================================================
// User
// ============================================================
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

// ============================================================
// Category
// ============================================================
export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Laporan (Report)
// ============================================================
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

// ============================================================
// Comment
// ============================================================
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

// ============================================================
// API Response Wrappers
// ============================================================
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// ============================================================
// Auth DTOs
// ============================================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// ============================================================
// Laporan Query & Mutation DTOs
// ============================================================
export interface LaporanParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateLaporanData {
  title: string;
  description: string;
  category_id: number;
  image?: File;
}
