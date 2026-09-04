import React, { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';

interface HomePageProps {
  onLaunchDashboard: () => void;
  onSelectTab: (tabId: string) => void;
  isAuthenticated?: boolean;
  onOpenAuthModal: () => void;
  onSignOut?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onLaunchDashboard, 
  onSelectTab,
  isAuthenticated = false,
  onOpenAuthModal,
  onSignOut
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProtectedAction = (action: () => void) => {
    if (!isAuthenticated) {
      onOpenAuthModal();
    } else {
      action();
    }
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-transparent text-white font-['Inter',sans-serif] overflow-x-hidden flex flex-col justify-between select-none">

      {/* HEADER: Centered Max Width 720px */}
      <header className="relative z-20 w-full pt-6 px-4 flex justify-center">
        <div className="w-full max-w-[720px] flex items-center justify-between">
          
          {/* Circular Logo */}
          <div 
            onClick={() => handleProtectedAction(onLaunchDashboard)}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-all shrink-0"
            title="Sovereign Network Packet Analyzer"
          >
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4 text-black fill-current" />
            </div>
          </div>

          {/* Desktop Navigation: White Navigation Pill */}
          <nav className="hidden sm:flex items-center h-[46px] px-6 bg-white rounded-full text-[#111113] text-[13px] font-medium tracking-tight shadow-lg gap-6">
            <button 
              onClick={() => {}} 
              className="text-[#111113] hover:text-black font-semibold transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => handleProtectedAction(onLaunchDashboard)} 
              className="text-[#555558] hover:text-black transition-colors cursor-pointer"
            >
              Product
            </button>
            <button 
              onClick={() => handleProtectedAction(() => onSelectTab('reports'))} 
              className="text-[#555558] hover:text-black transition-colors cursor-pointer"
            >
              Case Studies
            </button>
            <button 
              onClick={() => handleProtectedAction(() => onSelectTab('settings'))} 
              className="text-[#555558] hover:text-black transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Sign In / User Pill */}
          <div className="hidden sm:flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={onOpenAuthModal}
                className="h-[46px] px-6 bg-[#28282a] hover:bg-[#343437] text-white text-[13px] font-medium rounded-full border border-white/10 transition-colors shadow-md cursor-pointer flex items-center justify-center"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLaunchDashboard}
                  className="h-[46px] px-5 bg-white text-black text-[13px] font-semibold rounded-full hover:bg-white/90 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Enter SOC</span>
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="h-[46px] px-4 bg-[#28282a] hover:bg-red-500/20 hover:text-red-300 text-white/70 text-xs font-mono rounded-full border border-white/10 transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button (<= 720px) */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 rounded-full bg-[#28282a] border border-white/15 text-white flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-6 sm:hidden animate-fadeIn">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                <Shield className="w-4 h-4 text-black fill-current" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">SOVEREIGN</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-4 py-8 text-lg font-medium text-white/90">
            <button 
              onClick={() => { setMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-white"
            >
              Home
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); handleProtectedAction(onLaunchDashboard); }}
              className="text-left py-2 hover:text-white"
            >
              Product
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); handleProtectedAction(() => onSelectTab('reports')); }}
              className="text-left py-2 hover:text-white"
            >
              Case Studies
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); handleProtectedAction(() => onSelectTab('settings')); }}
              className="text-left py-2 hover:text-white"
            >
              Contact
            </button>
          </div>

          <div className="mt-auto space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); handleProtectedAction(onLaunchDashboard); }}
              className="w-full py-3.5 bg-white text-black font-semibold text-sm rounded-full cursor-pointer shadow-lg"
            >
              {isAuthenticated ? 'Enter Workstation' : 'Launch Analyzer'}
            </button>
            {!isAuthenticated ? (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuthModal(); }}
                className="w-full py-3.5 bg-[#28282a] text-white font-medium text-sm rounded-full border border-white/10 cursor-pointer"
              >
                Sign In
              </button>
            ) : onSignOut ? (
              <button
                onClick={() => { setMobileMenuOpen(false); onSignOut(); }}
                className="w-full py-3.5 bg-red-500/10 text-red-400 font-medium text-sm rounded-full border border-red-500/20 cursor-pointer"
              >
                Sign Out
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* HERO CENTERED COMPOSITION — Max Width 900px */}
      <main className="relative z-10 w-full max-w-[900px] mx-auto px-4 py-8 sm:py-12 my-auto flex flex-col items-center text-center">
        
        {/* Trust Pill: [○] [○] [○] [ Built for Network Security ] */}
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[12px] font-normal mb-8 shadow-sm">
          <div className="flex items-center -space-x-1.5">
            <div className="w-4 h-4 rounded-full border border-white/60 bg-white/20 flex items-center justify-center text-[7px]">○</div>
            <div className="w-4 h-4 rounded-full border border-white/60 bg-white/30 flex items-center justify-center text-[7px]">○</div>
            <div className="w-4 h-4 rounded-full border border-white/60 bg-white/40 flex items-center justify-center text-[7px]">○</div>
          </div>
          <span className="text-white/90 font-medium tracking-tight">Built for Network Security</span>
        </div>

        {/* Retro Display Headline: Exactly 2 Lines, Solid White */}
        <h1 
          className="text-white font-bold leading-[1.08] tracking-tight mb-6 select-none"
          style={{
            fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace",
            fontSize: 'clamp(28px, 6.2vw, 80px)',
            letterSpacing: '0.02em',
          }}
        >
          See Every Packet.<br />
          Understand Every Threat.
        </h1>

        {/* Hero Short Description: Centered */}
        <p className="text-white/75 text-[15px] sm:text-[17px] leading-relaxed max-w-[560px] mx-auto mb-9 font-normal">
          Capture, inspect and understand network traffic with a real-time packet analysis and security intelligence platform.
        </p>

        {/* CTA: White Pill CTA, Black Text */}
        <div>
          <button
            onClick={() => handleProtectedAction(onLaunchDashboard)}
            className="h-[50px] px-8 bg-white hover:bg-white/90 text-black text-[14px] font-semibold rounded-full transition-all shadow-xl hover:scale-[1.02] cursor-pointer flex items-center justify-center tracking-tight"
          >
            {isAuthenticated ? 'Enter Workstation' : 'Launch Analyzer'}
          </button>
        </div>

      </main>

      {/* BOTTOM STATISTICS: Exactly 4 Columns on Desktop, 2x2 on Mobile */}
      <footer className="relative z-10 w-full max-w-[840px] mx-auto px-4 pb-8 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
          
          {/* Stat 1 */}
          <div className="flex flex-col items-center">
            <div className="text-white text-xl sm:text-2xl font-bold tracking-tight font-mono">
              &lt; 120 ms
            </div>
            <div className="text-white/60 text-xs sm:text-[13px] font-normal mt-1">
              Packet Analysis
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center">
            <div className="text-white text-xl sm:text-2xl font-bold tracking-tight font-mono">
              % 99.99 %
            </div>
            <div className="text-white/60 text-xs sm:text-[13px] font-normal mt-1">
              Platform Availability
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center">
            <div className="text-white text-xl sm:text-2xl font-bold tracking-tight font-mono">
              * 24 / 7
            </div>
            <div className="text-white/60 text-xs sm:text-[13px] font-normal mt-1">
              Security Monitoring
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center">
            <div className="text-white text-xl sm:text-2xl font-bold tracking-tight font-mono">
              # 2.4 M
            </div>
            <div className="text-white/60 text-xs sm:text-[13px] font-normal mt-1">
              Packet Context
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
