import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Copy, 
  Check, 
  AlertTriangle,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { Finding, ScanResult, Severity } from '../types.ts';

interface FindingsViewProps {
  currentScan: ScanResult | null;
  selectedFindingId?: string | null;
  onNavigateToCode: (file: string, line: number) => void;
  onOpenCopilotWithFinding: (finding: Finding) => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  currentScan,
  selectedFindingId: initialSelectedId,
  onNavigateToCode,
  onOpenCopilotWithFinding
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [copied, setCopied] = useState(false);

  if (!currentScan) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">03 / FINDING INTELLIGENCE</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              FINDING <span className="font-serif-italic font-normal">INTELLIGENCE</span>
            </h1>
            <p className="text-sm text-[#9a9a9a]">
              Inspect line-level vulnerability evidence, impact explanations, and verified remediation blueprints.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <div className="text-[#9a9a9a] text-[10px]">TOTAL FINDINGS</div>
              <div className="text-white/60">—</div>
            </div>
            <div className="text-right">
              <div className="text-[#9a9a9a] text-[10px]">STATUS</div>
              <div className="text-white/60">NO ASSESSMENT DATA</div>
            </div>
          </div>
        </div>

        <div className="panel-surface p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">NO FINDINGS AVAILABLE</h3>
          <p className="text-sm text-[#9a9a9a] leading-relaxed">
            Run a security assessment to populate the finding intelligence registry.
          </p>
        </div>
      </div>
    );
  }

  const allFindings = currentScan.findings || [];

  // Filter findings
  const filteredFindings = allFindings.filter(f => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.cwe.toLowerCase().includes(q) ||
        f.file.toLowerCase().includes(q) ||
        f.evidence.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Current active finding
  const activeFinding = allFindings.find(f => f.id === selectedId) || filteredFindings[0] || allFindings[0] || null;

  const handleCopyEvidence = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Consistent Internal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">03 / FINDING INTELLIGENCE</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            FINDING <span className="font-serif-italic font-normal">INTELLIGENCE</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/10">
              {allFindings.length} DETECTED
            </span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Evidence-backed security weaknesses mapped to MITRE CWE & OWASP Top 10 classifications.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="text-right">
            <div className="text-[#9a9a9a] text-[10px]">CRITICAL / HIGH</div>
            <div className="text-rose-400 font-medium">
              {currentScan.criticalCount} Critical • {currentScan.highCount} High
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[#9a9a9a] text-[10px]">PROJECT</div>
            <div className="text-white/90 truncate max-w-[140px]">{currentScan.projectName}</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              severityFilter === 'ALL'
                ? 'bg-white/15 border-white/30 text-white font-semibold'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            ALL ({allFindings.length})
          </button>
          <button
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              severityFilter === 'CRITICAL'
                ? 'bg-rose-500/25 border-rose-500/40 text-rose-300 font-semibold'
                : 'bg-white/5 border-white/10 text-rose-400/70 hover:text-rose-300'
            }`}
          >
            CRITICAL ({currentScan.criticalCount})
          </button>
          <button
            onClick={() => setSeverityFilter('HIGH')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              severityFilter === 'HIGH'
                ? 'bg-amber-500/25 border-amber-500/40 text-amber-300 font-semibold'
                : 'bg-white/5 border-white/10 text-amber-400/70 hover:text-amber-300'
            }`}
          >
            HIGH ({currentScan.highCount})
          </button>
          <button
            onClick={() => setSeverityFilter('MEDIUM')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              severityFilter === 'MEDIUM'
                ? 'bg-yellow-500/25 border-yellow-500/40 text-yellow-300 font-semibold'
                : 'bg-white/5 border-white/10 text-yellow-400/70 hover:text-yellow-300'
            }`}
          >
            MEDIUM ({currentScan.mediumCount})
          </button>
          <button
            onClick={() => setSeverityFilter('LOW')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              severityFilter === 'LOW'
                ? 'bg-blue-500/25 border-blue-500/40 text-blue-300 font-semibold'
                : 'bg-white/5 border-white/10 text-blue-400/70 hover:text-blue-300'
            }`}
          >
            LOW ({currentScan.lowCount + currentScan.infoCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH FINDINGS..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
          />
        </div>
      </div>

      {/* 3-Column Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Finding List (4 cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {filteredFindings.length === 0 ? (
            <div className="panel-surface p-8 text-center text-xs font-mono text-[#9a9a9a]">
              No findings match your active filter.
            </div>
          ) : (
            filteredFindings.map((f) => {
              const isSelected = activeFinding?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-white/30 shadow-md'
                      : 'panel-surface hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      f.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {f.severity}
                    </span>
                    <span className="text-[11px] font-mono text-[#9a9a9a]">{f.cwe}</span>
                  </div>

                  <h4 className="text-xs font-semibold text-white truncate mb-1">
                    {f.title}
                  </h4>

                  <div className="text-[11px] font-mono text-white/50 truncate flex items-center justify-between">
                    <span>{f.file}:{f.line}</span>
                    <ArrowRight className={`w-3 h-3 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-white/30'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Center & Right: Selected Finding Details (8 cols) */}
        {activeFinding ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Finding Header Card */}
            <div className="panel-surface p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      activeFinding.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      activeFinding.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      activeFinding.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {activeFinding.severity}
                    </span>
                    <span className="text-xs font-mono text-[#9a9a9a]">{activeFinding.cwe}</span>
                    <span className="text-xs font-mono text-white/40">• {activeFinding.ruleId}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {activeFinding.title}
                  </h2>
                  <div className="text-xs font-mono text-white/60 flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-white/40" />
                    <span>{activeFinding.file}:{activeFinding.line}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToCode(activeFinding.file, activeFinding.line)}
                    className="btn-liquid-secondary px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-white/60" />
                    <span>VIEW IN IDE</span>
                  </button>
                  <button
                    onClick={() => onOpenCopilotWithFinding(activeFinding)}
                    className="btn-liquid-primary px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>COPILOT ANALYSIS</span>
                  </button>
                </div>
              </div>

              {/* Taxonomy Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-[#9a9a9a] text-[10px]">OWASP CATEGORY</div>
                  <div className="text-white font-medium truncate">{activeFinding.owaspCategory}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-[#9a9a9a] text-[10px]">CWE TAXONOMY</div>
                  <div className="text-white font-medium truncate">{activeFinding.cwe}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-[#9a9a9a] text-[10px]">RULE IDENTIFIER</div>
                  <div className="text-white font-medium truncate">{activeFinding.ruleId}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-[#9a9a9a] text-[10px]">IMPACT SCOPE</div>
                  <div className="text-rose-400 font-medium">Remote Exploit</div>
                </div>
              </div>
            </div>

            {/* Center: Evidence Code Inspector */}
            <div className="panel-surface p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-white/60" />
                  DETECTED CODE EVIDENCE
                </h3>
                <button
                  onClick={() => handleCopyEvidence(activeFinding.evidence)}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY EVIDENCE</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-black/80 border border-white/10 font-mono text-xs text-rose-300 overflow-x-auto">
                <div className="text-[11px] text-[#9a9a9a] mb-1.5 select-none">
                  // {activeFinding.file} (Line {activeFinding.line})
                </div>
                <pre className="text-white leading-relaxed">{activeFinding.evidence}</pre>
              </div>
            </div>

            {/* Right/Bottom: Risk & Remediation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Impact */}
              <div className="panel-surface p-5 space-y-2 border border-rose-500/20 bg-rose-950/5">
                <h4 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  SECURITY IMPACT & RISK
                </h4>
                <p className="text-xs text-[#9a9a9a] leading-relaxed">
                  {activeFinding.impact}
                </p>
              </div>

              {/* Remediation */}
              <div className="panel-surface p-5 space-y-2 border border-emerald-500/20 bg-emerald-950/5">
                <h4 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  RECOMMENDED REMEDIATION
                </h4>
                <p className="text-xs text-[#9a9a9a] leading-relaxed">
                  {activeFinding.remediation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 panel-surface p-12 text-center text-xs font-mono text-[#9a9a9a]">
            Select a finding from the left list to inspect its evidence and remediation blueprint.
          </div>
        )}
      </div>
    </div>
  );
};
