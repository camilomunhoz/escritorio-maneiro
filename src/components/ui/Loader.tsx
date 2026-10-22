import React from 'react';

export interface LoaderProps {
  topText?: string;
  bottomText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  topText,
  bottomText,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 ${className}`}>
      {topText && (
        <p className="text-sm font-medium text-calm-800 mb-4 animate-pulse">
          {topText}
        </p>
      )}
      
      {/* Calm Circular Spinner */}
      <div
        className={`rounded-full border-calm-200 border-t-sage-600 animate-spin transition-all ${sizeClasses}`}
        style={{ animationDuration: '1.2s' }}
      />

      {bottomText && (
        <p className="text-xs text-calm-500 mt-4 max-w-xs leading-relaxed">
          {bottomText}
        </p>
      )}
    </div>
  );
};
