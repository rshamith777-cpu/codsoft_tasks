import React, { useState } from 'react';
import { 
  FileText, 
  Cpu, 
  Layers, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  Terminal, 
  Settings, 
  Activity,
  Code
} from 'lucide-react';

export const SettingsDocsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'SYSTEM' | 'SRS' | 'ARCHITECTURE' | 'SCORING'>('SYSTEM');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keySavedMessage, setKeySavedMessage] = useState<string | null>(null);
  const [copilotStatus, setCopilotStatus] = useState<{ configured: boolean; modelHierarchy: string[] } | null>(null);

  React.useEffect(() => {
    fetch('/api/copilot/status')
      .then(r => r.json())
      .then(data => setCopilotStatus(data))
      .catch(() => {});
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    try {
      const res = await fetch('/api/copilot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() })
      });
      if (res.ok) {
        setKeySavedMessage('API key updated securely on server session.');
        setApiKeyInput('');
        setCopilotStatus({ configured: true, modelHierarchy: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.7-flash'] });
        setTimeout(() => setKeySavedMessage(null), 3000);
      } else {
        const err = await res.json();
        setKeySavedMessage(`Failed: ${err.error || 'Invalid key'}`);
      }
    } catch {
      setKeySavedMessage('Server connection error.');
    }
  };

  return (
    <div className="space-y-10">
      {/* Consistent Spacious Internal Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            11 // SYSTEM SPECIFICATION & CONFIGURATION
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
            SYSTEM & <span className="font-serif-italic font-normal">DOCUMENTATION</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Engine diagnostics, Software Requirements Specification (SRS), Architecture, and Scoring Methodology.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono">
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">ENGINE CORE</div>
            <div className="text-[#85D743] font-bold mt-0.5">AST v2.4 (Active)</div>
          </div>
          <div className="text-right hidden sm:block p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">TRACK</div>
            <div className="text-white/90 font-bold mt-0.5">CODSOFT Cybersecurity</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 text-xs sm:text-sm font-mono">
        <button
          onClick={() => setActiveSubTab('SYSTEM')}
          className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-semibold ${
            activeSubTab === 'SYSTEM'
              ? 'bg-white/20 border-white/40 text-white font-bold shadow-md'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          ENGINE CONFIG
        </button>

        <button
          onClick={() => setActiveSubTab('SRS')}
          className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-semibold ${
            activeSubTab === 'SRS'
              ? 'bg-white/20 border-white/40 text-white font-bold shadow-md'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          SRS SPECIFICATION
        </button>

        <button
          onClick={() => setActiveSubTab('ARCHITECTURE')}
          className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-semibold ${
            activeSubTab === 'ARCHITECTURE'
              ? 'bg-white/20 border-white/40 text-white font-bold shadow-md'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          ARCHITECTURE
        </button>

        <button
          onClick={() => setActiveSubTab('SCORING')}
          className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-semibold ${
            activeSubTab === 'SCORING'
              ? 'bg-white/20 border-white/40 text-white font-bold shadow-md'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          SCORING FORMULA
        </button>
      </div>

      {/* 1. SYSTEM & CONFIG */}
      {activeSubTab === 'SYSTEM' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-3 border border-white/15 shadow-xl">
              <div className="font-press-start text-[8px] text-[#85D743] uppercase">SCANNER ENGINE</div>
              <div className="text-lg font-bold font-mono text-white flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                CodeSentinel Core AST v2.4
              </div>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">Multi-language static analysis with AST tokenization & pattern matching.</p>
            </div>

            <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-3 border border-white/15 shadow-xl">
              <div className="font-press-start text-[8px] text-amber-400 uppercase">RULE REPOSITORY</div>
              <div className="text-lg font-bold font-mono text-white">18 Active Signatures</div>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">Covering OWASP Top 10 (2021) and MITRE CWE security taxonomies.</p>
            </div>

            <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-3 border border-white/15 shadow-xl">
              <div className="font-press-start text-[8px] text-blue-400 uppercase">AI COPILOT ENGINE</div>
              <div className="text-lg font-bold font-mono text-white flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${copilotStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {copilotStatus?.configured ? 'Gemini Engine Active' : 'Deterministic Advisory Engine'}
              </div>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                {copilotStatus?.configured 
                  ? 'Server-side assisted exploit mechanics & automated patch generation.' 
                  : 'Operating in deterministic offline advisory mode. Connect API key to enable interactive Gemini dialogues.'}
              </p>
            </div>
          </div>

          {/* Copilot Server API Configuration Box */}
          <div className="panel-surface p-8 sm:p-10 rounded-2xl border border-white/15 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-press-start text-[10px] text-[#85D743] uppercase tracking-wider">
                  SECURITY COPILOT SERVER CONFIGURATION
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  Keys are stored strictly in-memory on the backend server and are never exposed to browser bundles or network responses.
                </p>
              </div>

              <span className={`px-3 py-1 rounded-md text-[8px] font-press-start font-bold self-start sm:self-auto ${
                copilotStatus?.configured 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {copilotStatus?.configured ? 'KEY CONFIGURED' : 'NO KEY (DETERMINISTIC FALLBACK)'}
              </span>
            </div>

            <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={copilotStatus?.configured ? '•••••••••••••••••••••••••••••••• (Active Session Key)' : 'Enter Gemini API Key (e.g. AIzaSy...)'}
                className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white placeholder:text-white/30 focus:border-[#85D743]/60 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!apiKeyInput.trim()}
                className="w-full sm:w-auto btn-liquid-primary px-7 py-3.5 rounded-xl text-xs sm:text-sm font-mono font-bold cursor-pointer disabled:opacity-40 shadow-md"
              >
                APPLY KEY TO SESSION
              </button>
            </form>

            {keySavedMessage && (
              <div className="text-sm font-mono text-emerald-400 font-semibold">
                {keySavedMessage}
              </div>
            )}
          </div>

          <div className="panel-surface p-8 sm:p-10 rounded-2xl space-y-6 border border-white/15 shadow-xl">
            <h3 className="font-press-start text-[10px] text-[#85D743] uppercase tracking-wider">
              SUPPORTED CODE TARGETS & LANGUAGE MATRIX
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm font-mono">
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <span className="text-white font-bold">Python</span>
                <p className="text-white/60 text-xs mt-1">.py, Flask, Django, FastAPI</p>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <span className="text-white font-bold">TypeScript & JS</span>
                <p className="text-white/60 text-xs mt-1">.ts, .tsx, .js, Node, Express</p>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <span className="text-white font-bold">Go (Golang)</span>
                <p className="text-white/60 text-xs mt-1">.go, crypto/rand, net/http</p>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <span className="text-white font-bold">PHP</span>
                <p className="text-white/60 text-xs mt-1">.php, Laravel, APIs</p>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <span className="text-white font-bold">SQL</span>
                <p className="text-white/60 text-xs mt-1">.sql, DDL, DML queries</p>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <span className="text-white font-bold">Infrastructure</span>
                <p className="text-white/60 text-xs mt-1">Dockerfile, Containerfiles</p>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <span className="text-white font-bold">Config & Secrets</span>
                <p className="text-white/60 text-xs mt-1">.env, .json, .yaml, .yml</p>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                <span className="text-white font-bold">Java & Ruby</span>
                <p className="text-white/60 text-xs mt-1">.java, .rb, Spring, Rails</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SRS SPECIFICATION */}
      {activeSubTab === 'SRS' && (
        <div className="panel-surface p-8 sm:p-12 space-y-8 text-sm leading-relaxed font-sans border border-white/15 rounded-3xl shadow-2xl">
          <div className="border-b border-white/10 pb-6">
            <div className="font-press-start text-[9px] text-[#85D743] uppercase">CODSOFT CYBER SECURITY INTERNSHIP SPECIFICATION</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-2">SOFTWARE REQUIREMENTS SPECIFICATION (SRS)</h2>
            <p className="text-white/60 font-mono text-xs mt-1">Project: CodeSentinel Secure Code Assessment Platform (Task 3)</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-base font-bold text-[#85D743] uppercase tracking-wider">1. System Purpose & Scope</h3>
            <p className="text-white/80 leading-relaxed">
              CodeSentinel is an application-security workstation designed for security engineers, analysts, and developers to perform static application security testing (SAST), detect vulnerabilities before production, inspect code evidence with exact line precision, and produce exportable audit reports.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-base font-bold text-[#85D743] uppercase tracking-wider">2. Functional Requirements</h3>
            <ul className="space-y-3 list-disc list-inside text-white/80 leading-relaxed">
              <li><strong className="text-white">FR-01 (Multi-Source Ingestion):</strong> The system shall accept source code input via direct file upload, multi-file ZIP archive extraction, raw snippet pasting, or pre-loaded benchmark repositories.</li>
              <li><strong className="text-white">FR-02 (Static AST & Pattern Scanning):</strong> The scanner engine shall execute AST and syntax pattern inspections against all submitted files without requiring external cloud analysis tools for core detection.</li>
              <li><strong className="text-white">FR-03 (CWE & OWASP Mapping):</strong> Every identified flaw must be categorized according to standard MITRE Common Weakness Enumeration (CWE) and OWASP Top 10 standards.</li>
              <li><strong className="text-white">FR-04 (Line & Evidence Highlighting):</strong> The system must pinpoint exact line numbers, extract surrounding contextual code blocks, and highlight the offending token.</li>
              <li><strong className="text-white">FR-05 (Deterministic Scoring):</strong> The security score must be computed using an open, reproducible formula rather than stochastic or random approximations.</li>
              <li><strong className="text-white">FR-06 (Export & Compliance):</strong> The platform must support PDF, JSON, and CSV export of complete assessment results.</li>
              <li><strong className="text-white">FR-07 (Security Copilot):</strong> An AI copilot powered by Gemini 2.5/2.0/1.5 Flash must assist analysts by explaining exploit mechanics and providing verified code patches for real findings.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-base font-bold text-[#85D743] uppercase tracking-wider">3. Non-Functional Requirements</h3>
            <ul className="space-y-3 list-disc list-inside text-white/80 leading-relaxed">
              <li><strong className="text-white">NFR-01 (Data Integrity):</strong> Absolutely no mock random numbers (Math.random) shall be used for dashboard statistics or security scores. Empty states must be explicitly rendered when no scan has occurred.</li>
              <li><strong className="text-white">NFR-02 (Zero-Trust Security):</strong> All Gemini API keys must remain strictly on the server-side (`server.ts`) and never be exposed in client bundles.</li>
              <li><strong className="text-white">NFR-03 (Performance):</strong> Static analysis of a 10-file repository shall complete within 300 milliseconds.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 3. ARCHITECTURE */}
      {activeSubTab === 'ARCHITECTURE' && (
        <div className="panel-surface p-8 sm:p-12 space-y-8 text-sm leading-relaxed font-sans border border-white/15 rounded-3xl shadow-2xl">
          <div className="border-b border-white/10 pb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">SYSTEM ARCHITECTURE</h2>
            <p className="text-white/60 font-mono text-xs mt-1">Component Interaction & Pipeline Flow</p>
          </div>

          <div className="p-6 rounded-2xl bg-black/80 border border-white/15 font-mono text-xs sm:text-sm text-white/90 overflow-x-auto whitespace-pre shadow-inner">
{`+-----------------------------------------------------------------------+
|                       CodeSentinel UI (React)                         |
|   Landing Page -> Workstation Shell -> 11 Dedicated Security Views    |
+-----------------------------------------------------------------------+
                                  |
                REST API calls (/api/scan, /api/copilot/chat)
                                  v
+-----------------------------------------------------------------------+
|                    Express Full-Stack Server (server.ts)              |
|                      Port 3000 (0.0.0.0 Binding)                      |
+-----------------------------------------------------------------------+
         |                                           |
         v                                           v
+-----------------------------+             +---------------------------+
|  Static Analysis Engine     |             |  Gemini AI Copilot        |
|  - Multi-lang AST parsing   |             |  - Gemini 2.5/2.0 Flash   |
|  - 18+ Security Rules       |             |  - Exploit Analysis       |
|  - CWE / OWASP Mapping      |             |  - Remediation Patches    |
|  - Deterministic Scoring    |             +---------------------------+
+-----------------------------+
         |
         v
+-----------------------------+
|  Persistence Layer          |
|  - Scan History Storage     |
|  - Audit Log Storage        |
|  - JSON / CSV / PDF Exports |
+-----------------------------+`}
          </div>

          <div className="space-y-3">
            <h3 className="font-mono text-base font-bold text-[#85D743] uppercase tracking-wider">Key Architectural Highlights</h3>
            <p className="text-white/80 leading-relaxed text-sm sm:text-base">
              The architecture enforces strict separation of concerns: the client focuses entirely on high-performance visualization, code rendering, and finding exploration; the server executes static analysis rules and coordinates AI copilot reasoning with zero sensitive token exposure.
            </p>
          </div>
        </div>
      )}

      {/* 4. SCORING METHODOLOGY */}
      {activeSubTab === 'SCORING' && (
        <div className="panel-surface p-8 sm:p-12 space-y-8 text-sm leading-relaxed font-sans border border-white/15 rounded-3xl shadow-2xl">
          <div className="border-b border-white/10 pb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">DETERMINISTIC SECURITY SCORING METHODOLOGY</h2>
            <p className="text-white/60 font-mono text-xs mt-1">Mathematical Model for Security Posture Quantification</p>
          </div>

          <div className="space-y-6">
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              CodeSentinel calculates security posture scores using a mathematically reproducible, CVSS-weighted penalty model. Every calculation is 100% deterministic: analyzing the same repository with the same rule set produces the exact same score.
            </p>

            <div className="p-6 rounded-2xl bg-black/80 border border-white/15 font-mono text-sm sm:text-base space-y-3 shadow-inner">
              <div className="font-press-start text-[9px] text-[#85D743] uppercase">SCORING FORMULA:</div>
              <div className="text-emerald-300 font-bold">
                BaseScore = 100
              </div>
              <div className="text-amber-300 font-bold">
                TotalDeductions = (CriticalCount × 25) + (HighCount × 12) + (MediumCount × 5) + (LowCount × 2)
              </div>
              <div className="text-rose-300 font-bold">
                FinalScore = Max(0, Min(100, BaseScore - TotalDeductions))
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-mono font-bold text-white uppercase text-xs">RATING TIERS:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs sm:text-sm">
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <div className="font-bold text-base">80 - 100: SECURE</div>
                  <div className="text-xs text-white/60 mt-1">Clean baseline or minor low-severity notices.</div>
                </div>
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300">
                  <div className="font-bold text-base">50 - 79: MODERATE RISK</div>
                  <div className="text-xs text-white/60 mt-1">Medium to high vulnerabilities present.</div>
                </div>
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
                  <div className="font-bold text-base">0 - 49: CRITICAL DEFICIT</div>
                  <div className="text-xs text-white/60 mt-1">Multiple critical/high flaws requiring immediate fix.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
