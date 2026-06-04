'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { getLaporan } from '@/lib/api/laporan';
import type { Laporan } from '@/lib/types';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils/formatDate';
import { 
  HiDocumentText, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle,
  HiPlus,
  HiArrowRight
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentReports, setRecentReports] = useState<Laporan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch stats in parallel
      const [resTotal, resPending, resApproved, resRejected, resRecent] = await Promise.all([
        getLaporan({ limit: 1 }),
        getLaporan({ status: 'pending', limit: 1 }),
        getLaporan({ status: 'approved', limit: 1 }),
        getLaporan({ status: 'rejected', limit: 1 }),
        getLaporan({ limit: 5 }),
      ]);

      setStats({
        total: resTotal.pagination?.total || 0,
        pending: resPending.pagination?.total || 0,
        approved: resApproved.pagination?.total || 0,
        rejected: resRejected.pagination?.total || 0,
      });

      setRecentReports(resRecent.data || []);
    } catch {
      toast.error('Gagal mengambil data dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-soft">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Selamat Datang, {user?.username}!</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            {user?.role === 'user' 
              ? 'Kelola dan pantau status laporan pengaduan Anda dengan mudah. Suara Anda membantu perbaikan fasilitas publik.'
              : 'Pantau laporan masuk dari masyarakat, ubah status verifikasi, dan kelola komentar secara real-time.'}
          </p>
        </div>
        {user?.role === 'user' && (
          <Link href="/laporan/create" className="self-start md:self-auto">
            <Button variant="secondary" className="bg-white text-primary hover:bg-blue-50 font-semibold gap-2 border-none">
              <HiPlus className="h-5 w-5" />
              Tulis Pengaduan
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface rounded-2xl animate-pulse shadow-soft" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Laporan"
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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Laporan Terbaru</h2>
            <Link href="/laporan" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Semua Laporan
              <HiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <Card className="p-8 flex flex-col items-center justify-center">
              <EmptyState
                title="Belum Ada Laporan"
                description="Mulai laporkan pengaduan Anda untuk membantu memperbaiki layanan publik."
                action={
                  user?.role === 'user' ? (
                    <Link href="/laporan/create">
                      <Button variant="primary">Buat Laporan</Button>
                    </Link>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <Card 
                  key={report.id} 
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  hover
                  onClick={() => window.location.href = `/laporan/${report.id}`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge status={report.status} />
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-text-secondary font-medium bg-background px-2.5 py-1 rounded-full border border-border">
                        {report.category?.name || 'Kategori'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary text-base truncate pt-1">{report.title}</h3>
                    <p className="text-sm text-text-secondary line-clamp-1">{report.description}</p>
                    <div className="flex items-center gap-2 pt-2 text-xs text-text-muted">
                      <span>Oleh: <strong className="text-text-secondary font-semibold">{report.user?.username || 'Anonim'}</strong></span>
                      <span>•</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>
                  <div className="self-end sm:self-auto flex-shrink-0">
                    <Button variant="outline" size="sm">
                      Detail
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Info & Guidelines */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Panduan Pelaporan</h2>
          <Card className="p-5 space-y-4 border-l-4 border-l-primary">
            <div>
              <h4 className="font-semibold text-text-primary text-sm">1. Tulis Judul Jelas</h4>
              <p className="text-xs text-text-secondary mt-1">Sebutkan masalah utama secara ringkas dan mudah dipahami oleh petugas verifikasi.</p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">2. Jelaskan Detail Masalah</h4>
              <p className="text-xs text-text-secondary mt-1">Sertakan kronologi, lokasi spesifik, dan dampak permasalahan tersebut bagi warga sekitar.</p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">3. Lampirkan Foto Valid</h4>
              <p className="text-xs text-text-secondary mt-1">Unggah foto pendukung sebagai bukti konkret laporan Anda agar lebih cepat disetujui.</p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">4. Pantau Status & Tanggapi</h4>
              <p className="text-xs text-text-secondary mt-1">Periksa tanggapan petugas di kolom komentar laporan Anda secara berkala.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
