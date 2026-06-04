'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
type Variant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Style maps                                                                */
/* -------------------------------------------------------------------------- */
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
  secondary:
    'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100',
  danger:
    'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40',
  outline:
    'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 shadow-sm',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

const iconSizeClasses: Record<Size, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/* -------------------------------------------------------------------------- */
/*  Spinner                                                                   */
/* -------------------------------------------------------------------------- */
function Spinner({ size }: { size: Size }) {
  return (
    <svg
      className={`animate-spin ${iconSizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      className = '',
      fullWidth = false,
      icon,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.025 }}
        whileTap={isDisabled ? undefined : { scale: 0.975 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        disabled={isDisabled}
        className={[
          'relative inline-flex items-center justify-center font-medium rounded-xl',
          'transition-colors duration-200 cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
          className,
        ].join(' ')}
        {...rest}
      >
        {isLoading && <Spinner size={size} />}
        {!isLoading && icon && (
          <span className={iconSizeClasses[size]}>{icon}</span>
        )}
        <span>{children}</span>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
