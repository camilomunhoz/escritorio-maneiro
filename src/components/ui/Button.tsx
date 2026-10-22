import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'subtle' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-sage-600 text-white hover:bg-sage-700 focus:ring-sage-500 shadow-sm',
    ghost: 'bg-transparent text-calm-600 hover:bg-calm-100 focus:ring-calm-400 hover:text-calm-900',
    subtle: 'bg-calm-100 text-calm-700 hover:bg-calm-200 focus:ring-calm-400',
    outline: 'bg-transparent border border-calm-300 text-calm-700 hover:bg-calm-50 focus:ring-calm-400',
    danger: 'bg-terracottaMuted-500 text-white hover:bg-terracottaMuted-700 focus:ring-terracottaMuted-500',
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
