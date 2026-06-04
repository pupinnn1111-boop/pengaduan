'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { 
  HiChartBar, 
  HiDocumentText, 
  HiUsers, 
  HiUser, 
  HiArrowRightOnRectangle,
  HiXMark
} from 'react-icons/hi2';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HiChartBar, roles: ['user', 'admin', 'super_admin'] },
    { name: 'Laporan', href: '/laporan', icon: HiDocumentText, roles: ['user', 'admin', 'super_admin'] },
    { name: 'Manajemen User', href: '/users', icon: HiUsers, roles: ['super_admin'] },
    { name: 'Profil', href: '/profile', icon: HiUser, roles: ['user', 'admin', 'super_admin'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border w-[280px]">
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-soft">
            <HiDocumentText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary leading-tight">Pengaduan</h1>
            <p className="text-xs text-text-secondary leading-none">Masyarakat</p>
          </div>
        </div>
        
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-background text-text-secondary transition-all"
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white shadow-soft' 
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer / User & Logout */}
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex items-center gap-3 px-2 py-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-text-secondary capitalize truncate">{user?.role?.replace('_', ' ') || 'Peran'}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-all duration-200"
        >
          <HiArrowRightOnRectangle className="h-5 w-5 flex-shrink-0" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-20 w-[280px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-all"
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`md:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
