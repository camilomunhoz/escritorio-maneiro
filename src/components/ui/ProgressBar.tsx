import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to max
  max?: number;
  height?: 'sm' | 'md' | 'lg';
  color?: 'sage' | 'sand' | 'slate' | 'terracotta';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 'md',
  color = 'sage',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[height];

  const colorClasses = {
    sage: 'bg-sage-500',
    sand: 'bg-sand-500',
    slate: 'bg-slateMuted-500',
    terracotta: 'bg-terracottaMuted-500',
  }[color];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-calm-600 mb-1">
          <span>{value} / {max}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-calm-200/80 rounded-full overflow-hidden ${heightClasses}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
