import React, { useState, useEffect } from 'react';
import { Shield, Lock, Menu, X, Terminal, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isDemoActive?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  user,
  onOpenAuth,
  onLogout,
  isDemoActive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close on Escape or screen resize to desktop
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

  const publicNavLinks = [
    { id: 'landing', label: 'OVERVIEW' },
    { id: 'architecture', label: 'SECURITY MODEL' },
    { id: 'how-it-works', label: 'HOW IT WORKS' },
    { id: 'audit-preview', label: 'AUDIT VISIBILITY' },
  ];

  const authenticatedNavLinks = [
    { id: 'vault', label: 'MY VAULT' },
    { id: 'posture', label: 'SECURITY POSTURE' },
    { id: 'audit', label: 'AUDIT ACTIVITY' },
    { id: 'events', label: 'INCIDENT LOGS' },
    { id: 'architecture', label: 'ARCHITECTURE & THREATS' },
    { id: 'settings', label: 'SETTINGS' },
  ];

  const links = user ? authenticatedNavLinks : publicNavLinks;

  const handleLinkClick = (viewId: string) => {
    onViewChange(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navigation"
      className="sticky top-0 z-50 w-full bg-black/40 backdrop-blur-md border-b border-white/15"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => handleLinkClick(user ? 'vault' : 'landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <div className="w-8 h-8 rounded-none border border-white/25 bg-white/5 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono-tech font-bold tracking-widest text-sm text-white uppercase">
                SECUREVAULT
              </span>
              <span className="font-mono-tech text-[10px] text-white/40 tracking-wider">
                [ AES-256-GCM / SHA-256 ]
              </span>
            </div>
          </button>

          {isDemoActive && (
            <span className="hidden sm:inline-flex px-2 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono-tech text-[10px] uppercase tracking-wider">
              DEMO ACTIVE
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
          {links.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleLinkClick(link.id)}
                className={`font-mono-tech text-xs tracking-widest transition-colors duration-150 py-1 relative focus:outline-none focus-visible:text-white ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User CTA / Auth Action */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 border border-white/15 bg-white/5 flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-white/60" />
                <span className="font-mono-tech text-xs text-white/90">
                  {user.email}
                </span>
              </div>
              <button
                id="btn-logout"
                onClick={onLogout}
                className="px-3 py-1.5 border border-white/20 bg-transparent text-white/70 hover:text-white hover:border-white/40 font-mono-tech text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                title="End Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>EXIT</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                id="btn-nav-signin"
                onClick={onOpenAuth}
                className="px-4 py-1.5 border border-white/20 bg-white/5 text-white hover:bg-white/10 font-mono-tech text-xs tracking-widest uppercase transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                SIGN IN
              </button>
              <button
                id="btn-nav-entervault"
                onClick={onOpenAuth}
                className="px-4 py-1.5 bg-white text-black hover:bg-white/90 font-mono-tech font-semibold text-xs tracking-widest uppercase transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
              >
                ENTER VAULT
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            id="btn-mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation menu"
            className="w-11 h-11 border border-white/20 bg-white/5 flex items-center justify-center text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Fullscreen Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 top-16 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10 flex flex-col justify-between p-6 lg:hidden"
        >
          <div className="flex flex-col gap-5 pt-4">
            <div className="text-[11px] font-mono-tech text-white/40 tracking-widest uppercase border-b border-white/10 pb-2">
              SYSTEM NAVIGATION
            </div>
            {links.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  id={`mobile-nav-${link.id}`}
                  onClick={() => handleLinkClick(link.id)}
                  className={`text-left font-mono-tech text-sm tracking-widest py-2 transition-colors flex items-center justify-between ${
                    isActive ? 'text-white font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="text-white text-xs">[ACTIVE]</span>}
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="font-mono-tech text-xs text-white/70 truncate">
                  AUTHENTICATED AS: {user.email}
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 border border-white/20 text-white font-mono-tech text-xs tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  TERMINATE SESSION
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-white text-black font-mono-tech font-bold text-xs tracking-widest uppercase text-center"
                >
                  ENTER SECUREVAULT
                </button>
              </div>
            )}
            <div className="font-mono-tech text-[10px] text-white/30 text-center tracking-widest mt-2">
              SECURE FILE SHARING & ACCESS CONTROL SYSTEM
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
