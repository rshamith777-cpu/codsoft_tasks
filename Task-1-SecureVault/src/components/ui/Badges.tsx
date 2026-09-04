import React from 'react';
import { Shield, Lock, CheckCircle2, AlertTriangle, XCircle, Info, Radio } from 'lucide-react';
import { UserRole, SeverityLevel } from '../../types';

export interface CryptoBadgeProps {
  label: string;
  variant?: 'mono' | 'highlight';
  className?: string;
}

export const CryptoBadge: React.FC<CryptoBadgeProps> = ({
  label,
  variant = 'mono',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 font-mono-tech text-xs tracking-[0.12em] uppercase border ${
        variant === 'highlight'
          ? 'border-white/40 bg-white/10 text-white font-semibold'
          : 'border-white/18 bg-white/[0.04] text-white/80'
      } rounded-[3px] ${className}`}
    >
      {label}
    </span>
  );
};

export interface RoleBadgeProps {
  role: UserRole | string;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const normalized = (role || 'VIEWER').toUpperCase();

  const roleStyles = {
    OWNER: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
    EDITOR: 'border-sky-500/35 bg-sky-500/10 text-sky-300',
    VIEWER: 'border-white/20 bg-white/5 text-white/70',
  };

  const currentStyle = roleStyles[normalized as keyof typeof roleStyles] || roleStyles.VIEWER;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono-tech text-xs tracking-[0.14em] uppercase border rounded-[3px] ${currentStyle} ${className}`}
    >
      <Shield className="w-3 h-3 opacity-80" />
      {normalized}
    </span>
  );
};

export interface IntegrityBadgeProps {
  status: 'VERIFIED' | 'UNVERIFIED' | 'COMPROMISED' | boolean;
  className?: string;
}

export const IntegrityBadge: React.FC<IntegrityBadgeProps> = ({ status, className = '' }) => {
  const isVerified = status === true || status === 'VERIFIED';
  const isCompromised = status === 'COMPROMISED';

  if (isCompromised) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono-tech text-xs tracking-[0.14em] uppercase border border-red-500/40 bg-red-500/10 text-red-300 rounded-[3px] ${className}`}
      >
        <XCircle className="w-3.5 h-3.5 text-red-400" />
        INTEGRITY FAILED
      </span>
    );
  }

  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono-tech text-xs tracking-[0.14em] uppercase border border-emerald-500/35 bg-emerald-500/10 text-emerald-300 rounded-[3px] ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        SHA-256 VERIFIED
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono-tech text-xs tracking-[0.14em] uppercase border border-amber-500/35 bg-amber-500/10 text-amber-300 rounded-[3px] ${className}`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
      PENDING VERIFICATION
    </span>
  );
};

export interface StatusIndicatorProps {
  status: 'ONLINE' | 'WARNING' | 'CRITICAL' | 'STANDBY';
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className = '',
}) => {
  const dotColor = {
    ONLINE: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    WARNING: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    CRITICAL: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] animate-pulse',
    STANDBY: 'bg-white/40',
  }[status];

  return (
    <div className={`inline-flex items-center gap-2 font-mono-tech text-xs tracking-[0.14em] uppercase text-white/70 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label && <span>{label}</span>}
    </div>
  );
};

export interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const normalized = (severity || 'INFO').toUpperCase();

  const styles = {
    CRITICAL: 'border-red-500/40 bg-red-500/10 text-red-300',
    WARNING: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    INFO: 'border-white/20 bg-white/5 text-white/70',
  };

  const style = styles[normalized as keyof typeof styles] || styles.INFO;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 font-mono-tech text-xs tracking-[0.14em] uppercase border rounded-[3px] ${style} ${className}`}
    >
      [{normalized}]
    </span>
  );
};
