'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { getLaporan } from '@/lib/api/laporan';
import { getCategories } from '@/lib/api/categories';
import type { Laporan, Category, Pagination } from '@/lib/types';
import { API_URL } from '@/lib/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils/formatDate';
import { HiPlus, HiMagnifyingGlass, HiFunnel, HiChevronLeft, HiChevronRight, HiDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function ListLaporanPage() {
  const { user } = useAuthStore();
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and Search States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch {
        toast.error('Gagal mengambil daftar kategori');
      }
    };
    fetchCategories();
  }, []);

  // Fetch Laporan Data
  const fetchLaporan = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getLaporan({
        page,
        limit: 9,
        search,
        status: status || undefined,
      });
      
      // Clientside filtering for category since backend might not support category query filter directly
      let filteredData = res.data || [];
      if (categoryFilter) {
        filteredData = filteredData.filter(item => item.category_id === Number(categoryFilter));
      }
      
      setLaporanList(filteredData);
      setPagination(res.pagination || null);
    } catch {
      toast.error('Gagal memuat daftar laporan');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, categoryFilter]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  // Debounced search handler is omitted for simplicity, instead updating page on search/filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">Daftar Laporan Pengaduan</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {user?.role === 'user' 
              ? 'Berikut adalah daftar seluruh pengaduan yang Anda buat.' 
              : 'Daftar semua pengaduan warga yang masuk ke sistem.'}
          </p>
        </div>
        
        {user?.role === 'user' && (
          <Link href="/laporan/create">
            <Button variant="primary" className="gap-2 self-start sm:self-auto shadow-soft rounded-2xl">
              <HiPlus className="h-5 w-5" />
              Buat Laporan Baru
            </Button>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4" hover={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search Input */}
          <div className="relative">
            <Input
              label="Cari Laporan"
              placeholder="Cari judul..."
              value={search}
              onChange={handleSearchChange}
              icon={<HiMagnifyingGlass className="h-5 w-5 text-text-muted" />}
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Filter Status</label>
            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Filter Kategori</label>
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div>
            <Button
              variant="outline"
              fullWidth
              className="h-11 gap-2 rounded-xl text-text-secondary"
              onClick={() => {
                setSearch('');
                setStatus('');
                setCategoryFilter('');
                setPage(1);
              }}
            >
              <HiFunnel className="h-4.5 w-4.5" />
              Reset Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Laporan Grid / Skeleton List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : laporanList.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <EmptyState
            title="Tidak Ada Laporan Ditemukan"
            description="Coba ganti kata kunci pencarian atau ubah filter status/kategori yang digunakan."
            action={
              user?.role === 'user' ? (
                <Link href="/laporan/create">
                  <Button variant="primary">Buat Laporan Baru</Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {laporanList.map((report) => (
            <Card
              key={report.id}
              className="flex flex-col h-full overflow-hidden border border-border"
              hover
              onClick={() => window.location.href = `/laporan/${report.id}`}
            >
              {/* Card Image */}
              <div className="relative h-48 bg-muted border-b border-border overflow-hidden">
                {report.image ? (
                  <img
                    src={`${API_URL}/uploads/${report.image}`}
                    alt={report.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Gambar+Laporan';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-primary">
                    <HiDocumentText className="h-12 w-12 opacity-40" />
                    <span className="text-xs font-semibold mt-1">Tidak Ada Foto</span>
                  </div>
                )}
                {/* Badges container */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <Badge status={report.status} />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-xs text-primary font-semibold tracking-wide uppercase bg-primary/5 px-2.5 py-1 rounded-lg inline-block">
                    {report.category?.name || 'Kategori'}
                  </div>
                  <h3 className="font-bold text-text-primary text-base line-clamp-1 hover:text-primary transition-colors cursor-pointer">
                    {report.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {report.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                      {report.user?.username?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    <span className="font-semibold text-text-secondary truncate max-w-[100px]">{report.user?.username || 'Anonim'}</span>
                  </div>
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination component */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-text-secondary">
            Menampilkan halaman <strong className="font-semibold text-text-primary">{page}</strong> dari <strong className="font-semibold text-text-primary">{pagination.total_pages}</strong>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-2"
              disabled={!pagination.has_prev}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <HiChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-2"
              disabled={!pagination.has_next}
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.total_pages))}
            >
              <HiChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
