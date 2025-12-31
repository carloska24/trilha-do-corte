import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neon' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  fullHeight = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-sm transition-all duration-300 relative overflow-hidden';

  const variants = {
    default: 'bg-[#111] border border-gray-800 shadow-xl',
    glass: 'bg-black/50 backdrop-blur-md border border-white/10 shadow-lg',
    neon: 'bg-[#0a0a0a] border border-gray-800 hover:border-neon-yellow/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]',
    outlined: 'bg-transparent border border-gray-800 hover:border-gray-700',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const heightClass = fullHeight ? 'h-full' : 'h-auto';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${heightClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
