import api from '@/lib/api/axios';
import type {
  ApiResponse,
  Laporan,
  LaporanParams,
  PaginatedResponse,
} from '@/lib/types';

// ============================================================
// Laporan API
// ============================================================

/**
 * Fetch a paginated, filterable list of laporan.
 */
export async function getLaporan(
  params?: LaporanParams,
): Promise<PaginatedResponse<Laporan>> {
  const { data } = await api.get<PaginatedResponse<Laporan>>('/laporan', {
    params,
  });
  return data;
}

/**
 * Fetch a single laporan by its ID (includes User, Category, Comments).
 */
export async function getLaporanById(
  id: number,
): Promise<ApiResponse<Laporan>> {
  const { data } = await api.get<ApiResponse<Laporan>>(`/laporan/${id}`);
  return data;
}

/**
 * Create a new laporan. Accepts FormData so images can be uploaded.
 */
export async function createLaporan(
  formData: FormData,
): Promise<ApiResponse<Laporan>> {
  const { data } = await api.post<ApiResponse<Laporan>>('/laporan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * Update an existing laporan. Accepts FormData for optional image replacement.
 */
export async function updateLaporan(
  id: number,
  formData: FormData,
): Promise<ApiResponse<Laporan>> {
  const { data } = await api.put<ApiResponse<Laporan>>(
    `/laporan/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/**
 * Delete a laporan by its ID.
 */
export async function deleteLaporan(
  id: number,
): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/laporan/${id}`);
  return data;
}
