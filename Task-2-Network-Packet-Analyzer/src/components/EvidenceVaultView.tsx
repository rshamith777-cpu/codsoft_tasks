import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Download, 
  Lock, 
  History, 
  Search,
  ExternalLink,
  Fingerprint
} from 'lucide-react';
import { motion } from 'motion/react';
import { EvidenceItem, CustodyRecord } from '../types';
import { PageHeader } from './common/PageHeader';

interface EvidenceVaultViewProps {
  evidenceItems: EvidenceItem[];
  onRefreshEvidence: () => void;
  userRole?: string;
}

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({
  evidenceItems = [],
  onRefreshEvidence,
  userRole = 'ANALYST'
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [custodyLogs, setCustodyLogs] = useState<CustodyRecord[]>([]);
  const [verificationResult, setVerificationResult] = useState<{
    totalChecked: number;
    verified: number;
    tampered: number;
  } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Handle Verify All Evidence
  const handleVerifyAll = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/evidence/verify-all', { method: 'POST' });
      const data = await res.json();
      setVerificationResult({
        totalChecked: data.totalChecked || 0,
        verified: data.verified || 0,
        tampered: data.tampered || 0
      });
      onRefreshEvidence();
    } catch (e) {
      console.error('Evidence verification error:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  // Load custody logs when an item is selected
  useEffect(() => {
    if (selectedItem) {
      fetch(`/api/evidence/${selectedItem.id}/custody`)
        .then(r => r.json())
        .then(d => {
          if (d.custodyLog) setCustodyLogs(d.custodyLog);
        })
        .catch(() => {});
    }
  }, [selectedItem]);

  const filteredItems = evidenceItems.filter(item => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.contentHash.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="p-6 space-y-6 max-w-7xl mx-auto font-ui text-[#f4f4f2]"
    >
      <PageHeader
        number="06"
        title="CRYPTOGRAPHIC EVIDENCE VAULT"
        subtitle="SHA-256 immutable chain of custody, tamper-evident forensic preservation, and continuous integrity verification"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifyAll}
              disabled={isVerifying || evidenceItems.length === 0}
              className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'VERIFYING ALL...' : 'VERIFY ALL DIGESTS'}</span>
            </button>
          </div>
        }
      />

      {/* Verification Status Banner */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${
          verificationResult.tampered > 0 
            ? 'bg-red-500/15 border-red-500/30 text-red-300' 
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {verificationResult.tampered > 0 ? (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              INTEGRITY AUDIT COMPLETE: {verificationResult.verified} / {verificationResult.totalChecked} ARTIFACTS VERIFIED
              {verificationResult.tampered > 0 && ` • ${verificationResult.tampered} TAMPERED DETECTED`}
            </span>
          </div>
          <span className="text-[10px] text-white/50">SHA-256 DIGEST ENGINE</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by Evidence ID, SHA-256 Hash, or Source..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-white/60">
          <span>PRESERVED ITEMS: <strong className="text-white">{evidenceItems.length}</strong></span>
          <span>•</span>
          <span>RETENTION: <strong className="text-emerald-400">IMMUTABLE</strong></span>
        </div>
      </div>

      {/* Vault Grid */}
      {filteredItems.length === 0 ? (
        <div className="sovereign-panel p-12 text-center space-y-3">
          <Lock className="w-8 h-8 text-white/30 mx-auto" />
          <h3 className="text-sm font-semibold text-white font-mono uppercase">NO EVIDENCE ITEMS PRESERVED</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto font-mono">
            Preserve forensic packets, alerts, or session dumps from Forensics (03) or Incidents (05) to generate tamper-evident SHA-256 digests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Evidence Table */}
          <div className="lg:col-span-2 sovereign-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs font-mono">
              <span className="text-white/60 uppercase tracking-wider text-[10px]">PRESERVED ARTIFACTS</span>
              <span className="text-white/40 text-[10px]">{filteredItems.length} MATCHES</span>
            </div>

            <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto font-mono text-xs">
              {filteredItems.map(item => {
                const isSelected = selectedItem?.id === item.id;
                const isTampered = item.status === 'TAMPERED';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white/10 border border-white/20'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <div className="space-y-1 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{item.id}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-white/10 text-white/70 border border-white/10">
                          {item.type}
                        </span>
                        {isTampered ? (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-red-500/20 text-red-300 border border-red-500/30">
                            TAMPERED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            VERIFIED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/50 truncate flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 shrink-0 text-white/40" />
                        <span className="truncate">{item.contentHash}</span>
                      </div>
                      <div className="text-[10px] text-white/40">
                        Preserved: {item.createdAt || item.timestamp} • Source: {item.source}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition-all cursor-pointer font-mono shrink-0"
                    >
                      <History className="w-3 h-3" />
                      <span>Custody Log</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Chain of Custody Inspector */}
          <div className="sovereign-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs font-mono">
              <span className="text-white/60 uppercase tracking-wider text-[10px]">CHAIN OF CUSTODY</span>
              {selectedItem && (
                <span className="text-emerald-400 font-semibold text-[10px]">{selectedItem.id}</span>
              )}
            </div>

            {!selectedItem ? (
              <div className="p-8 text-center text-xs text-white/40 font-mono space-y-2">
                <History className="w-6 h-6 text-white/20 mx-auto" />
                <p>Select an evidence artifact to view its immutable chain of custody log.</p>
              </div>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                {/* Artifact Details */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                  <div className="text-[10px] text-white/40 uppercase">Cryptographic SHA-256 Digest</div>
                  <div className="text-[11px] text-cyan-400 break-all select-all font-bold">
                    {selectedItem.contentHash}
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/60">
                    <span>Artifact Type: {selectedItem.type}</span>
                    <span>Source: {selectedItem.source}</span>
                  </div>
                </div>

                {/* Custody Timeline */}
                <div className="space-y-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Custody Event History</span>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {custodyLogs.length === 0 ? (
                      <div className="p-3 rounded bg-white/[0.02] text-white/40 text-center text-[11px]">
                        Initial preservation recorded. No subsequent access events.
                      </div>
                    ) : (
                      custodyLogs.map(log => (
                        <div key={log.id} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-white tracking-wide px-1.5 py-0.5 rounded bg-white/10">
                              {log.action}
                            </span>
                            <span className="text-white/40">{log.timestamp}</span>
                          </div>
                          <div className="text-[11px] text-white/80">
                            Actor: <strong className="text-white">{log.actor}</strong> ({log.role})
                          </div>
                          {log.details && (
                            <div className="text-[10px] text-white/50">{log.details}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </motion.div>
  );
};
