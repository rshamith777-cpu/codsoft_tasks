import React from 'react';
import { CaptureMode } from '../../types';

interface PageHeaderProps {
  number: string;
  category: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  captureMode?: CaptureMode;
  isCapturing?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  number,
  category,
  title,
  description,
  children,
  captureMode = 'IDLE',
  isCapturing = false,
}) => {
  const getBadge = () => {
    if (captureMode === 'LIVE' && isCapturing) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[10px] font-mono font-semibold text-[#10B981] tracking-wider uppercase backdrop-blur-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          LIVE NETWORK CAPTURE
        </span>
      );
    }
    if (captureMode === 'DEMO') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[10px] font-mono font-medium text-[#F59E0B] tracking-wider uppercase backdrop-blur-md">
          DEMO MODE
        </span>
      );
    }
    if (captureMode === 'PCAP') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[10px] font-mono font-medium text-[#3B82F6] tracking-wider uppercase backdrop-blur-md">
          PCAP SESSION
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-medium text-white/50 tracking-wider uppercase backdrop-blur-md">
        CAPTURE INACTIVE
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 mb-6">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-medium text-white/60 tracking-[0.18em] uppercase font-mono">
            {number} / {category}
          </span>
          {getBadge()}
        </div>
        <h1 
          className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight select-none"
          style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
        >
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-white/70 max-w-2xl font-ui leading-relaxed">
          {description}
        </p>
      </div>

      {children && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};
