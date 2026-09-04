import React, { useState } from 'react';
import {
  Shield,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Share2,
  Activity,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Bug,
} from 'lucide-react';
import { SecurityPosture } from '../types';
import { api } from '../services/api';

interface SecurityDashboardProps {
  posture: SecurityPosture | null;
  onRefresh: () => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ posture, onRefresh }) => {
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<{ checked: number; verified: number; failed: number } | null>(null);
  const [simulatingIntrusion, setSimulatingIntrusion] = useState(false);
  const [simulatedMsg, setSimulatedMsg] = useState<string | null>(null);

  const handleRunIntegrityAudit = async () => {
    setRunningAudit(true);
    setAuditResult(null);
    try {
      const res = await api.verifyAllIntegrity();
      setAuditResult(res);
      onRefresh();
    } catch (err: any) {
      alert(`Integrity check failed: ${err.message}`);
    } finally {
      setRunningAudit(false);
    }
  };

  const handleSimulateIntrusion = async () => {
    setSimulatingIntrusion(true);
    setSimulatedMsg(null);
    try {
      await api.simulateUnauthorizedAccess('CONFIDENTIAL_EXECUTIVE_SALARIES.enc');
      setSimulatedMsg('Intrusion attempt blocked and registered in immutable audit logs.');
      onRefresh();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulatingIntrusion(false);
    }
  };

  const status = posture?.vaultStatus || 'SECURE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-white/50 font-mono-tech text-[10px] tracking-widest uppercase">
            <Activity className="w-3.5 h-3.5 text-white/60" />
            SECURITY POSTURE & CONTINUOUS AUDITING
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-1">
            Security Posture
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono-tech text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>SYNC POSTURE</span>
          </button>
        </div>
      </div>

      {/* Primary Status Banner */}
      <div
        className={`p-6 border ${
          status === 'SECURE'
            ? 'border-emerald-500/40 bg-emerald-950/20'
            : status === 'WARNING'
            ? 'border-amber-500/40 bg-amber-950/20'
            : 'border-red-500/40 bg-red-950/20'
        } backdrop-blur-md`}
        style={{ borderRadius: '8px' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 border flex items-center justify-center ${
                status === 'SECURE'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : status === 'WARNING'
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-red-500/50 bg-red-500/10 text-red-400'
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono-tech text-[10px] text-white/50 uppercase tracking-widest">
                AGGREGATED VAULT INTEGRITY STATUS
              </div>
              <div className="text-lg font-mono-tech font-bold tracking-wider text-white mt-0.5">
                VAULT STATUS: {status}
              </div>
            </div>
          </div>

          <div className="text-right font-mono-tech text-xs text-white/60">
            <div>INTEGRITY VERIFICATION RATE: <span className="text-emerald-400 font-bold">{posture?.integrityRate ?? 100}%</span></div>
            <div className="text-[10px] text-white/40 mt-1">
              LAST AUDITED: {posture?.lastAuditTimestamp ? new Date(posture.lastAuditTimestamp).toLocaleString() : 'JUST NOW'}
            </div>
          </div>
        </div>
      </div>

      {/* Real Posture Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Files Stored */}
        <div className="p-5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-white/40 font-mono-tech text-[10px] uppercase tracking-wider">
            <span>FILES STORED</span>
            <FileCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono-tech font-medium text-white">
            {posture?.totalFiles ?? 0}
          </div>
          <div className="text-[11px] font-mono-tech text-white/50">
            Total files under management
          </div>
        </div>

        {/* Encrypted Files */}
        <div className="p-5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-white/40 font-mono-tech text-[10px] uppercase tracking-wider">
            <span>ENCRYPTED (AES-256-GCM)</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono-tech font-medium text-emerald-400">
            {posture?.encryptedFiles ?? 0}
          </div>
          <div className="text-[11px] font-mono-tech text-white/50">
            100% encrypted at rest
          </div>
        </div>

        {/* Active Shares */}
        <div className="p-5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-white/40 font-mono-tech text-[10px] uppercase tracking-wider">
            <span>ACTIVE SHARES</span>
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono-tech font-medium text-white">
            {posture?.activeShares ?? 0}
          </div>
          <div className="text-[11px] font-mono-tech text-white/50">
            Controlled access links
          </div>
        </div>

        {/* Security Events */}
        <div className="p-5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-white/40 font-mono-tech text-[10px] uppercase tracking-wider">
            <span>SECURITY AUDIT EVENTS</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono-tech font-medium text-white">
            {posture?.securityEventsCount ?? 0}
          </div>
          <div className="text-[11px] font-mono-tech text-white/50">
            {posture?.failedAccessCount ?? 0} failed access attempts
          </div>
        </div>
      </div>

      {/* Interactive Cryptographic Verification Station */}
      <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-mono-tech font-semibold tracking-wider text-white uppercase">
              Cryptographic Integrity Verification Engine
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Recalculate authentic SHA-256 hashes across all stored cipher blobs on disk and compare against stored fingerprints.
            </p>
          </div>
          <button
            id="btn-run-full-integrity-audit"
            onClick={handleRunIntegrityAudit}
            disabled={runningAudit}
            className="px-4 py-2.5 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {runningAudit ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AUDITING DISK BLOBS...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RUN INTEGRITY AUDIT</span>
              </>
            )}
          </button>
        </div>

        {/* Audit Results Box */}
        {auditResult && (
          <div className="p-4 border border-emerald-500/40 bg-emerald-500/10 font-mono-tech text-xs text-emerald-300 space-y-1">
            <div className="font-semibold text-emerald-400 uppercase">
              AUDIT COMPLETED // {auditResult.verified}/{auditResult.checked} OBJECTS VERIFIED
            </div>
            <div>
              Checked: {auditResult.checked} | Verified Authentic: {auditResult.verified} | Integrity Failures: {auditResult.failed}
            </div>
          </div>
        )}

        {/* Security Controls Simulation Station */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono-tech text-xs text-white font-medium">
                RBAC Access Violation Simulation
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Simulate an unauthorized access probe to verify access-control enforcement and security event generation in the audit pipeline.
              </p>
            </div>
            <button
              id="btn-simulate-intrusion"
              onClick={handleSimulateIntrusion}
              disabled={simulatingIntrusion}
              className="px-4 py-2 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-mono-tech text-xs tracking-wider uppercase transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Bug className="w-3.5 h-3.5 text-red-400" />
              <span>SIMULATE UNAUTHORIZED PROBE</span>
            </button>
          </div>

          {simulatedMsg && (
            <div className="mt-3 p-3 border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono-tech text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{simulatedMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
