'use client';

import React from 'react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  size?: SpinnerSize;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Size map                                                                  */
/* -------------------------------------------------------------------------- */
const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

/* -------------------------------------------------------------------------- */
/*  Loader (spinner)                                                          */
/* -------------------------------------------------------------------------- */
export function Loader({ size = 'md', className = '' }: LoaderProps) {
  return (
    <div
      className={[
        'rounded-full border-blue-600 border-t-transparent animate-spin',
        sizeClasses[size],
        className,
      ].join(' ')}
      role="status"
      aria-label="Memuat"
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PageLoader                                                                */
/* -------------------------------------------------------------------------- */
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader size="lg" />
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
        Memuat...
      </p>
    </div>
  );
}
