'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { getLaporan } from '@/lib/api/laporan';
import Card from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import StatCard from '@/components/ui/StatCard';
import { formatDate } from '@/lib/utils/formatDate';
import { ROLE_LABELS } from '@/lib/utils/constants';
import { 
  HiUser, 
  HiEnvelope, 
  HiShieldCheck, 
  HiCalendar,
  HiDocumentText,
  HiClock,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        // Fetch stats based on current user's reports (backend automatically filters own reports for 'user' role)
        const [resTotal, resPending, resApproved, resRejected] = await Promise.all([
          getLaporan({ limit: 1 }),
          getLaporan({ status: 'pending', limit: 1 }),
          getLaporan({ status: 'approved', limit: 1 }),
          getLaporan({ status: 'rejected', limit: 1 }),
        ]);

        setStats({
          total: resTotal.pagination?.total || 0,
          pending: resPending.pagination?.total || 0,
          approved: resApproved.pagination?.total || 0,
          rejected: resRejected.pagination?.total || 0,
        });
      } catch {
        toast.error('Gagal memuat statistik profil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">Profil Saya</h1>
        <p className="text-sm text-text-secondary mt-0.5">Informasi akun personal Anda dan riwayat aktivitas pelaporan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card (1 col) */}
        <div className="lg:col-span-1">
          <Card className="p-6 md:p-8 flex flex-col items-center text-center border border-border" hover={false}>
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center font-bold text-3xl shadow-soft mb-4">
              {user?.username.substring(0, 2).toUpperCase()}
            </div>
            
            <h2 className="text-lg font-bold text-text-primary">{user?.username}</h2>
            <p className="text-xs text-text-secondary capitalize mt-0.5 bg-background px-3 py-1 rounded-full border border-border inline-block">
              {ROLE_LABELS[user?.role || 'user']}
            </p>

            {/* User details list */}
            <div className="w-full mt-8 space-y-4 border-t border-border pt-6 text-left">
              {/* Username */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background text-text-secondary">
                  <HiUser className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-medium uppercase leading-none">Nama Pengguna</p>
                  <p className="text-sm font-semibold text-text-primary mt-1 truncate">{user?.username}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background text-text-secondary">
                  <HiEnvelope className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-medium uppercase leading-none">Alamat Email</p>
                  <p className="text-sm font-semibold text-text-primary mt-1 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background text-text-secondary">
                  <HiShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-medium uppercase leading-none">Hak Akses</p>
                  <p className="text-sm font-semibold text-text-primary mt-1 capitalize">{user?.role.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Joined At */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background text-text-secondary">
                  <HiCalendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-medium uppercase leading-none">Bergabung Pada</p>
                  <p className="text-sm font-semibold text-text-primary mt-1">{user?.created_at ? formatDate(user.created_at) : '-'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats and activity (2 col) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Statistik Aktivitas</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse shadow-soft" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                label="Total Laporan Anda"
                value={stats.total}
                icon={<HiDocumentText className="h-6 w-6" />}
                color="blue"
              />
              <StatCard
                label="Menunggu Verifikasi"
                value={stats.pending}
                icon={<HiClock className="h-6 w-6" />}
                color="yellow"
              />
              <StatCard
                label="Laporan Disetujui"
                value={stats.approved}
                icon={<HiCheckCircle className="h-6 w-6" />}
                color="green"
              />
              <StatCard
                label="Laporan Ditolak"
                value={stats.rejected}
                icon={<HiXCircle className="h-6 w-6" />}
                color="red"
              />
            </div>
          )}

          {/* Guidelines info card */}
          <Card className="p-6 border border-border" hover={false}>
            <h3 className="text-base font-bold text-text-primary mb-2">Keamanan Akun</h3>
            <p className="text-sm text-text-secondary leading-normal">
              Informasi data akun Anda dilindungi secara enkripsi oleh sistem. Jika Anda mengalami kendala atau membutuhkan perubahan email akun, silakan hubungi bagian Administrator melalui kanal bantuan resmi pemerintah setempat.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
