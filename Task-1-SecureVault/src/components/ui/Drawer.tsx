import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  width?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  eyebrow,
  width = 'lg',
  children,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-[480px]',
    lg: 'max-w-[580px]',
    xl: 'max-w-[700px]',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      {/* Dimmed backdrop - subtle on left to preserve cinematic video visibility */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding Drawer Container */}
      <div
        className={`relative w-full ${widthClasses} h-full bg-[#05070c]/90 backdrop-blur-xl border-l border-white/15 shadow-2xl flex flex-col z-10 animate-slideInRight text-white`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase mb-1">
                {eyebrow}
              </div>
            )}
            <h2 className="font-sans-main text-lg sm:text-xl font-normal text-white tracking-tight leading-snug">
              {title}
            </h2>
            {subtitle && (
              <p className="font-mono-tech text-[11px] text-white/50 tracking-wider mt-1 truncate max-w-[400px]">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-[2px] transition-colors focus:outline-none"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Region */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-5 border-t border-white/10 bg-black/30 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 200ms ease-out forwards;
        }
        .animate-slideInRight {
          animation: slideInRight 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
