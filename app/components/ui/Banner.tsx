import React from 'react';

interface BannerProps {
  variant?: 'error' | 'warning' | 'success';
  children: React.ReactNode;
}

export function Banner({ variant = 'error', children }: BannerProps) {
  const baseClasses = 'w-full px-4 py-3 rounded-lg border text-sm';

  let variantClasses = '';
  if (variant === 'error') {
    variantClasses =
      'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200';
  } else if (variant === 'warning') {
    variantClasses =
      'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
  } else if (variant === 'success') {
    variantClasses =
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200';
  }

  return <div className={`${baseClasses} ${variantClasses}`}>{children}</div>;
}
