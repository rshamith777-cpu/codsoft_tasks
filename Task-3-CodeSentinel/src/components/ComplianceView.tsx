import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  BookOpen, 
  ExternalLink,
  Info
} from 'lucide-react';
import { ScanResult, SecurityRule } from '../types.ts';

interface ComplianceViewProps {
  currentScan: ScanResult | null;
  onNavigateToFindings: () => void;
  onNavigateToScanner: () => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({
  currentScan,
  onNavigateToFindings,
  onNavigateToScanner
}) => {
  const [rules, setRules] = useState<SecurityRule[]>([]);
  const [activeFramework, setActiveFramework] = useState<'OWASP' | 'CWE'>('OWASP');

  useEffect(() => {
    fetch('/api/rules')
      .then(r => r.json())
      .then(data => {
        if (data.rules && Array.isArray(data.rules)) {
          setRules(data.rules);
        }
      })
      .catch(err => console.error('Failed to load rules catalog:', err));
  }, []);

  // OWASP Top 10 (2021) standard definition
  const OWASP_CATEGORIES = [
    { id: 'A01:2021-Broken Access Control', title: 'Broken Access Control', desc: 'Flaws permitting unauthorized resource disclosure or path traversal.' },
    { id: 'A02:2021-Cryptographic Failures', title: 'Cryptographic Failures', desc: 'Use of weak crypto, broken hashing, or plaintext sensitive data.' },
    { id: 'A03:2021-Injection', title: 'Injection', desc: 'SQL, Command, and Code Injection via unparameterized execution.' },
    { id: 'A04:2021-Insecure Design', title: 'Insecure Design', desc: 'Architectural security flaws and missing threat modeling mitigations.' },
    { id: 'A05:2021-Security Misconfiguration', title: 'Security Misconfiguration', desc: 'Debug mode enabled, root container execution, or default settings.' },
    { id: 'A06:2021-Vulnerable and Outdated Components', title: 'Vulnerable Components', desc: 'Deprecated third-party libraries and runtime dependencies.' },
    { id: 'A07:2021-Identification and Authentication Failures', title: 'Auth & Credential Failures', desc: 'Hardcoded secrets, weak passwords, and token predictability.' },
    { id: 'A08:2021-Software and Data Integrity Failures', title: 'Data Integrity & Deserialization', desc: 'Unsafe object deserialization (pickle, unserialize) and untrusted pipelines.' },
    { id: 'A09:2021-Security Logging and Monitoring Failures', title: 'Logging & Monitoring Failures', desc: 'Insufficient security telemetry and breach detection capabilities.' },
    { id: 'A10:2021-Server-Side Request Forgery', title: 'Server-Side Request Forgery (SSRF)', desc: 'Unvalidated remote resource fetching targeting internal networks.' }
  ];

  // CWE Core taxonomy
  const CWE_CATEGORIES = [
    { id: 'CWE-89', title: 'SQL Injection', owasp: 'A03:2021-Injection' },
    { id: 'CWE-78', title: 'OS Command Injection', owasp: 'A03:2021-Injection' },
    { id: 'CWE-22', title: 'Path Traversal', owasp: 'A01:2021-Broken Access Control' },
    { id: 'CWE-79', title: 'Cross-Site Scripting (XSS)', owasp: 'A03:2021-Injection' },
    { id: 'CWE-94', title: 'Code Injection (eval)', owasp: 'A03:2021-Injection' },
    { id: 'CWE-327', title: 'Broken Cryptographic Algorithm', owasp: 'A02:2021-Cryptographic Failures' },
    { id: 'CWE-502', title: 'Deserialization of Untrusted Data', owasp: 'A08:2021-Software and Data Integrity Failures' },
    { id: 'CWE-798', title: 'Hard-coded Credentials', owasp: 'A07:2021-Identification and Authentication Failures' },
    { id: 'CWE-916', title: 'Weak Key Derivation Iterations', owasp: 'A02:2021-Cryptographic Failures' },
    { id: 'CWE-330', title: 'Insecure Randomness', owasp: 'A02:2021-Cryptographic Failures' },
    { id: 'CWE-489', title: 'Active Debug Code', owasp: 'A05:2021-Security Misconfiguration' },
    { id: 'CWE-918', title: 'Server-Side Request Forgery (SSRF)', owasp: 'A10:2021-Server-Side Request Forgery' },
    { id: 'CWE-250', title: 'Execution with Unnecessary Privileges', owasp: 'A05:2021-Security Misconfiguration' },
    { id: 'CWE-611', title: 'Improper XML Entity Reference (XXE)', owasp: 'A05:2021-Security Misconfiguration' },
    { id: 'CWE-312', title: 'Cleartext Storage of Sensitive Data', owasp: 'A02:2021-Cryptographic Failures' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">04 / GOVERNANCE & MAPPING</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            COMPLIANCE <span className="font-serif-italic font-normal">TAXONOMY</span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Rule evaluation mapping against OWASP Top 10 (2021) and MITRE Common Weakness Enumeration (CWE).
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveFramework('OWASP')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeFramework === 'OWASP' ? 'bg-white/15 text-white font-semibold' : 'text-[#9a9a9a] hover:text-white'
            }`}
          >
            OWASP TOP 10
          </button>
          <button
            onClick={() => setActiveFramework('CWE')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeFramework === 'CWE' ? 'bg-white/15 text-white font-semibold' : 'text-[#9a9a9a] hover:text-white'
            }`}
          >
            MITRE CWE
          </button>
        </div>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300 flex items-start gap-3">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider">MAPPED TECHNICAL COVERAGE NOTE</span>
          <p className="text-white/70 leading-relaxed">
            Assessments represent technical SAST rule coverage against standard industry categories, not a formal regulatory certification or audit sign-off. Coverage reflects the presence of deterministic detection signatures.
          </p>
        </div>
      </div>

      {/* Framework Cards */}
      {activeFramework === 'OWASP' ? (
        <div className="space-y-4">
          <div className="text-xs font-mono text-[#9a9a9a] uppercase tracking-wider">
            OWASP TOP 10 (2021) CATEGORIES & EVALUATED FINDINGS
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OWASP_CATEGORIES.map(cat => {
              const matchedRules = rules.filter(r => r.owasp.toLowerCase().includes(cat.id.slice(0, 3).toLowerCase()));
              const currentFindings = currentScan 
                ? currentScan.findings.filter(f => f.owaspCategory?.toLowerCase().includes(cat.id.slice(0, 3).toLowerCase()))
                : [];

              const hasViolations = currentFindings.length > 0;
              const hasRules = matchedRules.length > 0;

              return (
                <div 
                  key={cat.id} 
                  className={`panel-surface p-5 border transition-all ${
                    hasViolations 
                      ? 'border-rose-500/30 bg-rose-950/10' 
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#85D743] font-semibold">{cat.id.split('-')[0]}</span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{cat.title}</h3>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      hasViolations 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : hasRules
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 text-white/40'
                    }`}>
                      {hasViolations ? `${currentFindings.length} VIOLATIONS` : hasRules ? 'EVALUATED (CLEAN)' : 'NO RULES ACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-[#9a9a9a] leading-relaxed mb-4">
                    {cat.desc}
                  </p>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/60">
                    <span>{matchedRules.length} Active Engine Signatures</span>
                    {hasViolations && (
                      <button
                        onClick={onNavigateToFindings}
                        className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Inspect {currentFindings.length} Finding{currentFindings.length > 1 ? 's' : ''} →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-mono text-[#9a9a9a] uppercase tracking-wider">
            MITRE COMMON WEAKNESS ENUMERATION (CWE) TAXONOMY
          </div>

          <div className="panel-surface border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {CWE_CATEGORIES.map(cwe => {
                const matchedRules = rules.filter(r => r.cwe.toLowerCase() === cwe.id.toLowerCase());
                const currentFindings = currentScan
                  ? currentScan.findings.filter(f => f.cwe.toLowerCase() === cwe.id.toLowerCase())
                  : [];

                const hasViolations = currentFindings.length > 0;

                return (
                  <div key={cwe.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[11px]">
                          {cwe.id}
                        </span>
                        <span className="text-white font-semibold">{cwe.title}</span>
                      </div>
                      <div className="text-[#9a9a9a] text-[11px]">
                        Mapped to: <span className="text-white/60">{cwe.owasp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[#9a9a9a] text-[11px]">
                        {matchedRules.length} Engine Rule{matchedRules.length > 1 ? 's' : ''}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasViolations 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {hasViolations ? `${currentFindings.length} DETECTED` : 'CLEAN'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
