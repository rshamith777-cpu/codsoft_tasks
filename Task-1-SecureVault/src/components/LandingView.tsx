import React, { useState } from 'react';

interface LandingViewProps {
  onEnterVault: () => void;
  onViewSecurityModel: () => void;
  onRunDemo: () => void;
  onViewChange?: (view: string) => void;
  onDirectLogin?: (email: string, pass: string) => Promise<void>;
  isLoggedIn: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterVault,
  onViewSecurityModel,
  onRunDemo,
  onViewChange,
  onDirectLogin,
  isLoggedIn,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    setActiveNav(view);
    if (onViewChange) {
      onViewChange(view);
    } else {
      if (view === 'security') onViewSecurityModel();
      else onEnterVault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If user is already logged in, enter vault directly
    if (isLoggedIn) {
      onEnterVault();
      return;
    }

    // If inputs are empty, open vault / auth modal
    if (!email.trim() && !password.trim()) {
      onEnterVault();
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('EMAIL AND PASSWORD REQUIRED');
      return;
    }

    if (onDirectLogin) {
      try {
        setIsSubmitting(true);
        await onDirectLogin(email.trim(), password);
      } catch (err: any) {
        setErrorMessage(err.message?.toUpperCase() || 'AUTHENTICATION FAILED');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onEnterVault();
    }
  };

  return (
    <div className="relative w-full h-screen min-h-[680px] lg:h-[100dvh] overflow-y-auto lg:overflow-hidden bg-transparent text-white flex flex-col justify-between select-none">
      {/* ============================================================
          ZONE 1 — TOP NAVIGATION
          ============================================================ */}
      <header className="relative lg:absolute top-0 left-0 right-0 z-20 px-6 sm:px-10 lg:px-[clamp(24px,5vw,90px)] py-6 lg:py-[28px] border-b border-white/[0.08] lg:border-none">
        <div className="w-full grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center">
          {/* LEFT: Wordmark + Minimal Geometric Lock Mark */}
          <div className="flex items-center gap-3">
            {/* Minimal Geometric Lock Icon */}
            <div
              onClick={() => handleNavClick('landing')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <svg
                width="15"
                height="16"
                viewBox="0 0 15 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-90 group-hover:opacity-100 transition-opacity"
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

              <span className="font-sans-main font-medium text-[18px] tracking-[0.12em] uppercase text-white">
                SECUREVAULT
              </span>
            </div>
          </div>

          {/* CENTER: Clean JetBrains Mono Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-9 xl:gap-12">
            {[
              { id: 'vault', label: 'VAULT' },
              { id: 'security', label: 'SECURITY' },
              { id: 'shares', label: 'SHARES' },
              { id: 'audit', label: 'AUDIT' },
            ].map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-1 font-mono-tech text-xs sm:text-sm tracking-[0.16em] uppercase transition-colors ${
                    isActive ? 'text-white font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Enter Vault Action Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              id="top-nav-enter-vault-btn"
              type="button"
              onClick={onEnterVault}
              className="font-mono-tech text-xs sm:text-sm tracking-[0.16em] uppercase text-white bg-transparent border border-white/[0.28] rounded-[3px] px-6 py-3.5 hover:bg-white/[0.10] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              {isLoggedIn ? 'OPEN VAULT' : 'ENTER VAULT'}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white focus:outline-none"
              aria-label="Toggle navigation"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className="w-full h-[1.5px] bg-white block" />
                <span className="w-full h-[1.5px] bg-white block" />
                <span className="w-full h-[1.5px] bg-white block" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 font-mono-tech text-sm tracking-widest uppercase">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('vault');
              }}
              className="text-left text-white/80 hover:text-white py-1"
            >
              VAULT
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('security');
              }}
              className="text-left text-white/80 hover:text-white py-1"
            >
              SECURITY
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('shares');
              }}
              className="text-left text-white/80 hover:text-white py-1"
            >
              SHARES
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('audit');
              }}
              className="text-left text-white/80 hover:text-white py-1"
            >
              AUDIT
            </button>
          </div>
        )}
      </header>

      {/* ============================================================
          ZONE 2 — MAIN HERO (Asymmetric Two-Column)
          ============================================================ */}
      <main className="relative z-10 w-full flex-1 flex items-center px-6 sm:px-10 lg:px-[clamp(24px,5vw,90px)] py-8 lg:py-0">
        <div className="w-full max-w-[1720px] mx-auto grid grid-cols-1 lg:grid-cols-[50%_50%] items-center gap-10 lg:gap-12">
          {/* ------------------------------------------------------------
              LEFT HERO AREA (Negative Space, Headline, Subtext, Micro Status)
              ------------------------------------------------------------ */}
          <div className="flex flex-col justify-center animate-hero-entrance">
            {/* Technical Eyebrow */}
            <div className="font-mono-tech text-xs tracking-[0.20em] text-white/[0.65] uppercase mb-4 sm:mb-6">
              [ ENCRYPTED FILE INFRASTRUCTURE ]
            </div>

            {/* Large Hero Headline */}
            <h1 className="font-sans-main font-normal sm:font-medium text-white text-[clamp(46px,5.8vw,100px)] leading-[0.92] tracking-[-0.055em] mb-6">
              SECURE
              <br />
              YOUR FILES.
              <br />
              <span className="block mt-1 sm:mt-2">
                CONTROL{' '}
                <span className="font-editorial italic text-[1.05em] text-[#bdbdbd] font-normal tracking-[-0.03em] inline-block">
                  EVERY ACCESS.
                </span>
              </span>
            </h1>

            {/* Subtext */}
            <p className="font-sans-main font-normal text-[16px] sm:text-[17px] lg:text-[18px] text-white/[0.70] leading-[1.6] max-w-[520px] mb-6 sm:mb-8">
              Encrypted file sharing with verified integrity, granular access control, and complete security visibility.
            </p>

            {/* Micro Status Technical Line */}
            <div className="font-mono-tech text-xs tracking-[0.14em] text-white/[0.70] flex items-center gap-3 sm:gap-4 flex-wrap">
              <span>AES-256-GCM</span>
              <span className="text-white/30">/</span>
              <span>SHA-256 VERIFIED</span>
              <span className="text-white/30">/</span>
              <span>RBAC ENFORCED</span>
            </div>
          </div>

          {/* ------------------------------------------------------------
              RIGHT HERO AREA (Open Security Terminal Interaction)
              ------------------------------------------------------------ */}
          <div className="w-full max-w-[500px] lg:ml-auto flex flex-col justify-center animate-hero-entrance animation-delay-200">
            {/* Top Label */}
            <div className="inline-flex items-center self-start px-3.5 py-2 bg-white/[0.07] border border-white/[0.14] rounded-[2px] font-mono-tech text-xs tracking-[0.18em] text-white/90 uppercase mb-4 sm:mb-5">
              [ SECURE ACCESS ]
            </div>

            {/* Right Title */}
            <h2 className="font-sans-main font-normal text-[clamp(30px,3vw,48px)] leading-[0.98] tracking-[-0.04em] text-white mb-3">
              ENTER THE
              <br />
              SECURE VAULT
            </h2>

            {/* Right Description */}
            <p className="font-sans-main font-normal text-sm sm:text-base text-white/60 leading-relaxed max-w-[420px] mb-6">
              Access encrypted objects, manage permissions, and review your security activity.
            </p>

            {/* Minimal Entry / Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div className="space-y-1.5">
                <label className="block font-mono-tech text-xs tracking-[0.16em] text-white/60 uppercase">
                  EMAIL
                </label>
                <input
                  id="hero-input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@securevault.internal"
                  className="w-full bg-transparent border-none border-b border-white/30 focus:border-b-white rounded-none py-3.5 px-0.5 font-sans-main text-base text-white placeholder:text-white/25 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono-tech text-xs tracking-[0.16em] text-white/60 uppercase">
                  PASSWORD
                </label>
                <input
                  id="hero-input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border-none border-b border-white/30 focus:border-b-white rounded-none py-3.5 px-0.5 font-sans-main text-base text-white placeholder:text-white/25 focus:outline-none transition-colors"
                />
              </div>

              {errorMessage && (
                <div className="font-mono-tech text-xs text-red-400 tracking-wider pt-1">
                  [{errorMessage}]
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 space-y-3">
                <button
                  id="hero-primary-enter-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[56px] bg-white/[0.92] hover:bg-white text-[#050505] border-none rounded-[3px] font-mono-tech text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase transition-all duration-200 hover:-translate-y-[1px] flex items-center justify-center cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'AUTHENTICATING...'
                    : isLoggedIn
                    ? 'OPEN SECUREVAULT'
                    : 'ENTER SECUREVAULT'}
                </button>

                <button
                  id="hero-secondary-demo-btn"
                  type="button"
                  onClick={onRunDemo}
                  className="w-full h-[56px] bg-transparent hover:bg-white/[0.08] text-white border border-white/[0.24] rounded-[3px] font-mono-tech text-xs sm:text-sm font-medium tracking-[0.18em] uppercase transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  RUN SECURITY DEMO
                </button>
              </div>
            </form>

            {/* Right Technical Metadata (Compact 2-Column Layout with Thin Dividers) */}
            <div className="mt-7 pt-4 border-t border-white/[0.12] grid grid-cols-2 gap-x-6 gap-y-3.5 font-mono-tech">
              <div className="pb-2 border-b border-white/[0.08]">
                <div className="text-white/50 tracking-[0.14em] uppercase text-xs mb-0.5">
                  ENCRYPTION
                </div>
                <div className="text-white font-medium tracking-wider text-sm">
                  AES-256-GCM
                </div>
              </div>

              <div className="pb-2 border-b border-white/[0.08]">
                <div className="text-white/50 tracking-[0.14em] uppercase text-xs mb-0.5">
                  INTEGRITY
                </div>
                <div className="text-white font-medium tracking-wider text-sm">
                  SHA-256
                </div>
              </div>

              <div>
                <div className="text-white/50 tracking-[0.14em] uppercase text-xs mb-0.5">
                  ACCESS
                </div>
                <div className="text-white font-medium tracking-wider text-sm">
                  OWNER / EDITOR / VIEWER
                </div>
              </div>

              <div>
                <div className="text-white/50 tracking-[0.14em] uppercase text-xs mb-0.5">
                  AUDIT
                </div>
                <div className="text-white font-medium tracking-wider text-sm">
                  IMMUTABLE
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
          ZONE 3 — BOTTOM SECURITY STATUS
          ============================================================ */}
      <footer className="relative z-20 border-t border-white/[0.12] px-6 sm:px-10 lg:px-[clamp(24px,5vw,90px)] py-[18px]">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono-tech text-xs text-white/50 tracking-[0.14em] uppercase">
          {/* Bottom Left */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400/90 inline-block" />
            <span>SYSTEM STATUS</span>
            <span className="text-white/30">//</span>
            <span className="text-white/90 font-medium">VAULT ONLINE</span>
          </div>

          {/* Bottom Center */}
          <div className="hidden md:flex items-center gap-3 text-white/60">
            <span>AES-256-GCM</span>
            <span className="text-white/20">/</span>
            <span>SHA-256</span>
            <span className="text-white/20">/</span>
            <span>RBAC</span>
            <span className="text-white/20">/</span>
            <span>AUDIT</span>
          </div>

          {/* Bottom Right */}
          <div className="flex items-center gap-2">
            <span>SECURE FILE INFRASTRUCTURE</span>
            <span className="text-white/30">//</span>
            <span className="text-white/90 font-medium">v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
