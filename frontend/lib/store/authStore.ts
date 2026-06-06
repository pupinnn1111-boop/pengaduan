'use client';

import { create } from 'zustand';
import type { LoginCredentials, RegisterData, User } from '@/lib/types';
import * as authApi from '@/lib/api/auth';
import { AxiosError } from 'axios';

// ============================================================
// Helpers
// ============================================================

/** Extract a readable error message from an Axios error or fallback. */
function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan pada server'
    );
  }
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan yang tidak diketahui';
}

// ============================================================
// Store Types
// ============================================================

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  /** Derived — true when both token and user are present. */
  isAuthenticated: () => boolean;

  /** Authenticate with email + password. Returns error message on failure. */
  login: (credentials: LoginCredentials) => Promise<string | null>;

  /** Register a new account. Returns error message on failure. */
  register: (data: RegisterData) => Promise<string | null>;

  /** Clear all auth state and redirect to /login. */
  logout: () => void;

  /** Fetch the current user via GET /auth/me. */
  fetchUser: () => Promise<void>;

  /**
   * Initialise from localStorage on app mount.
   * If a token exists, fetches the user profile.
   */
  initialize: () => Promise<void>;
}

// ============================================================
// Store Implementation
// ============================================================

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true, // starts true so the first render can show a loader

  isAuthenticated: () => {
    const { token, user } = get();
    return !!token && !!user;
  },

  // -------------------------------------------------------
  // Login
  // -------------------------------------------------------
  login: async (credentials) => {
    try {
      set({ isLoading: true });

      const response = await authApi.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token, user, isLoading: false });
      return null; // no error
    } catch (error) {
      set({ isLoading: false });
      return extractErrorMessage(error);
    }
  },

  // -------------------------------------------------------
  // Register
  // -------------------------------------------------------
  register: async (data) => {
    try {
      set({ isLoading: true });
  
      const response = await authApi.register(data);
  
      set({ isLoading: false });
  
      return response.success ? null : 'Gagal mendaftar';
    } catch (error) {
      set({ isLoading: false });
      return extractErrorMessage(error);
    }
  },

  // -------------------------------------------------------
  // Logout
  // -------------------------------------------------------
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoading: false });

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // -------------------------------------------------------
  // Fetch User (refresh profile from API)
  // -------------------------------------------------------
  fetchUser: async () => {
    try {
      const response = await authApi.getMe();
      const user = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch {
      // Token is likely invalid / expired – clear everything
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  },

  // -------------------------------------------------------
  // Initialize (call once on app mount)
  // -------------------------------------------------------
  initialize: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      set({ isLoading: false });
      return;
    }

    set({ token, isLoading: true });

    try {
      const response = await authApi.getMe();
      const user = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
    } catch {
      // Stored token is invalid – clean up
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
