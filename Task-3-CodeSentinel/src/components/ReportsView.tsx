import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  FileJson, 
  FileSpreadsheet, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ScanResult } from '../types.ts';

interface ReportsViewProps {
  currentScan: ScanResult | null;
  onNavigateToScanner: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentScan,
  onNavigateToScanner
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!currentScan) {
    return (
      <div className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
              10 // COMPLIANCE & REPORTS
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              SECURITY <span className="font-serif-italic font-normal">REPORT</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
              Formal executive security assessment report and exportable compliance artifacts.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm font-mono">
            <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">DOCUMENT STATUS</div>
              <div className="text-white/60 font-semibold mt-0.5">NO REPORT GENERATED</div>
            </div>
          </div>
        </div>

        <div className="panel-surface p-12 sm:p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-12 border border-white/15 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#85D743]/10 border-2 border-[#85D743]/40 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(133,215,67,0.2)]">
            <FileText className="w-8 h-8 text-[#85D743]" />
          </div>
          <div className="font-press-start text-xs text-[#85D743] mb-3 uppercase tracking-wider">
            STANDBY // NO ARTIFACTS
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">NO REPORT GENERATED</h3>
          <p className="text-base text-white/70 leading-relaxed mb-8 max-w-lg">
            Run a static code assessment to generate a formal compliance and vulnerability report.
          </p>
          <button
            onClick={onNavigateToScanner}
            className="btn-liquid-primary px-8 py-3.5 rounded-xl text-sm font-bold cursor-pointer shadow-lg"
          >
            RUN ASSESSMENT
          </button>
        </div>
      </div>
    );
  }

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentScan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `codesentinel-report-${currentScan.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('JSON report downloaded successfully');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Finding ID', 'Rule ID', 'Title', 'Severity', 'CWE', 'File', 'Line', 'Evidence', 'Description', 'Remediation'];
    const rows = currentScan.findings.map(f => [
      `"${f.id}"`,
      `"${f.ruleId}"`,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${f.cwe}"`,
      `"${f.file}"`,
      f.line,
      `"${f.evidence.replace(/"/g, '""')}"`,
      `"${f.description.replace(/"/g, '""')}"`,
      `"${f.remediation.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `codesentinel-findings-${currentScan.id}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess('CSV report exported successfully');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const score = currentScan.securityScore ?? 0;
  const scoreRating = score >= 80 ? 'SECURE' : score >= 50 ? 'MODERATE RISK' : 'CRITICAL DEFICIT';

  return (
    <div className="space-y-10">
      {/* Top Controls Bar (Hidden in Print) */}
      <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            10 // COMPLIANCE & REPORTS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
            ASSESSMENT <span className="font-serif-italic font-normal">REPORT</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Formal application security review for <span className="text-white font-mono font-bold">{currentScan.projectName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrintPDF}
            className="btn-liquid-primary px-5 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE PDF</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn-liquid-secondary px-5 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileJson className="w-4 h-4 text-blue-400" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-liquid-secondary px-5 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="no-print p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs sm:text-sm font-mono text-emerald-300 flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Formal Printable Document Layout */}
      <div className="panel-surface p-8 sm:p-14 space-y-10 border border-white/15 bg-black/70 rounded-3xl shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-white/15 pb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-8">
          <div className="space-y-3">
            <div className="font-press-start text-[9px] tracking-widest text-[#85D743] uppercase">
              CODESENTINEL SECURE CODE ASSESSMENT REPORT
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Application Security Assessment
            </h2>
            <div className="text-base text-white/80 font-mono">
              Target Repository: <span className="text-[#85D743] font-bold">{currentScan.projectName}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs sm:text-sm font-mono sm:text-right text-[#9a9a9a]">
            <div>SCAN ID: <span className="text-white font-bold">{currentScan.id}</span></div>
            <div>DATE: <span className="text-white font-bold">{new Date(currentScan.startedAt).toLocaleDateString()}</span></div>
            <div>STATUS: <span className="text-emerald-400 font-bold">{currentScan.status}</span></div>
            <div>ENGINE: <span className="text-white font-bold">{currentScan.scannerEngine.name}</span></div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-4">
          <h3 className="font-press-start text-[10px] uppercase tracking-wider text-[#85D743] border-b border-white/10 pb-2">
            1. EXECUTIVE SUMMARY
          </h3>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans">
            A static security code assessment was conducted on the source codebase of <strong className="text-white">{currentScan.projectName}</strong>.
            The assessment analyzed <strong className="text-white">{currentScan.filesScanned} source files</strong> spanning <strong className="text-white">{currentScan.linesScanned} lines of code</strong> across active AST security rules.
            The scan identified a total of <strong className="text-white">{currentScan.findings.length} security findings</strong>, resulting in a computed Security Posture Score of <strong className="text-white">{score} / 100 ({scoreRating})</strong>.
          </p>
        </div>

        {/* Security Posture Summary Grid */}
        <div className="space-y-4">
          <h3 className="font-press-start text-[10px] uppercase tracking-wider text-[#85D743] border-b border-white/10 pb-2">
            2. RISK PROFILE & SEVERITY DISTRIBUTION
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
            <div className="p-5 rounded-2xl bg-black/60 border border-white/15 text-center shadow-md">
              <div className="font-press-start text-[8px] text-[#85D743] uppercase">SECURITY SCORE</div>
              <div className="text-3xl font-black font-mono text-white mt-2">{score}/100</div>
              <div className="text-xs font-mono text-white/60 mt-1">{scoreRating}</div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-center shadow-md">
              <div className="font-press-start text-[8px] text-rose-300 uppercase">CRITICAL</div>
              <div className="text-3xl font-black font-mono text-rose-400 mt-2">{currentScan.criticalCount}</div>
              <div className="text-xs font-mono text-rose-300/70 mt-1">Immediate Fix</div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-center shadow-md">
              <div className="font-press-start text-[8px] text-amber-300 uppercase">HIGH</div>
              <div className="text-3xl font-black font-mono text-amber-400 mt-2">{currentScan.highCount}</div>
              <div className="text-xs font-mono text-amber-300/70 mt-1">Urgent Action</div>
            </div>

            <div className="p-5 rounded-2xl bg-yellow-950/20 border border-yellow-500/30 text-center shadow-md">
              <div className="font-press-start text-[8px] text-yellow-300 uppercase">MEDIUM</div>
              <div className="text-3xl font-black font-mono text-yellow-400 mt-2">{currentScan.mediumCount}</div>
              <div className="text-xs font-mono text-yellow-300/70 mt-1">Moderate Risk</div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-center shadow-md">
              <div className="font-press-start text-[8px] text-blue-300 uppercase">LOW / INFO</div>
              <div className="text-3xl font-black font-mono text-blue-400 mt-2">{currentScan.lowCount + currentScan.infoCount}</div>
              <div className="text-xs font-mono text-blue-300/70 mt-1">Hardening</div>
            </div>
          </div>
        </div>

        {/* Detailed Findings Table */}
        <div className="space-y-4">
          <h3 className="font-press-start text-[10px] uppercase tracking-wider text-[#85D743] border-b border-white/10 pb-2">
            3. INVENTORY OF SECURITY FINDINGS ({currentScan.findings.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-mono border border-white/10">
              <thead className="bg-white/5 border-b border-white/10 text-white/80">
                <tr>
                  <th className="py-3.5 px-4 font-bold">SEVERITY</th>
                  <th className="py-3.5 px-4 font-bold">CWE</th>
                  <th className="py-3.5 px-4 font-bold">TITLE</th>
                  <th className="py-3.5 px-4 font-bold">LOCATION</th>
                  <th className="py-3.5 px-4 font-bold">CONFIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/85">
                {currentScan.findings.map((f) => (
                  <tr key={f.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[8px] font-press-start ${
                        f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        f.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#85D743] font-bold">{f.cwe}</td>
                    <td className="py-4 px-4 font-sans font-bold text-white text-sm sm:text-base">{f.title}</td>
                    <td className="py-4 px-4 text-white/70">{f.file}:{f.line}</td>
                    <td className="py-4 px-4 text-white/60">{f.confidence || 'HIGH'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
