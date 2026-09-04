import React, { useState } from 'react';
import { X, Lock, Shield, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { Button } from './ui/Button';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Full Name is required.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        const data = await api.register(name.trim(), email.trim(), password);
        onSuccess(data.user);
        onClose();
      } else {
        const data = await api.login(email.trim(), password);
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      {/* Dimmed backdrop - subtle on left to preserve cinematic video visibility */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Asymmetric Right-Side Translucent Authentication Surface */}
      <div className="relative w-full max-w-[460px] h-full bg-[#05070c]/90 backdrop-blur-xl border-l border-white/15 shadow-2xl flex flex-col justify-between p-8 sm:p-10 z-10 animate-slideInRight text-white overflow-y-auto">
        <div>
          {/* Top Header & Close */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
            <div className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
              <Shield className="w-3.5 h-3.5 text-white/70" />
              <span>SECURE ACCESS ENCLAVE</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-[2px] transition-colors focus:outline-none"
              aria-label="Close authentication window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-b border-white/15 mb-6 font-mono-tech text-xs tracking-wider uppercase">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`pb-2.5 flex-1 text-center transition-colors relative ${
                mode === 'login' ? 'text-white font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              AUTHENTICATE
              {mode === 'login' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`pb-2.5 flex-1 text-center transition-colors relative ${
                mode === 'register' ? 'text-white font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              INITIALIZE VAULT
              {mode === 'register' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
            </button>
          </div>

          {/* Title and Editorial Prompt */}
          <div className="mb-6">
            <h2 className="font-sans-main text-2xl font-normal text-white tracking-tight leading-snug">
              {mode === 'login' ? 'Access your encrypted vault.' : 'Establish cryptographic identity.'}
            </h2>
            <p className="font-sans-main text-xs text-white/50 mt-1">
              Zero plaintext exposure. Passwords derived using scrypt with unique salt.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="block font-mono-tech text-[10px] tracking-[0.16em] text-white/50 uppercase">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Security Officer"
                  required
                  className="w-full bg-transparent border-none border-b border-white/25 focus:border-b-white/90 rounded-none py-2 px-0 font-sans-main text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-mono-tech text-[10px] tracking-[0.16em] text-white/50 uppercase">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@securevault.internal"
                required
                className="w-full bg-transparent border-none border-b border-white/25 focus:border-b-white/90 rounded-none py-2 px-0 font-sans-main text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono-tech text-[10px] tracking-[0.16em] text-white/50 uppercase">
                MASTER PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-transparent border-none border-b border-white/25 focus:border-b-white/90 rounded-none py-2 px-0 font-sans-main text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label className="block font-mono-tech text-[10px] tracking-[0.16em] text-white/50 uppercase">
                  CONFIRM MASTER PASSWORD
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-transparent border-none border-b border-white/25 focus:border-b-white/90 rounded-none py-2 px-0 font-sans-main text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="font-mono-tech text-[11px] text-red-400 tracking-wider pt-1">
                [{error}]
              </div>
            )}

            <div className="pt-4">
              <Button
                variant="primary"
                size="md"
                type="submit"
                className="w-full py-3"
                isLoading={loading}
              >
                {loading
                  ? 'VERIFYING CREDENTIALS...'
                  : mode === 'login'
                  ? 'ENTER VAULT'
                  : 'INITIALIZE ACCOUNT'}
              </Button>
            </div>
          </form>
        </div>

        {/* Technical Footer */}
        <div className="pt-6 border-t border-white/10 font-mono-tech text-[9.5px] text-white/40 uppercase tracking-wider flex items-center justify-between">
          <span>AES-256-GCM / SHA-256</span>
          <span>IMMUTABLE RBAC</span>
        </div>
      </div>
    </div>
  );
};
