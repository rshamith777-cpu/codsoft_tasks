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
  Terminal,
  Cpu,
  Zap,
} from 'lucide-react';
import { SecurityPosture, VaultFile, AuditEvent } from '../types';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { StatusIndicator, IntegrityBadge } from './ui/Badges';
import { SecurityAgentsView } from './SecurityAgentsView';
import { AutomationsView } from './AutomationsView';

interface SecurityDashboardProps {
  posture: SecurityPosture | null;
  files?: VaultFile[];
  auditLogs?: AuditEvent[];
  onRefresh: () => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  posture,
  files = [],
  auditLogs = [],
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'posture' | 'intelligence' | 'automations'>('posture');
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
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-start">
      <div className="w-full max-w-[1720px] mx-auto space-y-6 animate-hero-entrance">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
              <Activity className="w-3.5 h-3.5 text-white/70" />
              <span>05 SECURITY POSTURE, INTELLIGENCE &amp; AUTOMATION</span>
            </div>
            <h1 className="font-sans-main text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Active Cryptographic Defense
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3 h-3" />}
              onClick={onRefresh}
            >
              Sync State
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab('posture')}
            className={`py-2 px-3 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] flex items-center gap-2 ${
              activeTab === 'posture'
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Posture &amp; Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('intelligence')}
            className={`py-2 px-3 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] flex items-center gap-2 ${
              activeTab === 'intelligence'
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Security Intelligence (8 Agents)</span>
          </button>

          <button
            onClick={() => setActiveTab('automations')}
            className={`py-2 px-3 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] flex items-center gap-2 ${
              activeTab === 'automations'
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automations (AUTO-001 — 010)</span>
          </button>
        </div>

        {/* Tab 1: Posture & Active Defense Controls */}
        {activeTab === 'posture' && (
          <div className="space-y-6">
            {/* Primary Status Banner */}
            <div
              className={`p-6 border ${
                status === 'SECURE'
                  ? 'border-emerald-500/35 bg-emerald-950/20'
                  : status === 'WARNING'
                  ? 'border-amber-500/35 bg-amber-950/20'
                  : 'border-red-500/35 bg-red-950/20'
              } backdrop-blur-md rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 border flex items-center justify-center rounded-[2px] ${
                    status === 'SECURE'
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                      : status === 'WARNING'
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-red-500/50 bg-red-500/10 text-red-400'
                  }`}
                >
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-sans-main text-xl sm:text-2xl font-normal text-white">
                      Vault Status: {status}
                    </h3>
                    <StatusIndicator status={status === 'SECURE' ? 'ONLINE' : status === 'WARNING' ? 'WARNING' : 'CRITICAL'} />
                  </div>
                  <p className="font-sans-main text-sm text-white/70 mt-1 max-w-[640px] leading-relaxed">
                    {status === 'SECURE'
                      ? 'All cryptographic checks passing. Zero integrity failures. RBAC and token bounds actively enforced.'
                      : status === 'WARNING'
                      ? 'Elevated failed access attempts detected in audit trail. Scrutiny active.'
                      : 'Critical integrity anomaly detected. Immediate remediation recommended.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={handleRunIntegrityAudit}
                  isLoading={runningAudit}
                >
                  Run Integrity Check
                </Button>

                <Button
                  variant="danger"
                  size="md"
                  leftIcon={<Bug className="w-4 h-4" />}
                  onClick={handleSimulateIntrusion}
                  isLoading={simulatingIntrusion}
                >
                  Simulate Intrusion
                </Button>
              </div>
            </div>

            {/* Test Results / Notifications */}
            {auditResult && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/35 rounded-[3px] font-mono-tech text-xs sm:text-sm text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    STORAGE INTEGRITY REPORT: {auditResult.verified}/{auditResult.checked} files cryptographically verified with authentic SHA-256 hashes.
                  </span>
                </div>
                <button type="button" onClick={() => setAuditResult(null)} className="text-white/40 hover:text-white p-1">
                  ✕
                </button>
              </div>
            )}

            {simulatedMsg && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/35 rounded-[3px] font-mono-tech text-xs sm:text-sm text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>SIMULATED INTRUSION: {simulatedMsg}</span>
                </div>
                <button type="button" onClick={() => setSimulatedMsg(null)} className="text-white/40 hover:text-white p-1">
                  ✕
                </button>
              </div>
            )}

            {/* Verification Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 glass-card rounded-[3px] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-xs text-white/50 uppercase tracking-wider font-medium">
                    ENCRYPTION STANDARD
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-sans-main text-lg text-white font-medium">
                  AES-256-GCM Hardware Cipher
                </div>
                <div className="font-mono-tech text-xs sm:text-sm text-white/60 leading-relaxed">
                  Unique 96-bit IV generated per file. Decryption verifies 128-bit authentication tag before releasing payload.
                </div>
              </div>

              <div className="p-5 glass-card rounded-[3px] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-xs text-white/50 uppercase tracking-wider font-medium">
                    INTEGRITY VERIFICATION
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-sans-main text-lg text-white font-medium">
                  Continuous SHA-256 Digest Match
                </div>
                <div className="font-mono-tech text-xs sm:text-sm text-white/60 leading-relaxed">
                  Hashes recomputed upon every download and storage audit to guarantee bitwise integrity and prevent bit flipping.
                </div>
              </div>

              <div className="p-5 glass-card rounded-[3px] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-xs text-white/50 uppercase tracking-wider font-medium">
                    ACCESS POLICY ENFORCEMENT
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-sans-main text-lg text-white font-medium">
                  Zero-Trust RBAC &amp; Expiration
                </div>
                <div className="font-mono-tech text-xs sm:text-sm text-white/60 leading-relaxed">
                  Tokens expire automatically upon reaching expiration bounds or maximum allowed access counts.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security Intelligence (8 Agents) */}
        {activeTab === 'intelligence' && (
          <SecurityAgentsView
            files={files}
            posture={posture}
            auditLogs={auditLogs}
            onRefresh={onRefresh}
          />
        )}

        {/* Tab 3: Automations Orchestration (AUTO-001 - AUTO-010) */}
        {activeTab === 'automations' && <AutomationsView onRefresh={onRefresh} />}
      </div>
    </div>
  );
};
