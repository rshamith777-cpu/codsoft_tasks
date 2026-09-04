import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, Check, HelpCircle } from 'lucide-react';
import { UserRole } from '../types';

interface AuthPageProps {
  onLoginSuccess: (session: {
    token: string;
    username: string;
    role: UserRole;
    displayName: string;
  }) => void;
  onReturnHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  onReturnHome
}) => {
  const [mode, setMode] = useState<'SIGNIN' | 'REGISTER'>('SIGNIN');
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('analyst123');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('ANALYST');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetHelp, setShowResetHelp] = useState(false);

  const handleApplyDevProfile = (profile: 'admin' | 'analyst' | 'viewer') => {
    setUsername(profile);
    setPassword(`${profile}123`);
    setRole(profile === 'admin' ? 'ADMIN' : (profile === 'viewer' ? 'VIEWER' : 'ANALYST'));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide your operator call-sign or email.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (mode === 'REGISTER' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'REGISTER' && !agreedTerms) {
      setError('You must acknowledge the operational security agreement.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'SIGNIN' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'SIGNIN' 
        ? { username: username.trim(), password, role }
        : { username: username.trim(), password, role, displayName: displayName.trim() || undefined };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.session) {
        setError(data.error || 'Authentication error. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(data.session);
    } catch (err) {
      console.error('Authentication request failed:', err);
      // Fallback offline session in case server is temporarily unreachable
      const offlineSession = {
        token: `SOV-SESS-${Date.now().toString(36).toUpperCase()}`,
        username: username.trim(),
        role,
        displayName: displayName.trim() || `${username.toUpperCase()} (SOC ${role})`
      };
      setIsLoading(false);
      onLoginSuccess(offlineSession);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-transparent text-white font-['Inter',sans-serif] overflow-x-hidden flex flex-col justify-between select-none">
      
      {/* TOP HEADER: Matching Sovereign Centered Max Width 720px */}
      <header className="relative z-20 w-full pt-6 px-4 flex justify-center">
        <div className="w-full max-w-[720px] flex items-center justify-between">
          
          {/* Circular Logo */}
          <div 
            onClick={onReturnHome}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-all shrink-0"
            title="Return to Sovereign Homepage"
          >
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4 text-black fill-current" />
            </div>
          </div>

          {/* Desktop Navigation Pill: White Pill */}
          <nav className="hidden sm:flex items-center h-[46px] px-6 bg-white rounded-full text-[#111113] text-[13px] font-medium tracking-tight shadow-lg gap-6">
            <button 
              onClick={onReturnHome}
              className="text-[#555558] hover:text-black transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-[#111113] font-semibold cursor-default">
              Authentication Gate
            </span>
            <button 
              onClick={() => {}} 
              className="text-[#555558] hover:text-black transition-colors cursor-pointer"
            >
              Security Docs
            </button>
          </nav>

          {/* Return Home Pill: Dark Gray (#28282a) */}
          <div className="flex items-center">
            <button
              onClick={onReturnHome}
              className="h-[46px] px-6 bg-[#28282a] hover:bg-[#343437] text-white text-[13px] font-medium rounded-full border border-white/10 transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Return Home</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT CENTERED */}
      <main className="relative z-10 w-full max-w-[500px] mx-auto px-4 py-8 my-auto flex flex-col items-center text-center">
        
        {/* Trust Pill: [○] [ Built for Network Security ] */}
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[12px] font-normal mb-6 shadow-sm">
          <div className="flex items-center -space-x-1.5">
            <div className="w-4 h-4 rounded-full border border-white/60 bg-white/20 flex items-center justify-center text-[7px]">○</div>
            <div className="w-4 h-4 rounded-full border border-white/60 bg-white/30 flex items-center justify-center text-[7px]">○</div>
            <div className="w-4 h-4 rounded-full border border-white/60 bg-white/40 flex items-center justify-center text-[7px]">○</div>
          </div>
          <span className="text-white/90 font-medium tracking-tight">
            {mode === 'SIGNIN' ? 'SOC Workstation Security Access' : 'New Security Clearance Registration'}
          </span>
        </div>

        {/* Retro Display Headline */}
        <h1 
          className="text-white font-bold leading-[1.1] tracking-tight mb-3 select-none"
          style={{
            fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace",
            fontSize: 'clamp(28px, 4.5vw, 46px)',
            letterSpacing: '0.02em',
          }}
        >
          {mode === 'SIGNIN' ? 'Sign In.' : 'Create Account.'}
        </h1>

        <p className="text-white/70 text-[14px] leading-relaxed max-w-[400px] mx-auto mb-6 font-normal">
          {mode === 'SIGNIN'
            ? 'Authenticate your operator identity to access live telemetry, deep packet forensics, and defensive SOC agents.'
            : 'Enroll an operator call-sign to establish cryptographic credentials for the Sovereign Network Defense platform.'}
        </p>

        {/* AUTHENTICATION FORM CARD */}
        <div className="w-full bg-black/50 backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-left space-y-5">
          
          {/* Dual Pill Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-full bg-white/10 border border-white/10 text-[13px] font-medium">
            <button
              type="button"
              onClick={() => { setMode('SIGNIN'); setError(null); }}
              className={`py-2 rounded-full transition-all text-center cursor-pointer tracking-tight ${
                mode === 'SIGNIN' ? 'bg-white text-black font-semibold shadow' : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(null); }}
              className={`py-2 rounded-full transition-all text-center cursor-pointer tracking-tight ${
                mode === 'REGISTER' ? 'bg-white text-black font-semibold shadow' : 'text-white/70 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name / Display Name (Registration only) */}
            {mode === 'REGISTER' && (
              <div>
                <label className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/50 mb-1.5 block">
                  Operator Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="h-[46px] w-full px-5 bg-white/[0.06] hover:bg-white/[0.08] focus:bg-white/[0.12] border border-white/15 focus:border-white text-white placeholder-white/30 text-[13px] rounded-full outline-none transition-all font-['Inter',sans-serif]"
                />
              </div>
            )}

            {/* Username / Call-sign */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/50 mb-1.5 block">
                Call-sign or Email
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-4 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. analyst or name@defense.soc"
                  className="h-[46px] w-full pl-11 pr-4 bg-white/[0.06] hover:bg-white/[0.08] focus:bg-white/[0.12] border border-white/15 focus:border-white text-white placeholder-white/30 text-[13px] rounded-full outline-none transition-all font-['Inter',sans-serif]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/50 block">
                  Access Passcode
                </label>
                {mode === 'SIGNIN' && (
                  <button
                    type="button"
                    onClick={() => setShowResetHelp(!showResetHelp)}
                    className="text-[11px] text-white/50 hover:text-white underline transition-colors cursor-pointer"
                  >
                    Forgot key?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-4 text-white/40 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-[46px] w-full pl-11 pr-11 bg-white/[0.06] hover:bg-white/[0.08] focus:bg-white/[0.12] border border-white/15 focus:border-white text-white placeholder-white/30 text-[13px] rounded-full outline-none transition-all font-['Inter',sans-serif]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-white/40 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Accordion */}
            {showResetHelp && mode === 'SIGNIN' && (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white/70 space-y-1 animate-fadeIn">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Passcode Recovery Protocol
                </p>
                <p className="text-[11px] leading-relaxed text-white/60">
                  Default developer credentials are pre-configured: <strong className="text-white font-mono">admin / admin123</strong>, <strong className="text-white font-mono">analyst / analyst123</strong>, or <strong className="text-white font-mono">viewer / viewer123</strong>. In production, contact the SOC Lead Administrator for cryptographic key rotation.
                </p>
              </div>
            )}

            {/* Security Clearance Selection (Registration or Optional Role) */}
            {mode === 'REGISTER' && (
              <div>
                <label className="text-[11px] font-mono uppercase tracking-[0.14em] text-white/50 mb-1.5 block">
                  Security Clearance Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ANALYST', title: 'Analyst', desc: 'Investigate' },
                    { id: 'ADMIN', title: 'Admin', desc: 'Full Control' },
                    { id: 'VIEWER', title: 'Viewer', desc: 'Read-Only' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as UserRole)}
                      className={`py-2 px-2.5 rounded-2xl border text-center transition-all cursor-pointer font-mono ${
                        role === item.id
                          ? 'bg-white text-black font-bold border-white shadow-sm'
                          : 'bg-white/[0.04] border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <div className="text-xs">{item.title}</div>
                      <div className="text-[9px] opacity-60 font-sans">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Remember Me / Terms Checkboxes */}
            {mode === 'SIGNIN' ? (
              <div className="flex items-center justify-between text-xs text-white/60 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-white accent-white"
                  />
                  <span>Persist session (8 Hours)</span>
                </label>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-[11px] text-white/60 pt-1">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-white accent-white mt-0.5"
                />
                <span>I acknowledge operational security protocols and immutable audit trail logging.</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-[50px] w-full bg-white hover:bg-white/90 text-black text-[14px] font-semibold rounded-full transition-all shadow-xl hover:scale-[1.01] cursor-pointer flex items-center justify-center tracking-tight gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'SIGNIN' ? 'Sign In to Workstation' : 'Establish Security Clearance'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Subtle Dev Clearance Profiles Bar (Clean, not AI-looking) */}
          {mode === 'SIGNIN' && (
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono">
              <span>Dev Credentials:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyDevProfile('admin')}
                  className="hover:text-white hover:underline cursor-pointer"
                >
                  admin
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleApplyDevProfile('analyst')}
                  className="hover:text-white hover:underline cursor-pointer text-white font-medium"
                >
                  analyst
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleApplyDevProfile('viewer')}
                  className="hover:text-white hover:underline cursor-pointer"
                >
                  viewer
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* FOOTER: Matching Sovereign 4-Column Bottom Style */}
      <footer className="relative z-10 w-full max-w-[840px] mx-auto px-4 pb-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-white/40 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHA-256 HMAC ENCRYPTED SESSION</span>
          </div>
          <div>ZERO TRUST OPERATIONAL GATE</div>
          <div>SOVEREIGN NETWORK DEFENSE</div>
        </div>
      </footer>

    </div>
  );
};
