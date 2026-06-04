'use client';

import React, { useState } from 'react';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', className = '', id, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={[
              'w-full rounded-xl bg-white border text-sm text-slate-800 placeholder:text-slate-400',
              'transition-all duration-200 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              icon ? 'pl-11' : 'pl-4',
              isPassword ? 'pr-11' : 'pr-4',
              'py-3',
              error
                ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-200 hover:border-slate-300',
            ].join(' ')}
            {...rest}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-150 focus:outline-none cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <HiEyeSlash className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
