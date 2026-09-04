import React, { useState, useEffect } from 'react';
import { Shield, Lock, Menu, X, Terminal, LogOut, User as UserIcon, Search, Activity, Share2, History, Settings, FileText, Sparkles } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenCommandPalette?: () => void;
  onOpenCopilot?: () => void;
  isDemoActive?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  user,
  onOpenAuth,
  onLogout,
  onOpenCommandPalette,
  onOpenCopilot,
  isDemoActive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 8 Primary Modules from specification
  const navigationModules = [
    { id: 'overview', num: '01', label: 'OVERVIEW' },
    { id: 'vault', num: '02', label: 'VAULT' },
    { id: 'crypto-inspector', num: '03', label: 'CRYPTO' },
    { id: 'shares', num: '04', label: 'SHARES' },
    { id: 'security', num: '05', label: 'SECURITY' },
    { id: 'audit', num: '06', label: 'AUDIT' },
    { id: 'architecture', num: '07', label: 'ARCH' },
    { id: 'settings', num: '08', label: 'SETTINGS' },
  ];

  const handleLinkClick = (viewId: string) => {
    onViewChange(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navigation"
      className="sticky top-0 z-40 w-full bg-black/35 backdrop-blur-md border-b border-white/10"
    >
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Micro Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="brand-logo-btn"
            onClick={() => handleLinkClick('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white group"
          >
            {/* Minimal Geometric Lock Icon */}
            <svg
              width="15"
              height="16"
              viewBox="0 0 15 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-90 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <rect
                x="1"
                y="6.5"
                width="13"
                height="8.5"
                rx="1"
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />
              <path
                d="M4 6.5V4.5C4 2.567 5.567 1 7.5 1C9.433 1 11 2.567 11 4.5V6.5"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="7.5" cy="10.5" r="1" fill="#FFFFFF" />
            </svg>

            <div className="flex items-center gap-2">
              <span className="font-sans-main font-medium text-[16px] tracking-[0.12em] uppercase text-white">
                SECUREVAULT
              </span>
              <span className="hidden xl:inline-block font-mono-tech text-[9.5px] text-white/40 tracking-wider">
                [ AES-256-GCM / SHA-256 ]
              </span>
            </div>
          </button>

          {isDemoActive && (
            <span className="hidden md:inline-flex px-1.5 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono-tech text-[9px] uppercase tracking-wider">
              DEMO ACTIVE
            </span>
          )}
        </div>

        {/* Desktop 8 Primary Modules */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Main Navigation">
          {navigationModules.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLinkClick(item.id)}
                className={`relative py-1 flex items-baseline gap-1.5 font-mono-tech text-xs sm:text-[13px] tracking-[0.14em] uppercase transition-colors group ${
                  isActive ? 'text-white font-semibold' : 'text-white/50 hover:text-white'
                }`}
              >
                <span className="text-[10px] text-white/35 group-hover:text-white/70">
                  {item.num}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Quick Search + User / Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-white/15 hover:border-white/35 bg-white/[0.04] text-white/70 hover:text-white font-mono-tech text-xs tracking-wider uppercase transition-colors rounded-[3px]"
              title="Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>SEARCH</span>
              <kbd className="text-[10px] text-white/50 border border-white/20 px-1.5 py-0.5 rounded-[2px]">
                ^K
              </kbd>
            </button>
          )}

          {onOpenCopilot && (
            <button
              type="button"
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/20 hover:border-white/45 bg-white/[0.06] hover:bg-white/12 text-white font-mono-tech text-xs tracking-wider uppercase transition-colors rounded-[3px]"
              title="Open Security Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>COPILOT</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-mono-tech text-xs text-white/95 leading-none font-medium">
                  {user.name}
                </span>
                <span className="font-mono-tech text-[10.5px] text-white/50 tracking-wide mt-1 max-w-[160px] truncate">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                id="nav-logout-btn"
                onClick={onLogout}
                className="p-2.5 border border-white/15 hover:border-white/35 bg-white/[0.04] hover:bg-white/10 text-white/70 hover:text-white transition-colors rounded-[3px]"
                title="Logout from vault"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 border border-white/30 hover:border-white text-white font-mono-tech text-xs tracking-[0.16em] uppercase transition-colors rounded-[3px] hover:bg-white/10 font-medium"
            >
              AUTHENTICATE
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white border border-white/15 rounded-[2px]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-6 py-4 glass-drawer border-b border-white/15 flex flex-col gap-3 font-mono-tech text-xs tracking-widest uppercase">
          {navigationModules.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.id)}
              className={`text-left py-2 flex items-center justify-between border-b border-white/5 ${
                currentView === item.id ? 'text-white font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-white/30 text-[10px]">{item.num}</span>
                <span>{item.label}</span>
              </span>
              {currentView === item.id && <span className="text-emerald-400">●</span>}
            </button>
          ))}
          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="text-left text-red-400 pt-2 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT SESSION</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
