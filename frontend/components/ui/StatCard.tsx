'use client';

import React, { useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
type AccentColor = 'blue' | 'green' | 'yellow' | 'red';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: AccentColor;
  trend?: { direction: 'up' | 'down'; value: string };
}

/* -------------------------------------------------------------------------- */
/*  Color map                                                                 */
/* -------------------------------------------------------------------------- */
const colorMap: Record<
  AccentColor,
  { border: string; iconBg: string; iconText: string }
> = {
  blue: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
  },
  green: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
  },
  yellow: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
  },
  red: {
    border: 'border-l-red-500',
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
  },
};

/* -------------------------------------------------------------------------- */
/*  Animated counter                                                          */
/* -------------------------------------------------------------------------- */
function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    Math.round(v).toLocaleString('id-ID'),
  );

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [mv, value]);

  return <motion.span>{rounded}</motion.span>;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function StatCard({
  label,
  value,
  icon,
  color = 'blue',
  trend,
}: StatCardProps) {
  const c = colorMap[color];
  const isNumeric = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{
        scale: 1.02,
        boxShadow:
          '0 20px 25px -5px rgba(0,0,0,0.07), 0 8px 10px -6px rgba(0,0,0,0.04)',
      }}
      className={[
        'bg-white rounded-2xl shadow-sm border border-slate-100 border-l-4 p-5',
        'flex items-center justify-between gap-4 cursor-default',
        c.border,
      ].join(' ')}
    >
      {/* Left content */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-400 truncate">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800 tracking-tight">
          {isNumeric ? <AnimatedNumber value={value} /> : value}
        </p>
        {trend && (
          <div
            className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${
              trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {trend.direction === 'up' ? (
              <HiArrowTrendingUp className="w-4 h-4" />
            ) : (
              <HiArrowTrendingDown className="w-4 h-4" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Right icon */}
      <div
        className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl text-xl ${c.iconBg} ${c.iconText}`}
      >
        {icon}
      </div>
    </motion.div>
  );
}
