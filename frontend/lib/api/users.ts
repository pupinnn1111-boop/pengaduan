import api from '@/lib/api/axios';
import type { ApiResponse, User } from '@/lib/types';

// ============================================================
// Users API (Admin)
// ============================================================

/**
 * Fetch all users. Typically restricted to admin / super_admin roles.
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
  const { data } = await api.get<ApiResponse<User[]>>('/users');
  return data;
}

/**
 * Update a user by ID (e.g. change role).
 */
export async function updateUser(
  id: number,
  payload: Partial<User>,
): Promise<ApiResponse<User>> {
  const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
  return data;
}

/**
 * Delete a user by ID.
 */
export async function deleteUser(
  id: number,
): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/users/${id}`);
  return data;
}
