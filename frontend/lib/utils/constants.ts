// ============================================================
// API Base URL
// ============================================================
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================
// Laporan Status Mappings
// ============================================================
export const STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
};

// ============================================================
// User Role Mappings
// ============================================================
export const ROLE_LABELS: Record<string, string> = {
  user: 'Pengguna',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  user: { bg: 'bg-blue-50', text: 'text-blue-700' },
  admin: { bg: 'bg-purple-50', text: 'text-purple-700' },
  super_admin: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
};
