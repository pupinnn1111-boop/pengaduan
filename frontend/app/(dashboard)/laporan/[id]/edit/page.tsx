'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getCategories } from '@/lib/api/categories';
import { getLaporanById, updateLaporan } from '@/lib/api/laporan';
import type { Category } from '@/lib/types';
import { API_URL } from '@/lib/utils/constants';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { 
  HiPhoto, 
  HiArrowLeft, 
  HiXMark,
  HiChevronRight
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

interface EditReportForm {
  title: string;
  description: string;
  category_id: string;
}

export default function EditLaporanPage() {
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditReportForm>();

  // Fetch Kategori & Data Laporan
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [categoriesRes, reportRes] = await Promise.all([
          getCategories(),
          getLaporanById(Number(id)),
        ]);
        
        setCategories(categoriesRes.data || []);
        
        const report = reportRes.data;
        setValue('title', report.title);
        setValue('description', report.description);
        setValue('category_id', String(report.category_id));
        setCurrentImage(report.image);
      } catch {
        toast.error('Gagal mengambil data laporan');
        router.push('/laporan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, setValue, router]);

  // Handle Image input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipe berkas tidak didukung.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: EditReportForm) => {
    if (!id) return;
    try {
      setIsSubmitLoading(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category_id', data.category_id);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await updateLaporan(Number(id), formData);
      toast.success('Pengaduan berhasil diperbarui!');
      router.push(`/laporan/${id}`);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui laporan';
      toast.error(errMsg);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
        <Link href="/laporan" className="hover:text-primary transition-all">Laporan</Link>
        <HiChevronRight className="h-3.5 w-3.5 text-text-muted" />
        <Link href={`/laporan/${id}`} className="hover:text-primary transition-all truncate max-w-[120px]">Detail Laporan</Link>
        <HiChevronRight className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-text-primary font-semibold">Edit Laporan</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-border bg-surface p-2.5 text-text-secondary hover:bg-background transition-all shadow-sm"
        >
          <HiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">Edit Laporan Pengaduan</h1>
          <p className="text-sm text-text-secondary mt-0.5">Sesuaikan kembali keluhan Anda agar penanganan lebih akurat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input (2 col) */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8" hover={false}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <Input
                label="Judul Pengaduan"
                type="text"
                placeholder="Judul pengaduan..."
                error={errors.title?.message}
                {...register('title', {
                  required: 'Judul pengaduan wajib diisi',
                  minLength: {
                    value: 5,
                    message: 'Judul minimal 5 karakter',
                  },
                })}
              />

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Kategori Pengaduan</label>
                <select
                  {...register('category_id', { required: 'Kategori wajib dipilih' })}
                  className={`w-full h-11 px-4 rounded-xl border bg-background text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer ${
                    errors.category_id ? 'border-danger focus:ring-danger/20' : 'border-border'
                  }`}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <span className="text-xs text-danger font-medium mt-1">{errors.category_id.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Masalah</label>
                <textarea
                  placeholder="Detail laporan..."
                  rows={6}
                  {...register('description', {
                    required: 'Deskripsi pengaduan wajib diisi',
                    minLength: {
                      value: 10,
                      message: 'Deskripsi minimal 10 karakter',
                    },
                  })}
                  className={`w-full p-4 rounded-xl border bg-background text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${
                    errors.description ? 'border-danger focus:ring-danger/20' : 'border-border'
                  }`}
                />
                {errors.description && (
                  <span className="text-xs text-danger font-medium mt-1">{errors.description.message}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitLoading}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Media / Image edit (1 col) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-text-primary">Perbarui Foto Bukti</h2>
          <Card className="p-6" hover={false}>
            {/* Show preview of NEW selected image */}
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-background border border-border group">
                  <img
                    src={imagePreview}
                    alt="Preview Baru"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2.5 rounded-xl bg-danger hover:bg-red-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      <HiXMark className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-center text-primary font-bold">Foto baru terpilih (Akan menggantikan foto lama)</p>
              </div>
            ) : currentImage ? (
              /* Show current image in DB with button to replace */
              <div className="space-y-4">
                <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-background border border-border">
                  <img
                    src={`${API_URL}/uploads/${currentImage}`}
                    alt="Foto Saat Ini"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Gambar+Laporan';
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  className="gap-2 rounded-xl text-text-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <HiPhoto className="h-5 w-5" />
                  Ganti Foto Bukti
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              /* Default Drag Drop if no image exists */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary hover:bg-blue-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-64"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm">
                  <HiPhoto className="h-7 w-7" />
                </div>
                <p className="text-sm font-bold text-text-primary">Pilih & Unggah Foto</p>
                <p className="text-xs text-text-secondary mt-1">Gunakan JPG, PNG atau WEBP. Maks 5MB.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
