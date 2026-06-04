'use client';

import React from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils/constants';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
type Status = 'pending' | 'approved' | 'rejected';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  status: Status;
  size?: BadgeSize;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Size maps                                                                 */
/* -------------------------------------------------------------------------- */
const sizeClasses: Record<BadgeSize, { wrapper: string; dot: string; text: string }> = {
  sm: {
    wrapper: 'px-2 py-0.5 gap-1',
    dot: 'w-1.5 h-1.5',
    text: 'text-[11px]',
  },
  md: {
    wrapper: 'px-2.5 py-1 gap-1.5',
    dot: 'w-2 h-2',
    text: 'text-xs',
  },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function Badge({ status, size = 'md', className = '' }: BadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const s = sizeClasses[size];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold select-none',
        colors.bg,
        colors.text,
        s.wrapper,
        className,
      ].join(' ')}
    >
      <span className={`shrink-0 rounded-full ${colors.dot} ${s.dot}`} />
      <span className={s.text}>{label}</span>
    </span>
  );
}
