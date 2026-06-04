import api from '@/lib/api/axios';
import type { ApiResponse, Comment } from '@/lib/types';

// ============================================================
// Comments API
// ============================================================

/**
 * Fetch comments, optionally filtered by laporan ID.
 */
export async function getComments(
  laporanId?: number,
): Promise<ApiResponse<Comment[]>> {
  const { data } = await api.get<ApiResponse<Comment[]>>('/comments', {
    params: laporanId ? { laporan_id: laporanId } : undefined,
  });
  return data;
}

/**
 * Create a new comment on a laporan.
 */
export async function createComment(
  laporanId: number,
  comment: string,
): Promise<ApiResponse<Comment>> {
  const { data } = await api.post<ApiResponse<Comment>>('/comments', {
    laporan_id: laporanId,
    comment,
  });
  return data;
}

/**
 * Delete a comment by its ID.
 */
export async function deleteComment(
  id: number,
): Promise<ApiResponse<null>> {
  const { data } = await api.delete<ApiResponse<null>>(`/comments/${id}`);
  return data;
}
