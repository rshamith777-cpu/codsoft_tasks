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
    <div className="space-y-8">
      {/* Consistent Internal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">05 / SYSTEM SPECIFICATION</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            SYSTEM & <span className="font-serif-italic font-normal">DOCUMENTATION</span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Engine diagnostics, Software Requirements Specification (SRS), Architecture, and Scoring Methodology.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="text-right">
            <div className="text-[#9a9a9a] text-[10px]">ENGINE CORE</div>
            <div className="text-white/90">AST v2.4 (Active)</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[#9a9a9a] text-[10px]">PROJECT</div>
            <div className="text-white/90">CodSoft Internship</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-4 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('SYSTEM')}
          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            activeSubTab === 'SYSTEM'
              ? 'bg-white/15 border-white/30 text-white font-semibold'
              : 'bg-white/5 border-white/10 text-[#9a9a9a] hover:text-white'
          }`}
        >
          ENGINE CONFIG
        </button>

        <button
          onClick={() => setActiveSubTab('SRS')}
          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            activeSubTab === 'SRS'
              ? 'bg-white/15 border-white/30 text-white font-semibold'
              : 'bg-white/5 border-white/10 text-[#9a9a9a] hover:text-white'
          }`}
        >
          SRS SPECIFICATION
        </button>

        <button
          onClick={() => setActiveSubTab('ARCHITECTURE')}
          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            activeSubTab === 'ARCHITECTURE'
              ? 'bg-white/15 border-white/30 text-white font-semibold'
              : 'bg-white/5 border-white/10 text-[#9a9a9a] hover:text-white'
          }`}
        >
          ARCHITECTURE
        </button>

        <button
          onClick={() => setActiveSubTab('SCORING')}
          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            activeSubTab === 'SCORING'
              ? 'bg-white/15 border-white/30 text-white font-semibold'
              : 'bg-white/5 border-white/10 text-[#9a9a9a] hover:text-white'
          }`}
        >
          SCORING FORMULA
        </button>
      </div>

      {/* 1. SYSTEM & CONFIG */}
      {activeSubTab === 'SYSTEM' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="panel-surface p-5 space-y-2 border border-white/10">
              <div className="text-[11px] font-mono text-[#9a9a9a] uppercase">SCANNER ENGINE</div>
              <div className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                CodeSentinel Core AST v2.4
              </div>
              <p className="text-xs text-[#9a9a9a]">Multi-language static analysis with AST tokenization & pattern matching.</p>
            </div>

            <div className="panel-surface p-5 space-y-2 border border-white/10">
              <div className="text-[11px] font-mono text-[#9a9a9a] uppercase">RULE REPOSITORY</div>
              <div className="text-base font-bold font-mono text-white">18 Active Signatures</div>
              <p className="text-xs text-[#9a9a9a]">Covering OWASP Top 10 (2021) and MITRE CWE security taxonomies.</p>
            </div>

            <div className="panel-surface p-5 space-y-2 border border-white/10">
              <div className="text-[11px] font-mono text-[#9a9a9a] uppercase">AI COPILOT ENGINE</div>
              <div className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${copilotStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {copilotStatus?.configured ? 'Gemini Engine Active' : 'Deterministic Advisory Engine'}
              </div>
              <p className="text-xs text-[#9a9a9a]">
                {copilotStatus?.configured 
                  ? 'Server-side assisted exploit mechanics & automated patch generation.' 
                  : 'Operating in deterministic offline advisory mode. Connect API key to enable interactive Gemini dialogues.'}
              </p>
            </div>
          </div>

          {/* Copilot Server API Configuration Box */}
          <div className="panel-surface p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  SECURITY COPILOT SERVER CONFIGURATION
                </h3>
                <p className="text-xs text-[#9a9a9a] mt-0.5">
                  Keys are stored strictly in-memory on the backend server and are never exposed to browser bundles or network responses.
                </p>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold self-start sm:self-auto ${
                copilotStatus?.configured 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {copilotStatus?.configured ? 'KEY CONFIGURED' : 'NO KEY (DETERMINISTIC FALLBACK)'}
              </span>
            </div>

            <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={copilotStatus?.configured ? '•••••••••••••••••••••••••••••••• (Active)' : 'Enter Gemini API Key (e.g. AIzaSy...)'}
                className="w-full sm:flex-1 px-3.5 py-2 rounded-lg bg-black/50 border border-white/15 text-xs font-mono text-white placeholder:text-white/30 focus:border-[#85D743] outline-none"
              />
              <button
                type="submit"
                disabled={!apiKeyInput.trim()}
                className="w-full sm:w-auto btn-liquid-primary px-5 py-2 rounded-lg text-xs font-mono font-semibold cursor-pointer disabled:opacity-40"
              >
                APPLY KEY TO SESSION
              </button>
            </form>

            {keySavedMessage && (
              <div className="text-xs font-mono text-emerald-400">
                {keySavedMessage}
              </div>
            )}
          </div>

          <div className="panel-surface p-6 space-y-4">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              SUPPORTED CODE TARGETS & LANGUAGE MATRIX
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-black/40 border border-white/10">
                <span className="text-white font-semibold">Python</span>
                <p className="text-[#9a9a9a] text-[11px]">.py, Flask, Django, FastAPI</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/10">
                <span className="text-white font-semibold">TypeScript & JS</span>
                <p className="text-[#9a9a9a] text-[11px]">.ts, .tsx, .js, Node, Express</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/10">
                <span className="text-white font-semibold">Go (Golang)</span>
                <p className="text-[#9a9a9a] text-[11px]">.go, crypto/rand, net/http</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/10">
                <span className="text-white font-semibold">PHP</span>
                <p className="text-[#9a9a9a] text-[11px]">.php, Laravel, APIs</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/10">
                <span className="text-white font-semibold">SQL</span>
                <p className="text-[#9a9a9a] text-[11px]">.sql, DDL, DML queries</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/10">
                <span className="text-white font-semibold">Infrastructure</span>
                <p className="text-[#9a9a9a] text-[11px]">Dockerfile, Containerfiles</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/10">
                <span className="text-white font-semibold">Config & Secrets</span>
                <p className="text-[#9a9a9a] text-[11px]">.env, .json, .yaml, .yml</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/10">
                <span className="text-white font-semibold">Java & Ruby</span>
                <p className="text-[#9a9a9a] text-[11px]">.java, .rb, Spring, Rails</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SRS SPECIFICATION */}
      {activeSubTab === 'SRS' && (
        <div className="panel-surface p-6 sm:p-8 space-y-6 text-xs leading-relaxed font-sans">
          <div className="border-b border-white/10 pb-4">
            <div className="font-mono text-[#9a9a9a] text-[11px]">CODSOFT CYBER SECURITY INTERNSHIP SPECIFICATION</div>
            <h2 className="text-xl font-bold text-white font-mono mt-1">SOFTWARE REQUIREMENTS SPECIFICATION (SRS)</h2>
            <p className="text-[#9a9a9a] font-mono text-[11px]">Project: CodeSentinel Secure Code Assessment Platform</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">1. System Purpose & Scope</h3>
            <p className="text-[#9a9a9a]">
              CodeSentinel is an application-security workstation designed for security engineers, analysts, and developers to perform static application security testing (SAST), detect vulnerabilities before production, inspect code evidence with exact line precision, and produce exportable audit reports.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">2. Functional Requirements</h3>
            <ul className="space-y-2 list-disc list-inside text-[#9a9a9a]">
              <li><strong className="text-white">FR-01 (Multi-Source Ingestion):</strong> The system shall accept source code input via direct file upload, multi-file ZIP archive extraction, raw snippet pasting, or pre-loaded benchmark repositories.</li>
              <li><strong className="text-white">FR-02 (Static AST & Pattern Scanning):</strong> The scanner engine shall execute AST and syntax pattern inspections against all submitted files without requiring external cloud analysis tools for core detection.</li>
              <li><strong className="text-white">FR-03 (CWE & OWASP Mapping):</strong> Every identified flaw must be categorized according to standard MITRE Common Weakness Enumeration (CWE) and OWASP Top 10 standards.</li>
              <li><strong className="text-white">FR-04 (Line & Evidence Highlighting):</strong> The system must pinpoint exact line numbers, extract surrounding contextual code blocks, and highlight the offending token.</li>
              <li><strong className="text-white">FR-05 (Deterministic Scoring):</strong> The security score must be computed using an open, reproducible formula rather than stochastic or random approximations.</li>
              <li><strong className="text-white">FR-06 (Export & Compliance):</strong> The platform must support PDF, JSON, and CSV export of complete assessment results.</li>
              <li><strong className="text-white">FR-07 (Security Copilot):</strong> An AI copilot powered by Gemini 3.7 Flash must assist analysts by explaining exploit mechanics and providing verified code patches for real findings.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">3. Non-Functional Requirements</h3>
            <ul className="space-y-2 list-disc list-inside text-[#9a9a9a]">
              <li><strong className="text-white">NFR-01 (Data Integrity):</strong> Absolutely no mock random numbers (Math.random) shall be used for dashboard statistics or security scores. Empty states must be explicitly rendered when no scan has occurred.</li>
              <li><strong className="text-white">NFR-02 (Zero-Trust Security):</strong> All Gemini API keys must remain strictly on the server-side (`server.ts`) and never be exposed in client bundles.</li>
              <li><strong className="text-white">NFR-03 (Performance):</strong> Static analysis of a 10-file repository shall complete within 300 milliseconds.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 3. ARCHITECTURE */}
      {activeSubTab === 'ARCHITECTURE' && (
        <div className="panel-surface p-6 sm:p-8 space-y-6 text-xs leading-relaxed font-sans">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white font-mono">SYSTEM ARCHITECTURE</h2>
            <p className="text-[#9a9a9a] font-mono text-[11px]">Component Interaction & Pipeline Flow</p>
          </div>

          <div className="p-4 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-white/90 overflow-x-auto whitespace-pre">
{`+-----------------------------------------------------------------------+
|                       CodeSentinel UI (React 19)                      |
|   Landing Page -> Workstation Shell -> 8 Dedicated Security Views    |
+-----------------------------------------------------------------------+
                                  |
               REST API calls (/api/scan, /api/ai/analyze)
                                  v
+-----------------------------------------------------------------------+
|                    Express Full-Stack Server (server.ts)              |
|                      Port 3000 (0.0.0.0 Binding)                      |
+-----------------------------------------------------------------------+
         |                                           |
         v                                           v
+-----------------------------+             +---------------------------+
|  Static Analysis Engine     |             |  Gemini AI Copilot        |
|  - Multi-lang AST parsing   |             |  - Gemini 3.7 Flash       |
|  - 18+ Security Rules       |             |  - Exploit Analysis       |
|  - CWE / OWASP Mapping      |             |  - Remediation Patches    |
|  - Deterministic Scoring    |             +---------------------------+
+-----------------------------+
         |
         v
+-----------------------------+
|  Persistence Layer          |
|  - Scan History Storage     |
|  - JSON / CSV / PDF Exports |
+-----------------------------+`}
          </div>

          <div className="space-y-3">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Key Architectural Highlights</h3>
            <p className="text-[#9a9a9a]">
              The architecture enforces strict separation of concerns: the client focuses entirely on high-performance visualization, code rendering, and finding exploration; the server executes static analysis rules and coordinates AI copilot reasoning with zero sensitive token exposure.
            </p>
          </div>
        </div>
      )}

      {/* 4. SCORING METHODOLOGY */}
      {activeSubTab === 'SCORING' && (
        <div className="panel-surface p-6 sm:p-8 space-y-6 text-xs leading-relaxed font-sans">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white font-mono">DETERMINISTIC SECURITY SCORING METHODOLOGY</h2>
            <p className="text-[#9a9a9a] font-mono text-[11px]">Mathematical Model for Security Posture Quantification</p>
          </div>

          <div className="space-y-4">
            <p className="text-[#9a9a9a]">
              CodeSentinel calculates security posture scores using a mathematically reproducible, CVSS-weighted penalty model. Every calculation is 100% deterministic: analyzing the same repository with the same rule set produces the exact same score.
            </p>

            <div className="p-4 rounded-lg bg-black/60 border border-white/10 font-mono text-xs space-y-2">
              <div className="text-[#9a9a9a] text-[10px]">SCORING FORMULA:</div>
              <div className="text-emerald-300">
                BaseScore = 100
              </div>
              <div className="text-amber-300">
                TotalDeductions = (CriticalCount × 25) + (HighCount × 12) + (MediumCount × 5) + (LowCount × 2)
              </div>
              <div className="text-rose-300">
                FinalScore = Max(0, Min(100, BaseScore - TotalDeductions))
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-mono font-bold text-white uppercase text-[11px]">RATING TIERS:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <div className="font-bold">80 - 100: SECURE</div>
                  <div className="text-[10px] text-[#9a9a9a]">Clean baseline or minor low-severity notices.</div>
                </div>
                <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-amber-300">
                  <div className="font-bold">50 - 79: MODERATE RISK</div>
                  <div className="text-[10px] text-[#9a9a9a]">Medium to high vulnerabilities present.</div>
                </div>
                <div className="p-3 rounded bg-rose-950/20 border border-rose-500/30 text-rose-300">
                  <div className="font-bold">0 - 49: CRITICAL DEFICIT</div>
                  <div className="text-[10px] text-[#9a9a9a]">Multiple critical/high flaws requiring immediate fix.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
