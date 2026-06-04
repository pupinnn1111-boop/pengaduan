'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { HiBars3, HiBell, HiChevronDown } from 'react-icons/hi2';

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [greeting, setGreeting] = useState('Halo');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 19) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  // Determine current page title based on path
  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/laporan/create')) return 'Buat Laporan Baru';
    if (pathname.startsWith('/laporan/') && pathname.endsWith('/edit')) return 'Edit Laporan';
    if (pathname.startsWith('/laporan/')) return 'Detail Laporan';
    if (pathname.startsWith('/laporan')) return 'Daftar Laporan';
    if (pathname.startsWith('/users')) return 'Manajemen User';
    if (pathname.startsWith('/profile')) return 'Profil Saya';
    return 'Pelaporan';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 md:px-8 shadow-sm">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-text-secondary hover:bg-background md:hidden transition-all"
        >
          <HiBars3 className="h-6 w-6" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-text-primary hidden md:block">{getPageTitle()}</h2>
        </div>
      </div>

      {/* Right side: Greeting & Avatar dropdown */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Greetings */}
        <span className="hidden lg:block text-sm text-text-secondary">
          {greeting}, <strong className="text-text-primary font-semibold">{user?.username}</strong>
        </span>

        {/* Notifications mock */}
        <button className="relative rounded-xl p-2 text-text-secondary hover:bg-background hover:text-text-primary transition-all">
          <HiBell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-background transition-all"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <HiChevronDown className="h-4 w-4 text-text-secondary hidden md:block" />
          </button>

          {dropdownOpen && (
            <>
              <div 
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-20"
              />
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-border bg-surface p-2 shadow-soft-lg z-30">
                <div className="px-3 py-2 border-b border-border mb-1 md:hidden">
                  <p className="text-sm font-semibold text-text-primary">{user?.username}</p>
                  <p className="text-xs text-text-secondary capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    window.location.href = '/profile';
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-all"
                >
                  Profil Saya
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-danger hover:bg-red-50 transition-all font-medium"
                >
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
