'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { PageLoader } from '@/components/ui/Loader';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && token && user) {
      router.push('/dashboard');
    }
  }, [token, user, isLoading, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  // If logged in, don't show login page (redirecting)
  if (token && user) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4 md:p-8">
      {/* Decorative background vectors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
