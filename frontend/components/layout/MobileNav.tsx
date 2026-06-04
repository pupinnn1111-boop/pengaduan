'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiChartBar, 
  HiDocumentText, 
  HiPlus, 
  HiUser 
} from 'react-icons/hi2';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HiChartBar },
    { name: 'Laporan', href: '/laporan', icon: HiDocumentText },
    { name: 'Buat Laporan', href: '/laporan/create', icon: HiPlus, isCenter: true },
    { name: 'Profil', href: '/profile', icon: HiUser },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-border shadow-lg px-4 h-16 flex items-center justify-around pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;

        if (item.isCenter) {
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center justify-center -translate-y-4 h-14 w-14 rounded-full bg-primary text-white shadow-soft-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all ${
              isActive 
                ? 'text-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon className="h-5.5 w-5.5" />
            <span className="text-[10px] font-medium mt-1 leading-none">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
