import React from 'react';
import { ScanResult } from '../types.ts';
import { 
  ShieldAlert, 
  FileCode, 
  Activity, 
  ArrowRight, 
  Terminal, 
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap
} from 'lucide-react';

interface OverviewViewProps {
  currentScan: ScanResult | null;
  onNavigate: (tab: string, findingId?: string) => void;
  onLoadDemo: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentScan,
  onNavigate,
  onLoadDemo
}) => {
  if (!currentScan) {
    return (
      <div className="space-y-10">
        {/* Consistent Spacious Internal Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
              01 // SECURITY COMMAND CENTER
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              SECURITY <span className="font-serif-italic font-normal">POSTURE</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
              Comprehensive static vulnerability intelligence, deterministic risk scoring, and security evaluation metrics.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm font-mono">
            <div className="text-right hidden sm:block p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">SCAN STATUS</div>
              <div className="text-white/60 font-semibold mt-0.5">NO ASSESSMENT</div>
            </div>
            <div className="text-right hidden sm:block p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">PROJECT NAME</div>
              <div className="text-white/60 font-semibold mt-0.5">—</div>
            </div>
          </div>
        </div>

        {/* Spacious Empty Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-white/10">
            <div className="font-press-start text-[9px] text-[#85D743] uppercase mb-2">SECURITY SCORE</div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white/20">—</div>
            <div className="text-xs font-mono text-white/40 mt-2">Unassessed</div>
          </div>
          <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-rose-500/20 bg-rose-950/5">
            <div className="font-press-start text-[9px] text-rose-400 uppercase mb-2">CRITICAL</div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white/20">0</div>
            <div className="text-xs font-mono text-rose-400/50 mt-2">Zero-day level</div>
          </div>
          <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-amber-500/20 bg-amber-950/5">
            <div className="font-press-start text-[9px] text-amber-400 uppercase mb-2">HIGH</div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white/20">0</div>
            <div className="text-xs font-mono text-amber-400/50 mt-2">Urgent review</div>
          </div>
          <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-yellow-500/20 bg-yellow-950/5">
            <div className="font-press-start text-[9px] text-yellow-400 uppercase mb-2">MEDIUM</div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white/20">0</div>
            <div className="text-xs font-mono text-yellow-400/50 mt-2">Design flaws</div>
          </div>
          <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-blue-500/20 bg-blue-950/5">
            <div className="font-press-start text-[9px] text-blue-400 uppercase mb-2">LOW / INFO</div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white/20">0</div>
            <div className="text-xs font-mono text-blue-400/50 mt-2">Hardening</div>
          </div>
          <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-white/10">
            <div className="font-press-start text-[9px] text-white/60 uppercase mb-2">FILES SCANNED</div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white/20">0</div>
            <div className="text-xs font-mono text-white/40 mt-2">0 Lines</div>
          </div>
        </div>

        {/* Genuine Empty State */}
        <div className="panel-surface p-12 sm:p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-8 border border-white/15 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#85D743]/10 border-2 border-[#85D743]/40 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(133,215,67,0.2)]">
            <ShieldAlert className="w-8 h-8 text-[#85D743]" />
          </div>
          <div className="font-press-start text-xs text-[#85D743] mb-3 uppercase tracking-wider">
            SYSTEM STANDBY // NO DATA
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            NO ASSESSMENT <span className="font-serif-italic font-normal">DATA RECORDED</span>
          </h3>
          <p className="text-base text-white/70 max-w-lg mb-8 leading-relaxed">
            Run a deterministic code assessment to inspect repository sources, evaluate AST vulnerabilities, and generate line-accurate evidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onNavigate('scanner')}
              className="btn-liquid-primary px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-3 cursor-pointer shadow-lg"
            >
              <span>RUN SECURITY ASSESSMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLoadDemo}
              className="btn-liquid-secondary px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 cursor-pointer shadow-md"
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>LOAD BENCHMARK DEMO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate score colors and severity distribution
  const score = currentScan.securityScore ?? 0;
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';
  const scoreRating = score >= 80 ? 'SECURE' : score >= 50 ? 'MODERATE RISK' : 'CRITICAL DEFICIT';
  const totalFindings = currentScan.findings.length;

  return (
    <div className="space-y-10">
      {/* Consistent Spacious Internal Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            01 // SECURITY COMMAND CENTER
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
            SECURITY <span className="font-serif-italic font-normal">POSTURE</span>
            {currentScan.isDemo && (
              <span className="font-press-start text-[9px] px-3 py-1 rounded-lg uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                DEMO BENCHMARK
              </span>
            )}
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Deterministic security evaluation and vulnerability intelligence for <span className="text-white font-mono font-bold">{currentScan.projectName}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono">
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">SCAN STATUS</div>
            <div className="text-emerald-400 flex items-center justify-end gap-2 font-bold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>COMPLETED</span>
            </div>
          </div>
          <div className="text-right hidden sm:block p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">PROJECT</div>
            <div className="text-white/90 font-bold truncate max-w-[180px] mt-0.5">{currentScan.projectName}</div>
          </div>
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">COMPLETED AT</div>
            <div className="text-white/90 font-bold mt-0.5">{new Date(currentScan.completedAt).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Spacious Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {/* Score */}
        <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-white/15 relative overflow-hidden shadow-lg">
          <div className="font-press-start text-[9px] text-[#85D743] uppercase mb-2">SECURITY SCORE</div>
          <div className={`text-4xl sm:text-5xl font-black font-mono ${scoreColor}`}>
            {score}
            <span className="text-sm sm:text-base text-white/40 font-normal ml-1">/100</span>
          </div>
          <div className="mt-3">
            <span className={`px-2.5 py-1 rounded text-[9px] font-press-start ${
              score >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              score >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {scoreRating}
            </span>
          </div>
        </div>

        {/* Critical */}
        <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-rose-500/30 bg-rose-950/15 shadow-lg">
          <div className="font-press-start text-[9px] text-rose-400 uppercase mb-2">CRITICAL</div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-rose-400">
            {currentScan.criticalCount}
          </div>
          <div className="text-xs font-mono mt-3 text-rose-300/80 font-medium">Immediate Refactor</div>
        </div>

        {/* High */}
        <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-amber-500/30 bg-amber-950/15 shadow-lg">
          <div className="font-press-start text-[9px] text-amber-400 uppercase mb-2">HIGH</div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400">
            {currentScan.highCount}
          </div>
          <div className="text-xs font-mono mt-3 text-amber-300/80 font-medium">Urgent Remediation</div>
        </div>

        {/* Medium */}
        <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-yellow-500/30 bg-yellow-950/15 shadow-lg">
          <div className="font-press-start text-[9px] text-yellow-400 uppercase mb-2">MEDIUM</div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-yellow-400">
            {currentScan.mediumCount}
          </div>
          <div className="text-xs font-mono mt-3 text-yellow-300/80 font-medium">Moderate Flaw</div>
        </div>

        {/* Low / Info */}
        <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-blue-500/30 bg-blue-950/15 shadow-lg">
          <div className="font-press-start text-[9px] text-blue-400 uppercase mb-2">LOW / INFO</div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-blue-400">
            {currentScan.lowCount + currentScan.infoCount}
          </div>
          <div className="text-xs font-mono mt-3 text-blue-300/80 font-medium">Security Hardening</div>
        </div>

        {/* Files & Lines */}
        <div className="panel-surface p-6 sm:p-7 rounded-2xl border border-white/15 shadow-lg">
          <div className="font-press-start text-[9px] text-white/70 uppercase mb-2">FILES SCANNED</div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-white">
            {currentScan.filesScanned}
          </div>
          <div className="text-xs font-mono mt-3 text-white/60 font-medium">{currentScan.linesScanned} Lines Analyzed</div>
        </div>
      </div>

      {/* Main Arrangement: Left Posture, Center Severity, Right Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left: Security Posture Summary */}
        <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-5 border border-white/15 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#85D743]" />
              POSTURE EVALUATION
            </h3>
            <span className={`text-xs font-press-start ${scoreColor}`}>{scoreRating}</span>
          </div>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            Deterministic static analysis detected <strong className="text-rose-400">{currentScan.criticalCount} critical</strong> and <strong className="text-amber-400">{currentScan.highCount} high</strong> severity weaknesses requiring code-level remediation.
          </p>

          <div className="pt-4 border-t border-white/10 space-y-3 text-xs sm:text-sm font-mono">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-[#9a9a9a]">CVSS BASE WEIGHT</span>
              <span className="text-white font-semibold">{score >= 80 ? 'Low Exposure' : 'Elevated Risk'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-[#9a9a9a]">COMPLIANCE POSTURE</span>
              <span className="text-white font-semibold">OWASP Top 10 Mapped</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#9a9a9a]">REMEDIATION EFFORT</span>
              <span className="text-white font-semibold">{currentScan.criticalCount * 2 + currentScan.highCount * 1} Engineering Hours</span>
            </div>
          </div>
        </div>

        {/* Center: Severity Distribution */}
        <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-5 border border-white/15 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              SEVERITY DISTRIBUTION
            </h3>
            <span className="text-xs font-mono font-bold text-white/80">{totalFindings} Total Findings</span>
          </div>

          {totalFindings > 0 ? (
            <div className="space-y-4 pt-1">
              <div className="w-full h-3 rounded-full bg-white/10 flex overflow-hidden p-0.5">
                {currentScan.criticalCount > 0 && (
                  <div 
                    className="h-full bg-rose-500 rounded-l-full" 
                    style={{ width: `${(currentScan.criticalCount / totalFindings) * 100}%` }}
                    title={`Critical: ${currentScan.criticalCount}`}
                  />
                )}
                {currentScan.highCount > 0 && (
                  <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${(currentScan.highCount / totalFindings) * 100}%` }}
                    title={`High: ${currentScan.highCount}`}
                  />
                )}
                {currentScan.mediumCount > 0 && (
                  <div 
                    className="h-full bg-yellow-500" 
                    style={{ width: `${(currentScan.mediumCount / totalFindings) * 100}%` }}
                    title={`Medium: ${currentScan.mediumCount}`}
                  />
                )}
                {currentScan.lowCount > 0 && (
                  <div 
                    className="h-full bg-blue-500 rounded-r-full" 
                    style={{ width: `${(currentScan.lowCount / totalFindings) * 100}%` }}
                    title={`Low: ${currentScan.lowCount}`}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-mono pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-rose-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Critical
                  </span>
                  <span className="text-white font-extrabold text-base">{currentScan.criticalCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-amber-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    High
                  </span>
                  <span className="text-white font-extrabold text-base">{currentScan.highCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-yellow-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    Medium
                  </span>
                  <span className="text-white font-extrabold text-base">{currentScan.mediumCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-blue-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Low / Info
                  </span>
                  <span className="text-white font-extrabold text-base">{currentScan.lowCount + currentScan.infoCount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-white/60 py-8 text-center">No vulnerabilities detected in codebase.</div>
          )}
        </div>

        {/* Right: Latest Assessment Metadata */}
        <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-5 border border-white/15 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
            <Info className="w-5 h-5 text-blue-400" />
            LATEST METADATA
          </h3>

          <div className="space-y-3 text-xs sm:text-sm font-mono">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-[#9a9a9a]">SCAN ID</span>
              <span className="text-white font-semibold truncate max-w-[180px]">{currentScan.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-[#9a9a9a]">SOURCE TYPE</span>
              <span className="text-white font-semibold">{currentScan.sourceType}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-[#9a9a9a]">ENGINE</span>
              <span className="text-[#85D743] font-semibold">{currentScan.scannerEngine.name}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#9a9a9a]">ACTIVE RULES</span>
              <span className="text-white font-semibold">{currentScan.scannerEngine.activeRules} Signatures Loaded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Below: RECENT FINDINGS (Spacious Data Table) */}
      <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-6 border border-white/15 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">PRIORITY FINDINGS</h3>
            <p className="text-sm text-white/70 mt-1">High-risk security flaws detected by the deterministic SAST engine.</p>
          </div>
          <button
            onClick={() => onNavigate('findings')}
            className="btn-liquid-secondary px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>VIEW ALL FINDINGS ({totalFindings})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Technical Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead>
              <tr className="border-b border-white/15 text-[#9a9a9a]">
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">SEVERITY</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">FINDING TITLE</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">CWE ID</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px]">LOCATION</th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentScan.findings.slice(0, 6).map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onNavigate('findings', f.id)}
                  className="hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-press-start ${
                      f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      f.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-sans text-white font-semibold group-hover:text-emerald-300 transition-colors text-sm sm:text-base">
                    {f.title}
                  </td>
                  <td className="py-4 px-4 text-white/70 font-semibold">
                    {f.cwe}
                  </td>
                  <td className="py-4 px-4 text-white/60">
                    {f.file}:{f.line}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('findings', f.id);
                      }}
                      className="text-white/40 group-hover:text-[#85D743] transition-colors p-1"
                    >
                      <ArrowRight className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
