import React from 'react';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gradient' | 'secondary' | 'warning' | 'retry' | 'fight';
  size?: 'normal' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'normal',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const baseClasses =
    'rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses =
    size === 'lg' ? 'px-8 py-3' : size === 'icon' ? '' : 'px-6 py-3';

  let variantClasses = '';
  if (variant === 'primary') {
    variantClasses = 'bg-blue-600 text-white hover:bg-blue-700';
  } else if (variant === 'gradient') {
    variantClasses =
      'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700';
  } else if (variant === 'secondary') {
    variantClasses = 'bg-gray-600 text-white hover:bg-gray-700';
  } else if (variant === 'warning') {
    variantClasses = 'bg-yellow-600 text-white hover:bg-yellow-700';
  } else if (variant === 'retry') {
    variantClasses = 'bg-orange-600 text-white hover:bg-orange-700';
  } else if (variant === 'fight') {
    variantClasses =
      'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 transition-all transform active:scale-95';
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
