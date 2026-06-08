import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Sistem Pelaporan Pengaduan Masyarakat',
  description: 'Aplikasi pelaporan pengaduan masyarakat modern untuk pelayanan publik yang responsif.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col antialiased bg-background text-text-primary">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                'shadow-soft border border-border bg-surface text-text-primary rounded-xl text-sm font-medium',
              duration: 4000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
