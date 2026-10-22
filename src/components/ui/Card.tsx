import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';

  const variantClasses = {
    default: 'bg-white border border-calm-200/80 shadow-soft',
    subtle: 'bg-calm-50 border border-calm-200/60',
    outline: 'bg-transparent border border-calm-200',
    interactive: 'bg-white border border-calm-200/80 shadow-soft hover:border-sage-300 hover:shadow-md cursor-pointer',
  }[variant];

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2.5',
    md: 'p-4',
    lg: 'p-5',
  }[padding];

  return (
    <div className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};
