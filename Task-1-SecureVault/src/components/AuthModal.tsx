import React, { useState } from 'react';
import { X, Lock, Shield, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Full Name is required.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        const data = await api.register(name, email, password);
        onSuccess(data.user);
        onClose();
      } else {
        const data = await api.login(email, password);
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCredentials = () => {
    setName('Security Officer');
    setEmail('officer@securevault.internal');
    setPassword('CyberSecurity2026!');
    setConfirmPassword('CyberSecurity2026!');
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        id="auth-modal-dialog"
        className="w-full max-w-md bg-[#0a0a0c] border border-white/20 p-6 sm:p-8 shadow-2xl relative"
        style={{ borderRadius: '8px' }}
      >
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-white/70" />
            <span className="font-mono-tech text-[10px] text-white/40 tracking-widest uppercase">
              AUTHENTICATION GATEWAY
            </span>
          </div>
          <h2 id="auth-modal-title" className="text-xl font-medium tracking-tight text-white">
            {mode === 'login' ? 'Sign In to SecureVault' : 'Create Secure Account'}
          </h2>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 border border-white/10 p-1 bg-white/5 mb-6">
          <button
            id="tab-login"
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 font-mono-tech text-xs tracking-widest uppercase transition-colors ${
              mode === 'login'
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            SIGN IN
          </button>
          <button
            id="tab-register"
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 font-mono-tech text-xs tracking-widest uppercase transition-colors ${
              mode === 'register'
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            id="auth-error-alert"
            className="mb-4 p-3 border border-red-500/40 bg-red-500/10 text-red-300 font-mono-tech text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-name"
                className="block font-mono-tech text-[11px] text-white/70 tracking-wider uppercase mb-1.5"
              >
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block font-mono-tech text-[11px] text-white/70 tracking-wider uppercase mb-1.5"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block font-mono-tech text-[11px] text-white/70 tracking-wider uppercase mb-1.5"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="block font-mono-tech text-[11px] text-white/70 tracking-wider uppercase mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-mono-tech text-[11px] text-white/60">
                <input
                  id="auth-remember"
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="rounded-none accent-white"
                />
                <span>Remember session</span>
              </label>
              <span className="font-mono-tech text-[10px] text-white/40">
                [ AUTO-TIMEOUT: 60M ]
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>AUTHENTICATING CIPHER...</span>
            ) : mode === 'login' ? (
              <span>SIGN IN</span>
            ) : (
              <span>CREATE SECURE ACCOUNT</span>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="font-mono-tech text-[10px] text-white/40">
            QUICK EVALUATION:
          </span>
          <button
            id="btn-quick-fill-demo"
            type="button"
            onClick={handleDemoCredentials}
            className="font-mono-tech text-[10px] text-white/80 hover:text-white underline decoration-white/30"
          >
            Fill Demo Security Officer Credentials
          </button>
        </div>

        {/* Security Notice Footer */}
        <div className="mt-4 p-2.5 border border-white/10 bg-white/5 text-[10px] font-mono-tech text-white/50 leading-normal">
          <div className="flex items-center gap-1.5 text-white/70 mb-1 font-semibold">
            <Shield className="w-3 h-3 text-white/70" />
            SECURITY NOTICE
          </div>
          Passwords are cryptographically salted and hashed using scrypt with unique 128-bit salts. No plaintext is ever stored.
        </div>
      </div>
    </div>
  );
};
