/**
 * Format a date string into a short, human-readable Indonesian date.
 * Example: "12 Jun 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date string into date + time in Indonesian locale.
 * Example: "12 Jun 2026, 14:30"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  const datePart = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timePart = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${datePart}, ${timePart}`;
}

/**
 * Return a relative "time ago" string in Indonesian.
 * Examples: "baru saja", "5 menit yang lalu", "2 jam yang lalu",
 *           "3 hari yang lalu", "2 minggu yang lalu", "1 bulan yang lalu"
 */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  if (diffWeeks < 5) return `${diffWeeks} minggu yang lalu`;
  if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;

  return `${diffYears} tahun yang lalu`;
}
