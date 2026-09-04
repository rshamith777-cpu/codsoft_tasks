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
  CheckCircle2
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
      <div className="space-y-8">
        {/* Consistent Internal Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">01 / SECURITY OVERVIEW</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              SECURITY <span className="font-serif-italic font-normal">POSTURE</span>
            </h1>
            <p className="text-sm text-[#9a9a9a]">
              Current vulnerability intelligence and security evaluation metrics.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right hidden sm:block">
              <div className="text-[#9a9a9a] text-[10px]">SCAN STATUS</div>
              <div className="text-white/60">NO ASSESSMENT</div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[#9a9a9a] text-[10px]">PROJECT NAME</div>
              <div className="text-white/60">—</div>
            </div>
            <div className="text-right">
              <div className="text-[#9a9a9a] text-[10px]">LAST ASSESSMENT</div>
              <div className="text-white/60">—</div>
            </div>
          </div>
        </div>

        {/* Empty Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="panel-surface p-4">
            <div className="text-[11px] font-mono text-[#9a9a9a] uppercase mb-1">SECURITY SCORE</div>
            <div className="text-2xl font-bold font-mono text-white/30">—</div>
          </div>
          <div className="panel-surface p-4">
            <div className="text-[11px] font-mono text-[#9a9a9a] uppercase mb-1">CRITICAL</div>
            <div className="text-2xl font-bold font-mono text-white/30">0</div>
          </div>
          <div className="panel-surface p-4">
            <div className="text-[11px] font-mono text-[#9a9a9a] uppercase mb-1">HIGH</div>
            <div className="text-2xl font-bold font-mono text-white/30">0</div>
          </div>
          <div className="panel-surface p-4">
            <div className="text-[11px] font-mono text-[#9a9a9a] uppercase mb-1">MEDIUM</div>
            <div className="text-2xl font-bold font-mono text-white/30">0</div>
          </div>
          <div className="panel-surface p-4">
            <div className="text-[11px] font-mono text-[#9a9a9a] uppercase mb-1">LOW</div>
            <div className="text-2xl font-bold font-mono text-white/30">0</div>
          </div>
          <div className="panel-surface p-4">
            <div className="text-[11px] font-mono text-[#9a9a9a] uppercase mb-1">FILES SCANNED</div>
            <div className="text-2xl font-bold font-mono text-white/30">0</div>
          </div>
        </div>

        {/* Genuine Empty State */}
        <div className="panel-surface p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">NO ASSESSMENT DATA</h3>
          <p className="text-sm text-[#9a9a9a] max-w-md mb-6 leading-relaxed">
            Run a security assessment to generate findings, evaluate source code vulnerabilities, and inspect line-level evidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onNavigate('scanner')}
              className="btn-liquid-primary px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>RUN SECURITY ASSESSMENT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLoadDemo}
              className="btn-liquid-secondary px-6 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>LOAD DETERMINISTIC DEMO</span>
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
    <div className="space-y-8">
      {/* Consistent Internal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">01 / SECURITY OVERVIEW</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            SECURITY <span className="font-serif-italic font-normal">POSTURE</span>
            {currentScan.isDemo && (
              <span className="text-xs px-2.5 py-0.5 rounded font-mono font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO MODE
              </span>
            )}
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Vulnerability intelligence and deterministic security evaluation for <span className="text-white font-mono">{currentScan.projectName}</span>
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="text-right">
            <div className="text-[#9a9a9a] text-[10px]">SCAN STATUS</div>
            <div className="text-emerald-400 flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>COMPLETED</span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[#9a9a9a] text-[10px]">PROJECT NAME</div>
            <div className="text-white/90 truncate max-w-[140px]">{currentScan.projectName}</div>
          </div>
          <div className="text-right">
            <div className="text-[#9a9a9a] text-[10px]">LAST ASSESSMENT</div>
            <div className="text-white/90">{new Date(currentScan.completedAt).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Score */}
        <div className="panel-surface p-4 border border-white/10 relative overflow-hidden">
          <div className="text-[11px] font-mono text-[#9a9a9a] uppercase mb-1">SECURITY SCORE</div>
          <div className={`text-3xl font-bold font-mono ${scoreColor}`}>
            {score}
            <span className="text-xs text-white/40 font-normal ml-1">/100</span>
          </div>
          <div className="text-[10px] font-mono mt-1 text-[#9a9a9a] uppercase">{scoreRating}</div>
        </div>

        {/* Critical */}
        <div className="panel-surface p-4 border border-rose-500/20 bg-rose-950/10">
          <div className="text-[11px] font-mono text-rose-400/80 uppercase mb-1">CRITICAL</div>
          <div className="text-3xl font-bold font-mono text-rose-400">
            {currentScan.criticalCount}
          </div>
          <div className="text-[10px] font-mono mt-1 text-[#9a9a9a]">Immediate Fix</div>
        </div>

        {/* High */}
        <div className="panel-surface p-4 border border-amber-500/20 bg-amber-950/10">
          <div className="text-[11px] font-mono text-amber-400/80 uppercase mb-1">HIGH</div>
          <div className="text-3xl font-bold font-mono text-amber-400">
            {currentScan.highCount}
          </div>
          <div className="text-[10px] font-mono mt-1 text-[#9a9a9a]">Urgent Action</div>
        </div>

        {/* Medium */}
        <div className="panel-surface p-4 border border-yellow-500/20">
          <div className="text-[11px] font-mono text-yellow-400/80 uppercase mb-1">MEDIUM</div>
          <div className="text-3xl font-bold font-mono text-yellow-400">
            {currentScan.mediumCount}
          </div>
          <div className="text-[10px] font-mono mt-1 text-[#9a9a9a]">Moderate Risk</div>
        </div>

        {/* Low */}
        <div className="panel-surface p-4 border border-blue-500/20">
          <div className="text-[11px] font-mono text-blue-400/80 uppercase mb-1">LOW</div>
          <div className="text-3xl font-bold font-mono text-blue-400">
            {currentScan.lowCount + currentScan.infoCount}
          </div>
          <div className="text-[10px] font-mono mt-1 text-[#9a9a9a]">Hardening</div>
        </div>

        {/* Files & Lines */}
        <div className="panel-surface p-4 border border-white/10">
          <div className="text-[11px] font-mono text-[#9a9a9a] uppercase mb-1">FILES SCANNED</div>
          <div className="text-3xl font-bold font-mono text-white">
            {currentScan.filesScanned}
          </div>
          <div className="text-[10px] font-mono mt-1 text-[#9a9a9a]">{currentScan.linesScanned} Lines Analyzed</div>
        </div>
      </div>

      {/* Main Arrangement: Left Posture, Center Severity, Right Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Security Posture Summary */}
        <div className="panel-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-white/60" />
              POSTURE EVALUATION
            </h3>
            <span className={`text-xs font-mono font-bold ${scoreColor}`}>{scoreRating}</span>
          </div>

          <p className="text-xs text-[#9a9a9a] leading-relaxed">
            Deterministic CVSS-weighted analysis shows {currentScan.criticalCount} critical and {currentScan.highCount} high severity vulnerabilities requiring immediate code refactoring.
          </p>

          <div className="pt-2 border-t border-white/10 space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-[#9a9a9a]">CVSS BASE WEIGHT</span>
              <span className="text-white font-medium">{score >= 80 ? 'Low Exposure' : 'High Risk Profile'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-[#9a9a9a]">COMPLIANCE POSTURE</span>
              <span className="text-white font-medium">OWASP Top 10 Deficit</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#9a9a9a]">REMEDIATION EFFORT</span>
              <span className="text-white font-medium">{currentScan.criticalCount * 2 + currentScan.highCount} Engineering Hours</span>
            </div>
          </div>
        </div>

        {/* Center: Severity Distribution */}
        <div className="panel-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-white/60" />
              SEVERITY DISTRIBUTION
            </h3>
            <span className="text-xs font-mono text-[#9a9a9a]">{totalFindings} Total Findings</span>
          </div>

          {totalFindings > 0 ? (
            <div className="space-y-3 pt-1">
              <div className="w-full h-2.5 rounded-full bg-white/10 flex overflow-hidden">
                {currentScan.criticalCount > 0 && (
                  <div 
                    className="h-full bg-rose-500" 
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
                    className="h-full bg-blue-500" 
                    style={{ width: `${(currentScan.lowCount / totalFindings) * 100}%` }}
                    title={`Low: ${currentScan.lowCount}`}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#9a9a9a] pt-2">
                <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Critical
                  </span>
                  <span className="text-white font-bold">{currentScan.criticalCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    High
                  </span>
                  <span className="text-white font-bold">{currentScan.highCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Medium
                  </span>
                  <span className="text-white font-bold">{currentScan.mediumCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Low / Info
                  </span>
                  <span className="text-white font-bold">{currentScan.lowCount + currentScan.infoCount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#9a9a9a] py-6 text-center">No vulnerabilities detected in codebase.</div>
          )}
        </div>

        {/* Right: Latest Assessment Metadata */}
        <div className="panel-surface p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Info className="w-4 h-4 text-white/60" />
            LATEST METADATA
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-[#9a9a9a]">SCAN ID</span>
              <span className="text-white font-medium">{currentScan.id}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-[#9a9a9a]">SOURCE TYPE</span>
              <span className="text-white font-medium">{currentScan.sourceType}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-[#9a9a9a]">ENGINE</span>
              <span className="text-white font-medium">{currentScan.scannerEngine.name}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#9a9a9a]">ACTIVE RULES</span>
              <span className="text-white font-medium">{currentScan.scannerEngine.activeRules} Signatures</span>
            </div>
          </div>
        </div>
      </div>

      {/* Below: RECENT FINDINGS (Clean Technical Table) */}
      <div className="panel-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">RECENT FINDINGS</h3>
            <p className="text-xs text-[#9a9a9a]">Priority security issues detected by the AST scanner.</p>
          </div>
          <button
            onClick={() => onNavigate('findings')}
            className="btn-liquid-secondary px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <span>VIEW ALL FINDINGS ({totalFindings})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Technical Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-[#9a9a9a]">
                <th className="py-2.5 px-3 font-normal">SEVERITY</th>
                <th className="py-2.5 px-3 font-normal">FINDING TITLE</th>
                <th className="py-2.5 px-3 font-normal">CWE ID</th>
                <th className="py-2.5 px-3 font-normal">LOCATION</th>
                <th className="py-2.5 px-3 font-normal text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentScan.findings.slice(0, 5).map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onNavigate('findings', f.id)}
                  className="hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      f.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-white font-medium group-hover:text-white/90">
                    {f.title}
                  </td>
                  <td className="py-3 px-3 text-[#9a9a9a]">
                    {f.cwe}
                  </td>
                  <td className="py-3 px-3 text-white/60">
                    {f.file}:{f.line}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('findings', f.id);
                      }}
                      className="text-white/40 group-hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5 inline" />
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
