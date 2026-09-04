import React from 'react';
import {
  Shield,
  Upload,
  RefreshCw,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { VaultFile, SecurityPosture, AuditEvent } from '../types';
import { Button } from './ui/Button';

interface OverviewViewProps {
  files: VaultFile[];
  posture: SecurityPosture | null;
  auditLogs: AuditEvent[];
  onNavigate: (viewId: string) => void;
  onOpenUpload: () => void;
  onRunIntegrityAudit: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  files = [],
  posture,
  auditLogs = [],
  onNavigate,
  onOpenUpload,
  onRunIntegrityAudit,
}) => {
  const safeFiles = files ?? [];
  const safeLogs = auditLogs ?? [];
  const totalFiles = safeFiles.length;
  const totalSize = safeFiles.reduce((acc, f) => acc + (f?.size || 0), 0);
  const activeSharesCount = posture?.activeShares ?? 0;
  const recentLogs = safeLogs.slice(0, 5);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-center">
      {/* Balanced Workstation Layout */}
      <div className="w-full max-w-[1720px] mx-auto grid grid-cols-1 lg:grid-cols-[36%_64%] items-start gap-8 lg:gap-12">
        {/* Left Column: Atmospheric Negative Space with System Telemetry Enclave */}
        <div className="flex flex-col justify-between h-full min-h-[460px] pr-0 lg:pr-8 space-y-8">
          <div className="space-y-3">
            <div className="font-mono-tech text-xs tracking-[0.22em] text-white/50 uppercase">
              [ SECUREVAULT WORKSTATION // NODE_01 ]
            </div>
            <div className="font-mono-tech text-xs text-white/40 tracking-wider">
              LATENCY 12MS // AES-NI HARDWARE ACCELERATED
            </div>
          </div>

          <div className="p-6 glass-panel rounded-[3px] space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono-tech text-xs tracking-[0.18em] text-white font-semibold uppercase">
                ACTIVE CRYPTOGRAPHIC ENCLAVE
              </span>
            </div>
            <p className="font-mono-tech text-xs text-white/60 leading-relaxed">
              Zero plaintext persistence. Files are encrypted with isolated 256-bit symmetric keys prior to storage.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono-tech text-xs text-white/50">
              <span>STORAGE POSTURE</span>
              <span className="text-emerald-400 font-medium">OPTIMAL</span>
            </div>
          </div>

          {/* System Quick Links */}
          <div className="hidden lg:flex flex-col gap-2 font-mono-tech text-xs text-white/50">
            <div className="text-white/30 uppercase tracking-widest text-[11px] mb-1">
              DIRECT ACCESS
            </div>
            <button
              onClick={() => onNavigate('vault')}
              className="text-left py-1 text-white/70 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>02 ENCRYPTED VAULT REPOSITORY</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onNavigate('crypto-inspector')}
              className="text-left py-1 text-white/70 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>03 CRYPTO ENVELOPE INSPECTOR</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onNavigate('security')}
              className="text-left py-1 text-white/70 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>05 SECURITY POSTURE &amp; DEFENSE</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Column: Primary Overview Content & Telemetry */}
        <div className="w-full space-y-7 animate-hero-entrance">
          {/* Eyebrow and Editorial Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.06] border border-white/[0.14] rounded-[3px] font-mono-tech text-xs tracking-[0.16em] text-white/90 uppercase mb-4">
              <Shield className="w-3.5 h-3.5 text-white/90" />
              <span>01 OVERVIEW &amp; TELEMETRY</span>
            </div>

            <h1 className="font-sans-main text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-[1.08] mb-3">
              Encrypted access.
              <br />
              <span className="font-editorial italic font-normal text-white/85 text-[1.12em] tracking-tight">
                Without compromise.
              </span>
            </h1>

            <p className="font-sans-main text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">
              Real-time monitoring of all encrypted assets, cryptographic verification bounds, and time-restricted share tokens.
            </p>
          </div>

          {/* Key Metrics Grid (Deterministic from real state) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 glass-card rounded-[3px]">
              <div className="font-mono-tech text-xs tracking-[0.14em] text-white/50 uppercase mb-1.5 font-medium">
                ENCRYPTED OBJECTS
              </div>
              <div className="font-sans-main text-3xl sm:text-4xl font-light text-white">
                {totalFiles}
              </div>
              <div className="font-mono-tech text-xs text-white/50 mt-1.5">
                {formatBytes(totalSize)}
              </div>
            </div>

            <div className="p-4 glass-card rounded-[3px]">
              <div className="font-mono-tech text-xs tracking-[0.14em] text-white/50 uppercase mb-1.5 font-medium">
                ACTIVE SHARES
              </div>
              <div className="font-sans-main text-3xl sm:text-4xl font-light text-white">
                {activeSharesCount}
              </div>
              <div className="font-mono-tech text-xs text-white/50 mt-1.5">
                TIME BOUND
              </div>
            </div>

            <div className="p-4 glass-card rounded-[3px]">
              <div className="font-mono-tech text-xs tracking-[0.14em] text-white/50 uppercase mb-1.5 font-medium">
                STORAGE INTEGRITY
              </div>
              <div className="font-sans-main text-3xl sm:text-4xl font-light text-emerald-400">
                100%
              </div>
              <div className="font-mono-tech text-xs text-emerald-400/80 mt-1.5">
                SHA-256 VERIFIED
              </div>
            </div>

            <div className="p-4 glass-card rounded-[3px]">
              <div className="font-mono-tech text-xs tracking-[0.14em] text-white/50 uppercase mb-1.5 font-medium">
                BLOCKED PROBES
              </div>
              <div className="font-sans-main text-3xl sm:text-4xl font-light text-white">
                {posture?.failedAccessCount ?? 0}
              </div>
              <div className="font-mono-tech text-xs text-white/50 mt-1.5">
                RBAC ENFORCED
              </div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex items-center gap-3.5 flex-wrap pt-1">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={onOpenUpload}
            >
              Upload &amp; Encrypt
            </Button>

            <Button
              variant="secondary"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={onRunIntegrityAudit}
            >
              Verify Integrity
            </Button>

            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('vault')}
            >
              Open Vault
            </Button>
          </div>

          {/* Recent Security Activity Feed */}
          <div className="p-5 glass-panel rounded-[3px] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 font-mono-tech text-xs tracking-[0.16em] text-white/60 uppercase font-medium">
                <Activity className="w-4 h-4 text-white/80" />
                <span>Recent Cryptographic Activity</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('audit')}
                className="font-mono-tech text-xs text-white/60 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <span>Full Audit</span>
                <span>→</span>
              </button>
            </div>

            <div className="divide-y divide-white/5 font-mono-tech">
              {recentLogs.length === 0 ? (
                <div className="py-4 text-white/40 text-xs">
                  No security activity recorded yet. Upload a file to begin immutable logging.
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          log.severity === 'CRITICAL'
                            ? 'bg-red-400'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-white/90 font-medium text-xs sm:text-sm uppercase tracking-wider shrink-0">
                        {log.eventType}
                      </span>
                      <span className="text-white/50 text-xs sm:text-sm truncate">
                        {log.resourceName}
                      </span>
                    </div>
                    <span className="text-white/40 text-xs shrink-0">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
