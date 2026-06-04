import api from '@/lib/api/axios';
import type { ApiResponse, Category } from '@/lib/types';

// ============================================================
// Categories API
// ============================================================

/**
 * Fetch all available categories.
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const { data } = await api.get<ApiResponse<Category[]>>('/categories');
  return data;
}
