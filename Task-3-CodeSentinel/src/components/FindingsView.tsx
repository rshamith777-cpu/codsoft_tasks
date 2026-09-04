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
  ShieldCheck,
  ChevronRight
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
      <div className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
              03 // VULNERABILITY INTELLIGENCE
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              VULNERABILITY <span className="font-serif-italic font-normal">INTELLIGENCE</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
              Inspect line-level vulnerability evidence, impact explanations, and verified remediation blueprints.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm font-mono">
            <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">TOTAL FINDINGS</div>
              <div className="text-white/60 font-semibold mt-0.5">—</div>
            </div>
            <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">STATUS</div>
              <div className="text-white/60 font-semibold mt-0.5">NO ASSESSMENT DATA</div>
            </div>
          </div>
        </div>

        <div className="panel-surface p-12 sm:p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-12 border border-white/15 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#85D743]/10 border-2 border-[#85D743]/40 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(133,215,67,0.2)]">
            <ShieldAlert className="w-8 h-8 text-[#85D743]" />
          </div>
          <div className="font-press-start text-xs text-[#85D743] mb-3 uppercase tracking-wider">
            STANDBY // NO FINDINGS
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">NO FINDINGS AVAILABLE</h3>
          <p className="text-base text-white/70 max-w-lg mb-8 leading-relaxed">
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
    <div className="space-y-10">
      {/* Consistent Spacious Internal Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            03 // VULNERABILITY INTELLIGENCE
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
            VULNERABILITY <span className="font-serif-italic font-normal">INTELLIGENCE</span>
            <span className="font-press-start text-[9px] px-3.5 py-1 rounded-lg uppercase bg-white/10 text-white/90 border border-white/15">
              {allFindings.length} DETECTED
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Evidence-backed security weaknesses mapped to MITRE CWE & OWASP Top 10 classifications.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono">
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">CRITICAL / HIGH</div>
            <div className="text-rose-400 font-extrabold mt-0.5">
              {currentScan.criticalCount} Critical • {currentScan.highCount} High
            </div>
          </div>
          <div className="text-right hidden sm:block p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">PROJECT</div>
            <div className="text-white/90 font-bold truncate max-w-[180px] mt-0.5">{currentScan.projectName}</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all cursor-pointer ${
              severityFilter === 'ALL'
                ? 'bg-white/20 border border-white/40 text-white font-bold shadow-md'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            ALL ({allFindings.length})
          </button>
          <button
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all cursor-pointer ${
              severityFilter === 'CRITICAL'
                ? 'bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold shadow-md'
                : 'bg-white/5 border border-white/10 text-rose-400/80 hover:text-rose-300 hover:bg-white/10'
            }`}
          >
            CRITICAL ({currentScan.criticalCount})
          </button>
          <button
            onClick={() => setSeverityFilter('HIGH')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all cursor-pointer ${
              severityFilter === 'HIGH'
                ? 'bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold shadow-md'
                : 'bg-white/5 border border-white/10 text-amber-400/80 hover:text-amber-300 hover:bg-white/10'
            }`}
          >
            HIGH ({currentScan.highCount})
          </button>
          <button
            onClick={() => setSeverityFilter('MEDIUM')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all cursor-pointer ${
              severityFilter === 'MEDIUM'
                ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 font-bold shadow-md'
                : 'bg-white/5 border border-white/10 text-yellow-400/80 hover:text-yellow-300 hover:bg-white/10'
            }`}
          >
            MEDIUM ({currentScan.mediumCount})
          </button>
          <button
            onClick={() => setSeverityFilter('LOW')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all cursor-pointer ${
              severityFilter === 'LOW'
                ? 'bg-blue-500/30 border border-blue-500/50 text-blue-300 font-bold shadow-md'
                : 'bg-white/5 border border-white/10 text-blue-400/80 hover:text-blue-300 hover:bg-white/10'
            }`}
          >
            LOW ({currentScan.lowCount + currentScan.infoCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY TITLE, CWE, CODE..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#85D743]/50 transition-colors"
          />
        </div>
      </div>

      {/* 2-Column Spacious Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Finding List (4 cols) */}
        <div className="lg:col-span-4 space-y-3 max-h-[850px] overflow-y-auto pr-2">
          {filteredFindings.length === 0 ? (
            <div className="panel-surface p-10 text-center text-sm font-mono text-[#9a9a9a] rounded-2xl">
              No findings match your active filter criteria.
            </div>
          ) : (
            filteredFindings.map((f) => {
              const isSelected = activeFinding?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 border-white/35 shadow-xl ring-1 ring-white/20'
                      : 'panel-surface hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded text-[8px] font-press-start ${
                      f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      f.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {f.severity}
                    </span>
                    <span className="text-xs font-mono font-bold text-white/60">{f.cwe}</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white truncate mb-1.5">
                    {f.title}
                  </h4>

                  <div className="text-xs font-mono text-white/50 truncate flex items-center justify-between">
                    <span>{f.file}:{f.line}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#85D743] translate-x-1' : 'text-white/30'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Finding Details (8 cols) */}
        {activeFinding ? (
          <div className="lg:col-span-8 space-y-8">
            {/* Finding Header Card */}
            <div className="panel-surface p-8 sm:p-10 rounded-2xl space-y-6 border border-white/15 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-press-start ${
                      activeFinding.severity === 'CRITICAL' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-sm' :
                      activeFinding.severity === 'HIGH' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm' :
                      activeFinding.severity === 'MEDIUM' ? 'bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 shadow-sm' :
                      'bg-blue-500/25 text-blue-300 border border-blue-500/40 shadow-sm'
                    }`}>
                      {activeFinding.severity}
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-[#85D743]">{activeFinding.cwe}</span>
                    <span className="text-xs sm:text-sm font-mono text-white/40">• {activeFinding.ruleId}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {activeFinding.title}
                  </h2>
                  <div className="text-sm font-mono text-white/70 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#85D743]" />
                    <span>{activeFinding.file}:{activeFinding.line}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigateToCode(activeFinding.file, activeFinding.line)}
                    className="btn-liquid-secondary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Code2 className="w-4 h-4 text-white/70" />
                    <span>VIEW IN IDE</span>
                  </button>
                  <button
                    onClick={() => onOpenCopilotWithFinding(activeFinding)}
                    className="btn-liquid-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>COPILOT ANALYSIS</span>
                  </button>
                </div>
              </div>

              {/* Taxonomy Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs sm:text-sm font-mono">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">OWASP CATEGORY</div>
                  <div className="text-white font-semibold truncate mt-1">{activeFinding.owasp || (activeFinding as any).owaspCategory || 'OWASP Top 10'}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">CWE TAXONOMY</div>
                  <div className="text-white font-semibold truncate mt-1">{activeFinding.cwe}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">RULE IDENTIFIER</div>
                  <div className="text-white font-semibold truncate mt-1">{activeFinding.ruleId}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">CONFIDENCE</div>
                  <div className="text-[#85D743] font-semibold mt-1">{activeFinding.confidence || 'HIGH'}</div>
                </div>
              </div>
            </div>

            {/* Evidence Code Inspector */}
            <div className="panel-surface p-8 sm:p-10 rounded-2xl space-y-4 border border-white/15 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-press-start text-[10px] text-[#85D743] uppercase tracking-wider flex items-center gap-2.5">
                  <Code2 className="w-4 h-4 text-[#85D743]" />
                  DETECTED CODE EVIDENCE
                </h3>
                <button
                  onClick={() => handleCopyEvidence(activeFinding.evidence)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-semibold text-white/80 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPY EVIDENCE</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-black/80 border border-white/15 font-mono text-sm text-rose-300 overflow-x-auto shadow-inner">
                <div className="text-xs text-[#9a9a9a] mb-2 select-none">
                  // {activeFinding.file} (Line {activeFinding.line})
                </div>
                <pre className="text-white leading-relaxed whitespace-pre-wrap">{activeFinding.evidence}</pre>
              </div>
            </div>

            {/* Risk & Remediation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Impact */}
              <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-3 border border-rose-500/25 bg-rose-950/10 shadow-lg">
                <h4 className="font-press-start text-[10px] text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  SECURITY IMPACT
                </h4>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  {activeFinding.securityImpact || (activeFinding as any).impact || activeFinding.description}
                </p>
              </div>

              {/* Remediation */}
              <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-3 border border-emerald-500/25 bg-emerald-950/10 shadow-lg">
                <h4 className="font-press-start text-[10px] text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  REMEDIATION GUIDANCE
                </h4>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  {activeFinding.remediation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 panel-surface p-16 text-center text-sm font-mono text-[#9a9a9a] rounded-2xl">
            Select a finding from the left list to inspect its evidence and remediation blueprint.
          </div>
        )}
      </div>
    </div>
  );
};
