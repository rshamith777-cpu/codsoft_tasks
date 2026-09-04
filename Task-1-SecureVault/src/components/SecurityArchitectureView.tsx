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
} from 'lucide-react';
import { ThreatModelItem } from '../types';

export const SecurityArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'threat-model' | 'srs' | 'crypto'>('architecture');

  const threatModelData: ThreatModelItem[] = [
    {
      id: 'TM-01',
      category: 'Access Control',
      threat: 'Unauthorized File Access via Insecure Direct Object Reference (IDOR)',
      impact: 'Confidentiality breach where unauthorized users access raw file IDs',
      mitigation: 'Every file query verifies OWNER / EDITOR / VIEWER permissions server-side before cipher retrieval.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-02',
      category: 'Data Storage',
      threat: 'Physical Storage or Database Compromise (Data-at-Rest Leakage)',
      impact: 'Attackers accessing disk gain plaintext document contents',
      mitigation: 'Plaintext is never stored on disk. All files are encrypted with AES-256-GCM with unique 96-bit IVs and 128-bit authentication tags.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-03',
      category: 'Data Integrity',
      threat: 'Ciphertext Tampering or Bit-Flipping in Transit / Rest',
      impact: 'Silent corruption of sensitive documents without detection',
      mitigation: 'AES-GCM AuthTag validation + recalculation of SHA-256 digest upon authorized decryption. Download aborted if checksum mismatches.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-04',
      category: 'Authentication',
      threat: 'Credential Stuffing and Brute-Force Password Attacks',
      impact: 'Account takeover via weak or leaked passwords',
      mitigation: 'Scrypt key derivation with unique 128-bit cryptographic salts per user. Enforced 8+ character password policy.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-05',
      category: 'Access Control',
      threat: 'Expired Share Token Re-Use or Unauthorized Link Traversal',
      impact: 'Indefinite external access to shared documents',
      mitigation: 'Cryptographically random 192-bit share tokens with expiration timestamps, revocation controls, and access count caps.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-06',
      category: 'Ingestion Security',
      threat: 'Path Traversal and Malicious File Overwrite during Upload',
      impact: 'Arbitrary server file overwrite or remote code execution',
      mitigation: 'Uploaded filenames are sanitized, extension-checked, and stored under generated internal random identifiers (.enc). Files are never executed.',
      status: 'IMPLEMENTED',
    },
    {
      id: 'TM-07',
      category: 'Auditing',
      threat: 'Repudiation of File Deletion or Unauthorized Sharing',
      impact: 'Lack of forensics to trace insider data exfiltration',
      mitigation: 'Centralized append-only audit activity pipeline logging all UPLOAD, ENCRYPT, SHARE, REVOKE, DELETE, and FAILED_ACCESS events with actor IDs and timestamps.',
      status: 'IMPLEMENTED',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-white/50 font-mono-tech text-[10px] tracking-widest uppercase">
            <Layers className="w-3.5 h-3.5 text-white/60" />
            SECURITY ARCHITECTURE & THREAT SPECIFICATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-1">
            System Security Architecture
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1 border border-white/15 p-1 bg-[#08080a]/75 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 font-mono-tech text-xs tracking-wider uppercase transition-colors ${
              activeTab === 'architecture' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            DATA FLOW & MODEL
          </button>
          <button
            onClick={() => setActiveTab('threat-model')}
            className={`px-3 py-1.5 font-mono-tech text-xs tracking-wider uppercase transition-colors ${
              activeTab === 'threat-model' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            THREAT MODEL ({threatModelData.length})
          </button>
          <button
            onClick={() => setActiveTab('srs')}
            className={`px-3 py-1.5 font-mono-tech text-xs tracking-wider uppercase transition-colors ${
              activeTab === 'srs' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            SRS SPEC
          </button>
        </div>
      </div>

      {/* Tab: Architecture & Data Flow */}
      {activeTab === 'architecture' && (
        <div className="space-y-8">
          {/* Visual Execution Flow Pipeline */}
          <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-mono-tech font-semibold tracking-wider text-white uppercase">
                End-to-End Cryptographic Execution Pipeline
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Zero-knowledge data lifecycle from client ingestion to verified retrieval.
              </p>
            </div>

            {/* Stepped Flow Chart */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono-tech text-xs">
              <div className="p-4 border border-white/15 bg-white/5 space-y-2">
                <div className="text-[10px] text-white/40 uppercase">STAGE 01</div>
                <div className="text-white font-bold">USER AUTHENTICATION</div>
                <p className="text-[11px] text-white/60">Scrypt password verification with 128-bit cryptographic salt and bearer session token.</p>
              </div>

              <div className="p-4 border border-white/15 bg-white/5 space-y-2">
                <div className="text-[10px] text-white/40 uppercase">STAGE 02</div>
                <div className="text-white font-bold">SHA-256 INGESTION HASH</div>
                <p className="text-[11px] text-white/60">Plaintext payload hashed to calculate cryptographic integrity fingerprint before cipher execution.</p>
              </div>

              <div className="p-4 border border-white/15 bg-white/5 space-y-2">
                <div className="text-[10px] text-white/40 uppercase">STAGE 03</div>
                <div className="text-white font-bold">AES-256-GCM ENCRYPTION</div>
                <p className="text-[11px] text-white/60">Authenticated cipher with 96-bit random IV and 128-bit GMAC authentication tag stored on disk.</p>
              </div>

              <div className="p-4 border border-white/15 bg-white/5 space-y-2">
                <div className="text-[10px] text-white/40 uppercase">STAGE 04</div>
                <div className="text-white font-bold">RBAC ACCESS GATE</div>
                <p className="text-[11px] text-white/60">Server-side authorization check (OWNER / EDITOR / VIEWER / Expiring Token). Intrusions logged.</p>
              </div>

              <div className="p-4 border border-white/15 bg-white/5 space-y-2">
                <div className="text-[10px] text-white/40 uppercase">STAGE 05</div>
                <div className="text-white font-bold">DECRYPT & VERIFY</div>
                <p className="text-[11px] text-white/60">Authorized decrypt, recalculation of SHA-256, match verification, and immutable audit logging.</p>
              </div>
            </div>
          </div>

          {/* Key Security Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-white/15 bg-[#08080a]/75 backdrop-blur-md space-y-3 font-mono-tech">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>CONFIDENTIALITY</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Files are strictly stored as AES-256-GCM ciphertext blobs on disk. Server administrators or compromised disk volumes cannot read document contents without authorized decryption keys.
              </p>
            </div>

            <div className="p-6 border border-white/15 bg-[#08080a]/75 backdrop-blur-md space-y-3 font-mono-tech">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <FileCheck className="w-4 h-4 text-blue-400" />
                <span>DATA INTEGRITY</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                SHA-256 cryptographic fingerprints are calculated before encryption and recalculated upon decryption. Any bit corruption or tampering triggers immediate abort and security alerts.
              </p>
            </div>

            <div className="p-6 border border-white/15 bg-[#08080a]/75 backdrop-blur-md space-y-3 font-mono-tech">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>AUDITABILITY & RBAC</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Every action (Upload, Encrypt, Download, Share, Revoke, Delete, Failed Access) produces an immutable audit record containing timestamps, actor identities, IP telemetry, and outcome statuses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Threat Model */}
      {activeTab === 'threat-model' && (
        <div className="space-y-6">
          <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono-tech text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] text-white/40 tracking-widest uppercase">
                  <th className="py-3 px-4">THREAT ID</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">THREAT & IMPACT</th>
                  <th className="py-3 px-4">ENGINEERED MITIGATION</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {threatModelData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 text-white/50">{item.id}</td>
                    <td className="py-3.5 px-4 text-white/70">{item.category}</td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="text-white font-medium">{item.threat}</div>
                      <div className="text-[11px] text-white/40">{item.impact}</div>
                    </td>
                    <td className="py-3.5 px-4 text-white/80 leading-relaxed">
                      {item.mitigation}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: SRS */}
      {activeTab === 'srs' && (
        <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md p-6 sm:p-8 space-y-6 font-mono-tech text-xs">
          <div>
            <h2 className="text-base font-semibold tracking-wider text-white uppercase">
              Software Requirements Specification (SRS) // CodSoft Task
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Functional and non-functional requirements implemented for the Secure File Sharing System.
            </p>
          </div>

          <div className="space-y-4 text-white/80 leading-relaxed divide-y divide-white/10">
            <div className="pt-3">
              <span className="text-white font-bold text-sm block mb-1">REQ-01: Authenticated File Encryption</span>
              All ingested files must be encrypted with AES-256-GCM with individual Initialization Vectors (IV) before binary persistence.
            </div>
            <div className="pt-3">
              <span className="text-white font-bold text-sm block mb-1">REQ-02: Cryptographic Integrity Verification</span>
              SHA-256 hashes must be calculated at upload and re-evaluated during download. Downloads must fail closed if checksum does not match.
            </div>
            <div className="pt-3">
              <span className="text-white font-bold text-sm block mb-1">REQ-03: Multi-Tiered Role-Based Access Control</span>
              Enforce OWNER, EDITOR, and VIEWER roles. Restrict sharing, deletion, and permission granting to authorized roles.
            </div>
            <div className="pt-3">
              <span className="text-white font-bold text-sm block mb-1">REQ-04: Secure Ephemeral Sharing</span>
              Provide cryptographically random share links with configurable expiration timestamps and revocation capabilities.
            </div>
            <div className="pt-3">
              <span className="text-white font-bold text-sm block mb-1">REQ-05: Comprehensive Security Auditing</span>
              Every authentication, authorization, cryptographic operation, and failed access attempt must be recorded in an immutable audit log.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
