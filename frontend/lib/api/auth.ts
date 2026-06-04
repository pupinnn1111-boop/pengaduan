import api from '@/lib/api/axios';
import type {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/lib/types';

// ============================================================
// Auth API
// ============================================================

/**
 * Authenticate a user with email + password.
 * Returns the JWT token and user object.
 */
export async function login(
  credentials: LoginCredentials,
): Promise<ApiResponse<{ token: string; user: User }>> {
  const { data } = await api.post<ApiResponse<{ token: string; user: User }>>(
    '/auth/login',
    credentials,
  );
  return data;
}

/**
 * Register a new user account.
 * Role is always set to 'user' on the client side.
 */
export async function register(
  payload: RegisterData,
): Promise<ApiResponse<{ token: string; user: User }>> {
  const { data } = await api.post<ApiResponse<{ token: string; user: User }>>(
    '/auth/register',
    { ...payload, role: 'user' },
  );
  return data;
}

/**
 * Fetch the currently authenticated user profile.
 */
export async function getMe(): Promise<ApiResponse<User>> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  return data;
}
