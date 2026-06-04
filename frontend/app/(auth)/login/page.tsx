'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store/authStore';
import type { LoginCredentials } from '@/lib/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { HiDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    const errorMsg = await login(data);
    if (errorMsg) {
      toast.error(errorMsg);
    } else {
      toast.success('Login berhasil! Selamat datang.');
      router.push('/dashboard');
    }
  };

  return (
    <Card className="p-6 md:p-8 shadow-soft-lg" hover={false}>
      {/* App Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-soft mb-3">
          <HiDocumentText className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-text-primary text-center">Pelaporan Pengaduan</h2>
        <p className="text-sm text-text-secondary text-center mt-1">Masuk untuk membuat laporan pengaduan</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <Input
          label="Alamat Email"
          type="email"
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email wajib diisi',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Format email tidak valid',
            },
          })}
        />

        {/* Password */}
        <Input
          label="Kata Sandi"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'Kata sandi wajib diisi',
            minLength: {
              value: 6,
              message: 'Kata sandi minimal 6 karakter',
            },
          })}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        >
          Masuk
        </Button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm text-text-secondary mt-6">
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Daftar Sekarang
        </Link>
      </p>
    </Card>
  );
}
