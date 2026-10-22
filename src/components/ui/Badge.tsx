import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sage' | 'calm' | 'sand' | 'terracotta';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'calm',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full select-none';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  const variantClasses = {
    sage: 'bg-sage-100 text-sage-800 border border-sage-200',
    calm: 'bg-calm-100 text-calm-700 border border-calm-200',
    sand: 'bg-sand-100 text-sand-800 border border-sand-200',
    terracotta: 'bg-terracottaMuted-100 text-terracottaMuted-700 border border-terracottaMuted-200',
  }[variant];

  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </span>
  );
};
