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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">07 / COMPLIANCE & REPORTS</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              SECURITY <span className="font-serif-italic font-normal">REPORT</span>
            </h1>
            <p className="text-sm text-[#9a9a9a]">
              Formal executive security assessment report and exportable compliance artifacts.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <div className="text-[#9a9a9a] text-[10px]">DOCUMENT STATUS</div>
              <div className="text-white/60">NO REPORT GENERATED</div>
            </div>
          </div>
        </div>

        <div className="panel-surface p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">NO REPORT GENERATED</h3>
          <p className="text-sm text-[#9a9a9a] leading-relaxed mb-6">
            Run a static code assessment to generate a formal compliance and vulnerability report.
          </p>
          <button
            onClick={onNavigateToScanner}
            className="btn-liquid-primary px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
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

    setDownloadSuccess('JSON report downloaded');
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

    setDownloadSuccess('CSV report downloaded');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const score = currentScan.securityScore ?? 0;
  const scoreRating = score >= 80 ? 'SECURE' : score >= 50 ? 'MODERATE RISK' : 'CRITICAL DEFICIT';

  return (
    <div className="space-y-8">
      {/* Top Controls Bar (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">07 / COMPLIANCE & REPORTS</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            ASSESSMENT <span className="font-serif-italic font-normal">REPORT</span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Formal application security review for <span className="text-white font-mono">{currentScan.projectName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrintPDF}
            className="btn-liquid-primary px-3.5 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / SAVE PDF</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn-liquid-secondary px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-400" />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-liquid-secondary px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="no-print p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Formal Printable Document Layout */}
      <div className="panel-surface p-6 sm:p-10 space-y-8 border border-white/15 bg-black/60">
        {/* Document Header */}
        <div className="border-b border-white/15 pb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-mono tracking-widest text-[#9a9a9a] uppercase">
              CODESENTINEL SECURE CODE ASSESSMENT REPORT
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Application Security Assessment
            </h2>
            <div className="text-sm text-white/70 font-mono">
              Target: <span className="text-white font-semibold">{currentScan.projectName}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs font-mono sm:text-right text-[#9a9a9a]">
            <div>SCAN ID: <span className="text-white">{currentScan.id}</span></div>
            <div>DATE: <span className="text-white">{new Date(currentScan.startedAt).toLocaleDateString()}</span></div>
            <div>STATUS: <span className="text-emerald-400 font-semibold">{currentScan.status}</span></div>
            <div>ENGINE: <span className="text-white/80">{currentScan.scannerEngine.name}</span></div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/90 border-b border-white/10 pb-1.5">
            1. EXECUTIVE SUMMARY
          </h3>
          <p className="text-xs sm:text-sm text-[#9a9a9a] leading-relaxed font-sans">
            A static security code assessment was conducted on the source codebase of <strong className="text-white">{currentScan.projectName}</strong>.
            The assessment analyzed <strong className="text-white">{currentScan.filesScanned} source files</strong> spanning <strong className="text-white">{currentScan.linesScanned} lines of code</strong> across active AST security rules.
            The scan identified a total of <strong className="text-white">{currentScan.findings.length} security findings</strong>, resulting in a computed Security Posture Score of <strong className="text-white">{score} / 100 ({scoreRating})</strong>.
          </p>
        </div>

        {/* Security Posture Summary Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/90 border-b border-white/10 pb-1.5">
            2. RISK PROFILE & SEVERITY DISTRIBUTION
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-[#9a9a9a] uppercase">SECURITY SCORE</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{score}/100</div>
              <div className="text-[10px] font-mono text-[#9a9a9a]">{scoreRating}</div>
            </div>

            <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-center">
              <div className="text-[10px] font-mono text-rose-300 uppercase">CRITICAL</div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{currentScan.criticalCount}</div>
              <div className="text-[10px] font-mono text-rose-300/60">Immediate Fix</div>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-center">
              <div className="text-[10px] font-mono text-amber-300 uppercase">HIGH</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{currentScan.highCount}</div>
              <div className="text-[10px] font-mono text-amber-300/60">Urgent Fix</div>
            </div>

            <div className="p-3.5 rounded-lg bg-yellow-950/20 border border-yellow-500/20 text-center">
              <div className="text-[10px] font-mono text-yellow-300 uppercase">MEDIUM</div>
              <div className="text-2xl font-bold font-mono text-yellow-400 mt-1">{currentScan.mediumCount}</div>
              <div className="text-[10px] font-mono text-yellow-300/60">Moderate Risk</div>
            </div>

            <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/20 text-center">
              <div className="text-[10px] font-mono text-blue-300 uppercase">LOW</div>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{currentScan.lowCount + currentScan.infoCount}</div>
              <div className="text-[10px] font-mono text-blue-300/60">Hardening</div>
            </div>
          </div>
        </div>

        {/* Detailed Findings Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/90 border-b border-white/10 pb-1.5">
            3. DETAILED VULNERABILITY INVENTORY
          </h3>

          {currentScan.findings.length === 0 ? (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
              No security vulnerabilities detected during this assessment. Clean code baseline.
            </div>
          ) : (
            <div className="space-y-4">
              {currentScan.findings.map((f, index) => (
                <div key={f.id} className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[#9a9a9a]">#{index + 1}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                        f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                        f.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {f.severity}
                      </span>
                      <span className="text-white font-semibold font-sans">{f.title}</span>
                      <span className="text-[#9a9a9a] font-normal">({f.cwe})</span>
                    </div>

                    <div className="text-white/50 font-mono text-[11px]">
                      {f.file}:{f.line}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-[#9a9a9a] font-mono uppercase block mb-0.5">Description</span>
                      <p className="text-[#9a9a9a] font-sans">{f.description}</p>
                    </div>
                    <div>
                      <span className="text-[#9a9a9a] font-mono uppercase block mb-0.5">Potential Impact</span>
                      <p className="text-[#9a9a9a] font-sans">{f.impact}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#9a9a9a] font-mono uppercase text-[10px] block mb-1">Vulnerable Code Evidence:</span>
                    <pre className="p-2.5 rounded bg-black/80 border border-white/10 font-mono text-[11px] text-rose-300 overflow-x-auto whitespace-pre">
                      {f.evidence}
                    </pre>
                  </div>

                  <div>
                    <span className="text-emerald-400 font-mono uppercase text-[10px] block mb-1">Remediation Action:</span>
                    <p className="text-[#9a9a9a] font-sans">{f.remediation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Footer */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] font-mono text-[#9a9a9a]">
          <div>Report generated by CodeSentinel Static Analysis Engine v2.4</div>
          <div>Page 1 of 1 • Internal Security Classification: RESTRICTED</div>
        </div>
      </div>
    </div>
  );
};
