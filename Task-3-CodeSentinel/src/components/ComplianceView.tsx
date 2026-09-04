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
  onNavigateToScanner: _onNavigateToScanner
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
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            09 // COMPLIANCE & FRAMEWORK MAPPING
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-4">
            COMPLIANCE <span className="font-serif-italic font-normal">MAPPING</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Rule evaluation mapping against OWASP Top 10 (2021) and MITRE Common Weakness Enumeration (CWE).
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm font-mono shadow-md">
          <button
            onClick={() => setActiveFramework('OWASP')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeFramework === 'OWASP' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            OWASP TOP 10
          </button>
          <button
            onClick={() => setActiveFramework('CWE')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeFramework === 'CWE' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            MITRE CWE
          </button>
        </div>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs sm:text-sm font-mono text-blue-300 flex items-start gap-4 shadow-lg">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
        <div className="space-y-1.5">
          <span className="font-press-start text-[9px] text-[#85D743] uppercase tracking-wider">MAPPED TECHNICAL COVERAGE NOTE</span>
          <p className="text-white/80 leading-relaxed text-xs sm:text-sm">
            Assessments represent technical SAST rule coverage against standard industry categories, not a formal regulatory certification or audit sign-off. Coverage reflects the presence of deterministic detection signatures.
          </p>
        </div>
      </div>

      {/* Framework Cards */}
      {activeFramework === 'OWASP' ? (
        <div className="space-y-6">
          <div className="font-press-start text-[9px] text-[#85D743] uppercase tracking-wider">
            OWASP TOP 10 (2021) CATEGORIES & EVALUATED FINDINGS
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OWASP_CATEGORIES.map(cat => {
              const matchedRules = rules.filter(r => r.owasp.toLowerCase().includes(cat.id.slice(0, 3).toLowerCase()));
              const currentFindings = currentScan 
                ? currentScan.findings.filter(f => (f.owasp || (f as any).owaspCategory || '').toLowerCase().includes(cat.id.slice(0, 3).toLowerCase()))
                : [];

              const hasViolations = currentFindings.length > 0;
              const hasRules = matchedRules.length > 0;

              return (
                <div 
                  key={cat.id} 
                  className={`panel-surface p-7 sm:p-8 rounded-2xl border transition-all shadow-xl ${
                    hasViolations 
                      ? 'border-rose-500/40 bg-rose-950/15' 
                      : 'border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-mono text-[#85D743] font-bold">{cat.id.split('-')[0]}</span>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-1">{cat.title}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[8px] font-press-start ${
                      hasViolations 
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' 
                        : hasRules
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {hasViolations ? `${currentFindings.length} VIOLATIONS` : hasRules ? 'EVALUATED (CLEAN)' : 'NO RULES ACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6">
                    {cat.desc}
                  </p>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
                    <span className="font-semibold">{matchedRules.length} Active Engine Signatures</span>
                    {hasViolations && (
                      <button
                        onClick={onNavigateToFindings}
                        className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
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
        <div className="space-y-6">
          <div className="font-press-start text-[9px] text-[#85D743] uppercase tracking-wider">
            MITRE COMMON WEAKNESS ENUMERATION (CWE) TAXONOMY
          </div>

          <div className="panel-surface border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="divide-y divide-white/10">
              {CWE_CATEGORIES.map(cwe => {
                const matchedRules = rules.filter(r => r.cwe.toLowerCase() === cwe.id.toLowerCase());
                const currentFindings = currentScan
                  ? currentScan.findings.filter(f => f.cwe.toLowerCase() === cwe.id.toLowerCase())
                  : [];

                const hasViolations = currentFindings.length > 0;

                return (
                  <div key={cwe.id} className="p-5 sm:p-6 hover:bg-white/[0.03] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm font-mono">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/15 text-[#85D743] font-bold text-xs">
                          {cwe.id}
                        </span>
                        <span className="text-white font-bold text-sm sm:text-base">{cwe.title}</span>
                      </div>
                      <div className="text-white/60 text-xs">
                        Mapped to: <span className="text-white/80 font-semibold">{cwe.owasp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-white/60 text-xs font-semibold">
                        {matchedRules.length} Engine Rule{matchedRules.length > 1 ? 's' : ''}
                      </span>

                      <span className={`px-2.5 py-1 rounded text-[8px] font-press-start ${
                        hasViolations 
                          ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' 
                          : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
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
