'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import MobileNav from '@/components/layout/MobileNav';
import { PageLoader } from '@/components/ui/Loader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!token || !user)) {
      router.push('/login');
    }
  }, [token, user, isLoading, router]);

  if (isLoading || !token || !user) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col md:pl-[280px]">
        {/* Navbar */}
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        {/* Content container */}
        <main className="flex-1 px-4 py-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </div>
  );
}
