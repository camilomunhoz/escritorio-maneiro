import React from 'react';

export interface AvatarSvgProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  projected?: boolean;
  className?: string;
}

export const AvatarSvg: React.FC<AvatarSvgProps> = ({
  color = '#6D8B75',
  size = 'md',
  projected = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', svg: 'w-6 h-6' },
    md: { container: 'w-10 h-10', svg: 'w-8 h-8' },
    lg: { container: 'w-14 h-14', svg: 'w-11 h-11' },
    xl: { container: 'w-20 h-20', svg: 'w-16 h-16' },
    hero: { container: 'w-32 h-32', svg: 'w-24 h-24' },
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-calm-100 border border-calm-200/80 shadow-soft select-none overflow-hidden ${sizeMap.container} ${projected ? 'ring-2 ring-white ring-offset-2 ring-offset-calm-100' : ''} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`${sizeMap.svg} ${projected ? 'translate-y-1' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Background Tint */}
        <circle cx="50" cy="50" r="46" fill={color} fillOpacity="0.12" />
        
        {/* Head */}
        <circle cx="50" cy="38" r="18" fill={color} />
        
        {/* Shoulders / Bust */}
        <path
          d="M20 86 C20 62, 34 58, 50 58 C66 58, 80 62, 80 86 Z"
          fill={color}
        />
        
        {/* Subtle accent highlight */}
        <ellipse cx="50" cy="36" rx="14" ry="12" fill="#ffffff" fillOpacity="0.15" />
      </svg>
    </div>
  );
};
