import React, { useState } from 'react';
import {
  Shield,
  Lock,
  FileKey,
  CheckCircle2,
  Terminal,
  Database,
  ArrowRight,
  KeyRound,
  FileCheck,
  AlertTriangle,
  Server,
  Layers,
  Binary,
  Cpu,
} from 'lucide-react';
import { ThreatModelItem } from '../types';
import { CryptoBadge } from './ui/Badges';

export const SecurityArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'architecture' | 'threat-model'>('workflow');

  const realWorkflowSteps = [
    { step: '01', title: 'UPLOAD', desc: 'Client selects file; validation enforces 50MB ceiling and sanitizes filenames.' },
    { step: '02', title: 'HASH', desc: 'Pre-encryption SHA-256 digest computed via WebCrypto API.' },
    { step: '03', title: 'ENCRYPT', desc: 'Server encrypts payload using AES-256-GCM with unique 96-bit IV and 128-bit tag.' },
    { step: '04', title: 'STORE', desc: 'Ciphertext persisted to disk (.enc); plaintext is immediately flushed from memory.' },
    { step: '05', title: 'AUTHORIZE', desc: 'Zero-trust RBAC gate verifies session token, owner/editor/viewer role, and expiry.' },
    { step: '06', title: 'SHARE / RETRIEVE', desc: 'Time-bound, count-capped 192-bit cryptographic link generated for recipients.' },
    { step: '07', title: 'DECRYPT', desc: 'Authenticated AES-256-GCM decryption verifies GCM tag before releasing bytes.' },
    { step: '08', title: 'VERIFY', desc: 'Server recalculates SHA-256 checksum and compares with registered hash; logs audit.' },
  ];

  const threatModelData: ThreatModelItem[] = [
    {
      id: 'TM-01',
      category: 'Access Control',
      threat: 'Unauthorized File Access via Insecure Direct Object Reference (IDOR)',
      impact: 'Confidentiality breach where unauthorized users probe raw file IDs.',
      mitigation: 'Every file query verifies OWNER / EDITOR / VIEWER permissions server-side before cipher retrieval.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-02',
      category: 'Data Storage',
      threat: 'Physical Storage or Database Compromise (Data-at-Rest Leakage)',
      impact: 'Attackers accessing disk gain plaintext document contents.',
      mitigation: 'Plaintext is never stored on disk. All files are encrypted with AES-256-GCM with unique 96-bit IVs and 128-bit authentication tags.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-03',
      category: 'Data Integrity',
      threat: 'Ciphertext Tampering or Bit-Flipping in Transit / Rest',
      impact: 'Silent corruption of sensitive documents without detection.',
      mitigation: 'AES-GCM AuthTag validation + recalculation of SHA-256 digest upon authorized decryption. Download aborted if checksum mismatches.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-04',
      category: 'Authentication',
      threat: 'Credential Stuffing and Brute-Force Password Attacks',
      impact: 'Account takeover via weak or leaked passwords.',
      mitigation: 'Scrypt key derivation with unique 128-bit cryptographic salts per user. Enforced 8+ character password policy.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-05',
      category: 'Access Control',
      threat: 'Expired Share Token Re-Use or Unauthorized Link Traversal',
      impact: 'Indefinite external access to shared documents.',
      mitigation: 'Cryptographically random 192-bit share tokens with expiration timestamps, revocation controls, and access count caps.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-06',
      category: 'Ingestion Security',
      threat: 'Path Traversal and Malicious File Overwrite during Upload',
      impact: 'Arbitrary server file overwrite or remote code execution.',
      mitigation: 'Uploaded filenames are sanitized, extension-checked, and stored under generated internal random identifiers (.enc). Files are never executed.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-07',
      category: 'Auditing',
      threat: 'Repudiation of File Deletion or Unauthorized Sharing',
      impact: 'Lack of forensics to trace insider data exfiltration.',
      mitigation: 'Centralized append-only audit activity pipeline logging all UPLOAD, ENCRYPT, SHARE, REVOKE, DELETE, and FAILED_ACCESS events with actor IDs and timestamps.',
      status: 'IMPLEMENTED',
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-start">
      <div className="w-full max-w-[1720px] mx-auto space-y-6 animate-hero-entrance">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
              <Layers className="w-3.5 h-3.5 text-white/70" />
              <span>07 ARCHITECTURE &amp; THREAT MODEL</span>
            </div>
            <h1 className="font-sans-main text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Cryptographic Pipeline &amp; Mitigations
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-2 px-3 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] ${
              activeTab === 'workflow'
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Real File Workflow
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2 px-3 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] ${
              activeTab === 'architecture'
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            System Layers
          </button>
          <button
            onClick={() => setActiveTab('threat-model')}
            className={`py-2 px-3 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] ${
              activeTab === 'threat-model'
                ? 'bg-white text-black font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Threat Mitigations ({threatModelData.length})
          </button>
        </div>

        {/* Tab 1: Real File Workflow Visualization */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div className="font-mono-tech text-xs text-white/50">
              [ END-TO-END CRYPTOGRAPHIC DATA PATH ]
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {realWorkflowSteps.map((s, idx) => (
                <div
                  key={s.step}
                  className="p-5 bg-black/40 backdrop-blur-md border border-white/12 rounded-[3px] space-y-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-xs text-white/50 font-bold">
                      PHASE {s.step}
                    </span>
                    <CryptoBadge label={s.title} />
                  </div>
                  <div className="font-sans-main text-base text-white font-medium">
                    {s.title}
                  </div>
                  <p className="font-mono-tech text-xs text-white/60 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: System Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <div className="p-6 bg-black/40 backdrop-blur-md border border-white/12 rounded-[3px] space-y-6">
              <div className="font-mono-tech text-xs text-white/60 uppercase tracking-wider font-medium">
                LAYERED ENCLAVE ARCHITECTURE
              </div>

              <div className="space-y-3 font-mono-tech text-xs sm:text-sm">
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] flex items-center justify-between">
                  <span className="font-semibold text-white">01 CLIENT / BROWSER LAYER</span>
                  <span className="text-white/60 text-xs">WebCrypto API, Pre-hash SHA-256 Calculation, Zero Key Storage</span>
                </div>
                <div className="text-center text-white/30 font-bold">↓ (HTTPS TLS 1.3 / REST)</div>

                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] flex items-center justify-between">
                  <span className="font-semibold text-white">02 AUTHORIZATION GATE (RBAC)</span>
                  <span className="text-white/60 text-xs">Session Tokens, Scrypt Password Verification, Access Bounds</span>
                </div>
                <div className="text-center text-white/30 font-bold">↓ (Authorized Requests Only)</div>

                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] flex items-center justify-between">
                  <span className="font-semibold text-white">03 CRYPTOGRAPHIC SERVICE ENCLAVE</span>
                  <span className="text-white/60 text-xs">AES-256-GCM Hardware Encryptor, 128-bit Auth Tag Validation</span>
                </div>
                <div className="text-center text-white/30 font-bold">↓ (Encrypted Ciphertext Stream)</div>

                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] flex items-center justify-between">
                  <span className="font-semibold text-white">04 IMMUTABLE AUDIT &amp; STORAGE LAYER</span>
                  <span className="text-white/60 text-xs">Encrypted Blobs (.enc), Append-Only Audit Stream, Zero Plaintext Persistence</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Threat Model */}
        {activeTab === 'threat-model' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {threatModelData.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-black/40 backdrop-blur-md border border-white/12 rounded-[3px] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-xs text-white/50 uppercase tracking-wider font-medium">
                      {item.id} // {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono-tech text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 rounded-[2px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.status}
                    </span>
                  </div>
                  <div className="font-sans-main text-base text-white font-medium">
                    {item.threat}
                  </div>
                </div>

                <div className="space-y-2 font-mono-tech text-xs sm:text-sm">
                  <div className="text-white/60 leading-relaxed">
                    <span className="text-red-400/90 font-medium">Impact:</span> {item.impact}
                  </div>
                  <div className="text-white/90 leading-relaxed">
                    <span className="text-emerald-400/90 font-medium">Mitigation:</span> {item.mitigation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
