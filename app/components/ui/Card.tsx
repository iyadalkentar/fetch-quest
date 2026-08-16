import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'green';
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  className = '',
}: CardProps) {
  const baseClasses =
    'w-full rounded-lg border shadow-lg';

  let variantClasses = '';
  if (variant === 'default') {
    variantClasses = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6';
  } else if (variant === 'purple') {
    variantClasses = 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 p-6';
  } else if (variant === 'green') {
    variantClasses = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 p-6';
  }

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
}
