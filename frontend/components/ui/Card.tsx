'use client';

import React from 'react';
import { motion } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
type Padding = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: Padding;
}

/* -------------------------------------------------------------------------- */
/*  Padding map                                                               */
/* -------------------------------------------------------------------------- */
const paddingClasses: Record<Padding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function Card({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              scale: 1.015,
              boxShadow:
                '0 20px 25px -5px rgba(0,0,0,0.07), 0 8px 10px -6px rgba(0,0,0,0.04)',
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={[
        'bg-white rounded-2xl shadow-sm border border-slate-100',
        paddingClasses[padding],
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  );
}
