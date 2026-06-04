'use client';

import React from 'react';

/* -------------------------------------------------------------------------- */
/*  SkeletonLine                                                              */
/* -------------------------------------------------------------------------- */
interface SkeletonLineProps {
  className?: string;
  width?: string;
  height?: string;
}

export function SkeletonLine({
  className = '',
  width = 'w-full',
  height = 'h-4',
}: SkeletonLineProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${width} ${height} ${className}`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  SkeletonCard                                                              */
/* -------------------------------------------------------------------------- */
interface SkeletonCardProps {
  className?: string;
  count?: number;
}

export function SkeletonCard({ className = '', count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-2xl bg-white border border-slate-100 shadow-sm p-5 space-y-4 ${className}`}
        >
          {/* Image placeholder */}
          <div className="w-full h-36 rounded-xl bg-slate-200" />

          {/* Text lines */}
          <div className="space-y-2.5">
            <div className="h-4 rounded-lg bg-slate-200 w-3/4" />
            <div className="h-3.5 rounded-lg bg-slate-200 w-full" />
            <div className="h-3.5 rounded-lg bg-slate-200 w-5/6" />
          </div>

          {/* Footer row */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="h-3 rounded-lg bg-slate-200 w-24" />
          </div>
        </div>
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  SkeletonTable                                                             */
/* -------------------------------------------------------------------------- */
interface SkeletonTableProps {
  className?: string;
  count?: number;
  columns?: number;
}

export function SkeletonTable({
  className = '',
  count = 5,
  columns = 4,
}: SkeletonTableProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex gap-4 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3.5 rounded-md bg-slate-200 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: count }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 px-5 py-4 border-b border-slate-50 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-3.5 rounded-md bg-slate-100 flex-1"
              style={{ width: `${60 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
