import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-neon-yellow text-black hover:bg-white hover:text-black shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]',
    secondary:
      'bg-[#1a1a1a] text-white hover:bg-[#222] border border-gray-800 hover:border-gray-700',
    danger:
      'bg-red-900/10 text-red-500 hover:bg-red-900/30 hover:text-red-400 border border-red-900/20',
    ghost: 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5',
    outline:
      'bg-transparent border border-gray-800 text-gray-300 hover:border-neon-yellow hover:text-neon-yellow',
  };

  const sizes = {
    sm: 'text-[10px] py-2 px-3 h-8',
    md: 'text-xs py-3 px-5 h-10',
    lg: 'text-sm py-4 px-8 h-12',
    icon: 'p-2 h-10 w-10 flex items-center justify-center',
  };

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {!isLoading && children}
    </button>
  );
};
