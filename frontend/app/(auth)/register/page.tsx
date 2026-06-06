'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store/authStore';
import type { RegisterData } from '@/lib/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { HiDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';

interface RegisterFormFields extends RegisterData {
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormFields>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormFields) => {
    // Only send relevant fields for registration
    const payload: RegisterData = {
      username: data.username,
      email: data.email,
      password: data.password,
    };
    
    const errorMsg = await registerUser(payload);
    if (errorMsg) {
      toast.error(errorMsg);
    } else {
      toast.success('Pendaftaran berhasil! Silakan login.');
    
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  };

  return (
    <Card className="p-6 md:p-8 shadow-soft-lg" hover={false}>
      {/* App Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-soft mb-3">
          <HiDocumentText className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-text-primary text-center">Buat Akun Baru</h2>
        <p className="text-sm text-text-secondary text-center mt-1">Daftar untuk mulai melaporkan pengaduan</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <Input
          label="Nama Pengguna"
          type="text"
          placeholder="username"
          error={errors.username?.message}
          {...register('username', {
            required: 'Nama pengguna wajib diisi',
            minLength: {
              value: 3,
              message: 'Nama pengguna minimal 3 karakter',
            },
          })}
        />

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

        {/* Confirm Password */}
        <Input
          label="Konfirmasi Kata Sandi"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Konfirmasi kata sandi wajib diisi',
            validate: (value) => value === password || 'Kata sandi tidak cocok',
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
          Daftar
        </Button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm text-text-secondary mt-6">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Masuk Sekarang
        </Link>
      </p>
    </Card>
  );
}
