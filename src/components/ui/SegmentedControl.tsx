import React from 'react';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  badge?: React.ReactNode;
  indicator?: boolean;
  indicatorTitle?: string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'sm',
}: SegmentedControlProps<T>) {
  const sizeClasses = size === 'sm' ? 'p-0.5 text-xs' : 'p-1 text-sm';
  const itemPadding = size === 'sm' ? 'py-1 px-2.5' : 'py-1.5 px-3';

  return (
    <div className={`flex items-center gap-1 bg-calm-100 rounded-lg ${sizeClasses} select-none ${className}`}>
      {options.map(option => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 ${itemPadding} text-center font-medium rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isSelected
                ? 'bg-white text-calm-900 shadow-xs font-semibold'
                : 'text-calm-600 hover:text-calm-900'
            }`}
          >
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span className={`text-[10px] ${isSelected ? 'text-calm-500 font-normal' : 'text-calm-400 font-normal'}`}>
                {option.badge}
              </span>
            )}
            {option.indicator && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"
                title={option.indicatorTitle}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
