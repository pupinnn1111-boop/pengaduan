'use client';

import React from 'react';
import { motion } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Icon */}
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 text-3xl mb-5">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-slate-400 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
