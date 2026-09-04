import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-mono-tech uppercase tracking-[0.14em] font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 rounded-[3px]',
    md: 'text-sm px-5 py-2.5 gap-2 rounded-[3px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 rounded-[3px]',
  };

  const variantClasses = {
    primary:
      'bg-white text-black hover:bg-white/90 border border-transparent shadow-[0_1px_3px_rgba(255,255,255,0.2)] active:scale-[0.99]',
    secondary:
      'bg-white/[0.06] text-white hover:bg-white/[0.12] border border-white/[0.22] hover:border-white/[0.38]',
    outline:
      'bg-transparent text-white/80 hover:text-white border border-white/[0.18] hover:border-white/[0.4]',
    danger:
      'bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50',
    ghost:
      'bg-transparent text-white/70 hover:text-white hover:bg-white/[0.08] border-none',
  };

  return (
    <button
      type={props.type || 'button'}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
