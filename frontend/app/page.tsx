'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  HiDocumentText, 
  HiShieldCheck, 
  HiArrowRight, 
  HiClock, 
  HiCheckCircle,
  HiChatBubbleLeftRight,
  HiChevronRight
} from 'react-icons/hi2';

export default function LandingPage() {
  const { token, user } = useAuthStore();
  const isLoggedIn = !!token && !!user;

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 glassmorphism border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-soft">
              <HiDocumentText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary leading-tight">Pengaduan</h1>
              <p className="text-xs text-text-secondary leading-none">Masyarakat</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-xs text-text-secondary">
                  Masuk sebagai: <strong className="text-text-primary">{user?.username}</strong>
                </span>
                <Link href="/dashboard">
                  <Button variant="primary" size="sm" className="rounded-xl flex items-center gap-2 text-xs">
                    Dashboard
                    <HiChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs border-border hover:bg-background text-text-secondary hover:text-text-primary">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="rounded-xl text-xs shadow-soft">
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-background to-background py-16 md:py-24 lg:py-32">
          {/* Animated Background Vector Blur */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-[10%] right-[10%] w-[35vw] h-[35vw] bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[20%] left-[5%] w-[30vw] h-[30vw] bg-indigo-500/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            {/* Gov Tech Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold shadow-sm select-none mx-auto border border-primary/20">
              <HiShieldCheck className="h-4 w-4" />
              Sistem Pelayanan Pengaduan Publik Resmi
            </div>

            {/* Tagline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-primary leading-tight max-w-4xl mx-auto tracking-tight">
              Sampaikan Aspirasi & Pengaduan Anda <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Secara Terbuka</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Suara Anda adalah langkah awal perubahan pelayanan publik yang lebih baik. Laporkan permasalahan di sekitar Anda secara cepat, transparan, dan terpercaya.
            </p>

            {/* Hero CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href={isLoggedIn ? '/laporan/create' : '/login'}>
                <Button variant="primary" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl shadow-soft-lg font-bold gap-2 text-sm">
                  Laporkan Sekarang
                  <HiArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#cara-kerja">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl border-border text-text-secondary hover:text-text-primary font-bold text-sm bg-white/50">
                  Pelajari Alur Kerja
                </Button>
              </a>
            </div>

            {/* Stat Counters Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
              <div className="p-4 border-r border-border md:border-r last:border-none">
                <h3 className="text-2xl sm:text-3xl font-black text-primary">12K+</h3>
                <p className="text-xs text-text-secondary mt-1 font-semibold">Total Pengaduan</p>
              </div>
              <div className="p-4 border-r border-border md:border-r last:border-none">
                <h3 className="text-2xl sm:text-3xl font-black text-success">98%</h3>
                <p className="text-xs text-text-secondary mt-1 font-semibold">Laporan Selesai</p>
              </div>
              <div className="p-4 border-r border-border md:border-r last:border-none">
                <h3 className="text-2xl sm:text-3xl font-black text-indigo-600">24 Jam</h3>
                <p className="text-xs text-text-secondary mt-1 font-semibold">Respon Tanggap</p>
              </div>
              <div className="p-4 last:border-none">
                <h3 className="text-2xl sm:text-3xl font-black text-warning">100%</h3>
                <p className="text-xs text-text-secondary mt-1 font-semibold">Transparan & Valid</p>
              </div>
            </div>
          </div>
        </section>

        {/* Alur Kerja Section */}
        <section id="cara-kerja" className="py-20 bg-slate-50 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">Bagaimana Sistem Bekerja?</h2>
              <p className="text-sm text-text-secondary">4 alur sederhana sistem dalam memproses pengaduan masyarakat untuk ditindaklanjuti.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <Card className="p-6 border border-border flex flex-col justify-between" hover>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center font-bold text-lg shadow-sm border border-blue-100">
                    1
                  </div>
                  <h3 className="font-bold text-text-primary text-base">Tulis Laporan</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">Laporkan keluhan atau aspirasi Anda secara lengkap beserta lokasi spesifik dan bukti foto yang valid.</p>
                </div>
                <div className="pt-6 text-xs text-primary font-bold flex items-center gap-1">
                  Mulai Melaporkan <HiArrowRight className="h-3 w-3" />
                </div>
              </Card>

              {/* Step 2 */}
              <Card className="p-6 border border-border flex flex-col justify-between" hover>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-warning flex items-center justify-center font-bold text-lg shadow-sm border border-amber-100">
                    2
                  </div>
                  <h3 className="font-bold text-text-primary text-base">Proses Verifikasi</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">Petugas administrator akan memverifikasi kesesuaian berkas dan bukti laporan Anda dalam waktu singkat.</p>
                </div>
                <div className="pt-6 text-xs text-warning font-bold flex items-center gap-1">
                  Status Menunggu <HiClock className="h-3 w-3" />
                </div>
              </Card>

              {/* Step 3 */}
              <Card className="p-6 border border-border flex flex-col justify-between" hover>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-success flex items-center justify-center font-bold text-lg shadow-sm border border-emerald-100">
                    3
                  </div>
                  <h3 className="font-bold text-text-primary text-base">Tindak Lanjut</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">Instansi pemerintah terkait akan langsung mengambil tindakan fisik guna menyelesaikan masalah di lapangan.</p>
                </div>
                <div className="pt-6 text-xs text-success font-bold flex items-center gap-1">
                  Status Disetujui <HiCheckCircle className="h-3 w-3" />
                </div>
              </Card>

              {/* Step 4 */}
              <Card className="p-6 border border-border flex flex-col justify-between" hover>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-sm border border-indigo-100">
                    4
                  </div>
                  <h3 className="font-bold text-text-primary text-base">Kolom Diskusi</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">Pelapor dan administrator dapat saling berkomunikasi secara dua arah melalui kolom komentar interaktif.</p>
                </div>
                <div className="pt-6 text-xs text-indigo-600 font-bold flex items-center gap-1">
                  Diskusi Terbuka <HiChatBubbleLeftRight className="h-3 w-3" />
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-soft">
              <HiDocumentText className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-sm font-bold text-text-primary">Pengaduan Masyarakat</span>
              <p className="text-[10px] text-text-secondary leading-none mt-0.5">Layanan Aspirasi & Pengaduan Lintas Instansi</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-6 text-xs text-text-secondary font-medium">
            <a href="#" className="hover:text-primary transition-colors">Tentang Kami</a>
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary transition-colors">Syarat Ketentuan</a>
            <a href="#" className="hover:text-primary transition-colors">Hubungi Kami</a>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-text-muted">
            &copy; {new Date().getFullYear()} Pengaduan Masyarakat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
