import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: { name: string; role: string; email: string }) => void;
  initialMode?: 'splash' | 'login' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, initialMode = 'splash' }) => {
  const [mode, setMode] = useState<'splash' | 'login' | 'signup'>(initialMode);
  
  // Login Form State
  const [email, setEmail] = useState('analyst@sovereign.sec');
  const [password, setPassword] = useState('••••••••••••');
  
  // Sign Up Form State
  const [name, setName] = useState('Security Analyst');
  const [role, setRole] = useState('SOC Senior Analyst');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: email.split('@')[0] || 'Analyst',
      role: 'SOC Senior Analyst',
      email: email,
    });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: name || 'New Analyst',
      role: role || 'Security Researcher',
      email: signupEmail || 'analyst@sovereign.sec',
    });
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6 font-ui relative overflow-hidden">
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
      >
        <source src="https://stream.mux.com/F54ZJ4Z7n7J02Jk5k02s01yJ5Z00mZ02J7k00.m3u8" type="application/x-mpegURL" />
        <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/70 z-0 pointer-events-none" />

      {/* SPLASH SCREEN */}
      {mode === 'splash' && (
        <div className="w-full max-w-xl sovereign-panel p-8 rounded-2xl shadow-2xl text-center space-y-6 relative z-10 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 mx-auto rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs font-mono inline-block">
              Sovereign Cyber Security Suite
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              SOVEREIGN NETWORK PACKET ANALYZER
            </h1>
            <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
              Real-time promiscuous network capture, OSI layer 2–7 dissection, heuristic threat detection, and AI copilot diagnostics.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left text-xs">
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.08]">
              <span className="text-white font-medium block">Live Stream</span>
              <span className="text-white/40 text-[10px] font-mono">TCP/UDP/ICMP</span>
            </div>
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.08]">
              <span className="text-white font-medium block">Threat Radar</span>
              <span className="text-white/40 text-[10px] font-mono">Scans & Floods</span>
            </div>
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.08]">
              <span className="text-white font-medium block">AI Diagnostics</span>
              <span className="text-white/40 text-[10px] font-mono">MITRE Mapping</span>
            </div>
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.08]">
              <span className="text-white font-medium block">Data Export</span>
              <span className="text-white/40 text-[10px] font-mono">PDF/CSV/JSON</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setMode('login')}
              className="w-full sm:w-auto px-7 py-2.5 bg-white hover:bg-white/90 text-black text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onLoginSuccess({ name: 'Guest Analyst', role: 'SOC Intern', email: 'guest@sovereign.sec' })}
              className="w-full sm:w-auto px-7 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-full border border-white/15 transition-all cursor-pointer backdrop-blur-md"
            >
              Guest Access
            </button>
          </div>
        </div>
      )}

      {/* LOGIN PAGE */}
      {mode === 'login' && (
        <div className="w-full max-w-sm sovereign-panel p-6 rounded-2xl shadow-2xl space-y-5 relative z-10 animate-in fade-in zoom-in-95">
          <button
            onClick={() => setMode('splash')}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center mb-1">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Analyst Portal Sign In
            </h2>
            <p className="text-xs text-white/50">
              Enter your credentials to access network operations.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-white/80 font-medium block text-[11px]">Email</label>
              <div className="relative font-mono">
                <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/50 text-white pl-8 pr-3 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-white/80 font-medium block text-[11px]">Password</label>
              <div className="relative font-mono">
                <KeyRound className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/50 text-white pl-8 pr-3 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-1.5 text-white/60 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-white rounded" />
                <span>Remember me</span>
              </label>
              <span className="text-white/70 hover:underline cursor-pointer">Forgot password?</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white hover:bg-white/90 text-black text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Access Operations Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-white/50 border-t border-white/[0.08]">
            Don't have an analyst account?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-white hover:underline cursor-pointer font-medium"
            >
              Register here
            </button>
          </div>
        </div>
      )}

      {/* SIGN UP PAGE */}
      {mode === 'signup' && (
        <div className="w-full max-w-sm sovereign-panel p-6 rounded-2xl shadow-2xl space-y-5 relative z-10 animate-in fade-in zoom-in-95">
          <button
            onClick={() => setMode('login')}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>

          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center mb-1">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Register Analyst Profile
            </h2>
            <p className="text-xs text-white/50">
              Create an operational profile to save sessions.
            </p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-white/80 font-medium block text-[11px]">Full Name</label>
              <input
                type="text"
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black/50 text-white px-3 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-white/80 font-medium block text-[11px]">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/80 text-white px-3 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-white/40"
              >
                <option value="SOC Security Analyst">SOC Security Analyst</option>
                <option value="Cyber Security Intern">Cyber Security Intern</option>
                <option value="Network Vulnerability Auditor">Network Vulnerability Auditor</option>
                <option value="Incident Response Lead">Incident Response Lead</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-white/80 font-medium block text-[11px]">Email Address</label>
              <input
                type="email"
                placeholder="analyst@sovereign.sec"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                className="w-full bg-black/50 text-white px-3 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-white/40 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-white/80 font-medium block text-[11px]">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                className="w-full bg-black/50 text-white px-3 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-white/40 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white hover:bg-white/90 text-black text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-1"
            >
              <span>Create Account</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-white/50 border-t border-white/[0.08]">
            Already registered?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-white hover:underline cursor-pointer font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
