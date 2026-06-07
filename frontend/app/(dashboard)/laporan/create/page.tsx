'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getCategories } from '@/lib/api/categories';
import { createLaporan } from '@/lib/api/laporan';
import type { Category } from '@/lib/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { 
  HiPhoto, 
  HiArrowLeft, 
  HiXMark,
  HiChevronRight
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

interface CreateReportForm {
  title: string;
  description: string;
  category_id: string;
}

export default function CreateLaporanPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateReportForm>({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
    },
  });

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

  // Handle Image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipe berkas tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipe berkas tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CreateReportForm) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category_id', data.category_id);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }
      await createLaporan(formData);
      toast.success('Pengaduan berhasil dibuat!');
      router.push('/laporan');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Gagal membuat laporan pengaduan';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
        <Link href="/laporan" className="hover:text-primary transition-all">Laporan</Link>
        <HiChevronRight className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-text-primary font-semibold">Buat Laporan</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-border bg-surface p-2.5 text-text-secondary hover:bg-background transition-all shadow-sm"
        >
          <HiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">Tulis Pengaduan Baru</h1>
          <p className="text-sm text-text-secondary mt-0.5">Sampaikan keluhan Anda secara terperinci untuk penanganan yang tepat.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form area */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8" hover={false}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Judul Laporan */}
              <Input
                label="Judul Pengaduan"
                type="text"
                placeholder="Contoh: Lampu Jalan Mati di Jl. Merpati"
                error={errors.title?.message}
                {...register('title', {
                  required: 'Judul pengaduan wajib diisi',
                  minLength: {
                    value: 5,
                    message: 'Judul minimal 5 karakter',
                  },
                })}
              />

              {/* Kategori Laporan */}
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

              {/* Deskripsi Laporan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Deskripsi Masalah</label>
                <textarea
                  placeholder="Jelaskan secara rinci kronologi masalah, dampak, serta lokasi spesifik kejadian..."
                  rows={6}
                  {...register('description', {
                    required: 'Deskripsi pengaduan wajib diisi',
                    minLength: {
                      value: 10,
                      message: 'Deskripsi minimal 10 karakter',
                    },
                  })}
                  className={`w-full p-4 rounded-xl border bg-background text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${
                    errors.description ? 'border-danger focus:ring-danger/20' : 'border-border'
                  }`}
                />
                {errors.description && (
                  <span className="text-xs text-danger font-medium mt-1">{errors.description.message}</span>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                >
                  Kirim Laporan
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Upload Image Section */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-text-primary">Lampiran Foto Bukti</h2>
          <Card className="p-6" hover={false}>
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-background border border-border group">
                  <img
                    src={imagePreview}
                    alt="Preview Laporan"
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
                <div className="flex items-center justify-between text-xs text-text-secondary bg-background p-3 rounded-xl border border-border">
                  <span className="truncate max-w-[180px] font-medium">{imageFile?.name}</span>
                  <span>{((imageFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
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
                <p className="text-sm font-bold text-text-primary">Tarik & Letakkan Foto</p>
                <p className="text-xs text-text-secondary mt-1 max-w-[200px]">atau klik area ini untuk memilih berkas dari komputer.</p>
                <p className="text-[10px] text-text-muted mt-4">Format: JPG, PNG, WEBP. Maksimal 5MB.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
