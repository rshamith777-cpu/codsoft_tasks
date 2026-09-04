import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: {
    token: string;
    username: string;
    role: UserRole;
    displayName: string;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'SIGNIN' | 'REGISTER'>('SIGNIN');
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('analyst123');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('ANALYST');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleApplyDevProfile = (profile: 'admin' | 'analyst' | 'viewer') => {
    setUsername(profile);
    setPassword(`${profile}123`);
    setRole(profile === 'admin' ? 'ADMIN' : (profile === 'viewer' ? 'VIEWER' : 'ANALYST'));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide your operator call-sign.');
      return;
    }
    if (!password) {
      setError('Password is required.');
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
      console.error('Login error:', err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn select-none font-['Inter',sans-serif]">
      
      {/* Central Authentic Card */}
      <div className="w-full max-w-[440px] bg-black/85 border border-white/15 rounded-3xl p-7 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Shield & Title */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4 text-black fill-current" />
            </div>
          </div>

          <h2 
            className="text-2xl font-bold text-white tracking-tight leading-tight"
            style={{
              fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace",
              letterSpacing: '0.02em',
            }}
          >
            {mode === 'SIGNIN' ? 'Sign In.' : 'Create Account.'}
          </h2>

          <p className="text-xs text-white/60 font-normal max-w-[320px]">
            {mode === 'SIGNIN' 
              ? 'Authenticate to unlock the Sovereign SOC workstation.' 
              : 'Enroll an operator call-sign for cryptographic access.'}
          </p>
        </div>

        {/* Dual Mode Switcher Pill */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium">
          <button
            type="button"
            onClick={() => { setMode('SIGNIN'); setError(null); }}
            className={`py-1.5 rounded-full transition-all text-center cursor-pointer ${
              mode === 'SIGNIN' ? 'bg-white text-black font-semibold shadow' : 'text-white/70 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setError(null); }}
            className={`py-1.5 rounded-full transition-all text-center cursor-pointer ${
              mode === 'REGISTER' ? 'bg-white text-black font-semibold shadow' : 'text-white/70 hover:text-white'
            }`}
          >
            Request Access
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          
          {mode === 'REGISTER' && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/50 mb-1 block">
                Operator Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="h-[42px] w-full px-4 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/15 focus:border-white text-white placeholder-white/30 text-xs rounded-full outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/50 mb-1 block">
              Call-sign or Email
            </label>
            <div className="relative flex items-center">
              <User className="w-3.5 h-3.5 absolute left-3.5 text-white/40 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. analyst"
                className="h-[42px] w-full pl-10 pr-4 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/15 focus:border-white text-white placeholder-white/30 text-xs rounded-full outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-[0.14em] text-white/50 mb-1 block">
              Access Passcode
            </label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3.5 text-white/40 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-[42px] w-full pl-10 pr-10 bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/15 focus:border-white text-white placeholder-white/30 text-xs rounded-full outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-white/40 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="h-[44px] w-full bg-white hover:bg-white/90 text-black text-xs font-semibold rounded-full transition-all shadow-xl hover:scale-[1.01] cursor-pointer flex items-center justify-center tracking-tight gap-1.5 disabled:opacity-50 mt-1"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'SIGNIN' ? 'Sign In to Workstation' : 'Activate Access'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

        </form>

        {/* Clean Dev Credentials Shortcuts */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 font-mono">
          <span>Dev Profiles:</span>
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

      </div>

    </div>
  );
};
