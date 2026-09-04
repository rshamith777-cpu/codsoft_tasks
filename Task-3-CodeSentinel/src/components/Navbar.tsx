import React from 'react';
import { Sparkles, Terminal, ArrowLeft } from 'lucide-react';
import { ScanResult } from '../types.ts';
import cyberShieldSticker from '../assets/images/cyber_shield_sticker_1788458125347.jpg';

interface NavbarProps {
  currentScan: ScanResult | null;
  activeTab: string;
  onOpenTab: (tab: string) => void;
  onLoadDemo: () => void;
  onReturnToLanding: () => void;
  onOpenCopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScan,
  activeTab: _activeTab,
  onOpenTab: _onOpenTab,
  onLoadDemo,
  onReturnToLanding,
  onOpenCopilot
}) => {
  return (
    <header className="h-14 border-b border-white/10 bg-black/50 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Left: CodeSentinel Logo & Workspace Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onReturnToLanding}
          className="flex items-center gap-2.5 group text-white/90 hover:text-white transition-colors cursor-pointer"
          title="Return to Home"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-[#85D743] shadow-[2px_2px_0px_#0033FF] flex items-center justify-center group-hover:scale-105 transition-all bg-black">
            <img 
              src={cyberShieldSticker} 
              alt="CodeSentinel Shield" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 font-press-start text-[10px] text-[#85D743]">
              CodeSentinel
            </span>
            <span className="text-[9px] font-mono text-white/50 tracking-wider">SECURITY SAST</span>
          </div>
        </button>

        <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#9a9a9a]">
          <span>SECURITY WORKSTATION</span>
          {currentScan ? (
            <>
              <span className="text-white/30">/</span>
              <span className="text-white font-medium truncate max-w-[200px]">
                {currentScan.projectName}
              </span>
              {currentScan.isDemo && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DEMO MODE
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-white/30">/</span>
              <span className="text-white/40">NO PROJECT LOADED</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Security Copilot, Demo trigger, Scanner status */}
      <div className="flex items-center gap-3">
        {/* Security Copilot Button */}
        <button
          id="nav-copilot-trigger-btn"
          onClick={onOpenCopilot}
          className="btn-liquid-secondary px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">SECURITY COPILOT</span>
          <span className="sm:hidden">COPILOT</span>
        </button>

        {/* Load Demo */}
        {!currentScan && (
          <button
            onClick={onLoadDemo}
            className="btn-liquid-secondary px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">LOAD DEMO</span>
          </button>
        )}

        {/* Engine status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-white/70">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline">READY</span>
        </div>

        {/* Return Button */}
        <button
          onClick={onReturnToLanding}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Return to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
