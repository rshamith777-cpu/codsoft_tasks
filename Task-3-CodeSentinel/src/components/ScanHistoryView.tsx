import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  ArrowRight, 
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { ScanResult } from '../types.ts';

interface ScanHistoryViewProps {
  onLoadScanById: (id: string) => void;
  onNavigateToScanner: () => void;
  onLoadDemo: () => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  onLoadScanById,
  onNavigateToScanner,
  onLoadDemo
}) => {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = () => {
    fetch('/api/scans')
      .then(res => res.json())
      .then(data => {
        setScans(data.scans || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch scan history:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this assessment record from the workstation archive?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScans(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Consistent Spacious Internal Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            06 // AUDIT ARCHIVE
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
            ASSESSMENT <span className="font-serif-italic font-normal">HISTORY</span>
            <span className="font-press-start text-[9px] px-3.5 py-1 rounded-lg uppercase bg-white/10 text-white/90 border border-white/15">
              {scans.length} ARCHIVED
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Auditable log of previous source code vulnerability scans and posture score trajectories.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm font-mono">
          <button
            onClick={onNavigateToScanner}
            className="btn-liquid-primary px-6 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2.5 cursor-pointer shadow-lg"
          >
            <span>NEW ASSESSMENT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="panel-surface p-16 text-center text-sm font-mono text-[#9a9a9a] rounded-2xl">
          Loading assessment archives...
        </div>
      ) : scans.length === 0 ? (
        <div className="panel-surface p-12 sm:p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-12 border border-white/15 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#85D743]/10 border-2 border-[#85D743]/40 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(133,215,67,0.2)]">
            <History className="w-8 h-8 text-[#85D743]" />
          </div>
          <div className="font-press-start text-xs text-[#85D743] mb-3 uppercase tracking-wider">
            STANDBY // ARCHIVE EMPTY
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">NO ARCHIVED ASSESSMENTS</h3>
          <p className="text-base text-white/70 leading-relaxed mb-8 max-w-lg">
            No previous scans found in history. Run a scan to create your first assessment log.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToScanner}
              className="btn-liquid-primary px-8 py-3.5 rounded-xl text-sm font-bold cursor-pointer shadow-lg"
            >
              RUN SECURITY SCAN
            </button>
            <button
              onClick={onLoadDemo}
              className="btn-liquid-secondary px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>LOAD DEMO</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="panel-surface border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-mono">
              <thead className="bg-white/5 border-b border-white/10 text-[#9a9a9a] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-bold">SCAN ID</th>
                  <th className="py-4 px-6 font-bold">PROJECT NAME</th>
                  <th className="py-4 px-6 font-bold">TIMESTAMP</th>
                  <th className="py-4 px-6 font-bold">FILES / LOC</th>
                  <th className="py-4 px-6 font-bold">FINDINGS</th>
                  <th className="py-4 px-6 font-bold">SCORE</th>
                  <th className="py-4 px-6 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white/85">
                {scans.map((scan) => {
                  const score = scan.securityScore ?? 0;
                  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';

                  return (
                    <tr
                      key={scan.id}
                      onClick={() => onLoadScanById(scan.id)}
                      className="hover:bg-white/[0.04] cursor-pointer transition-colors group"
                    >
                      <td className="py-5 px-6 text-white font-bold">
                        {scan.id}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-sans font-bold text-sm sm:text-base truncate max-w-[200px]">{scan.projectName}</span>
                          {scan.isDemo && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-press-start bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-white/60">
                        {new Date(scan.startedAt).toLocaleString()}
                      </td>
                      <td className="py-5 px-6 text-white/70">
                        {scan.filesScanned} files ({scan.linesScanned} LOC)
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 text-[10px] font-press-start">
                          {scan.criticalCount > 0 && (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              {scan.criticalCount}C
                            </span>
                          )}
                          {scan.highCount > 0 && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              {scan.highCount}H
                            </span>
                          )}
                          {scan.mediumCount > 0 && (
                            <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              {scan.mediumCount}M
                            </span>
                          )}
                          {scan.lowCount > 0 && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                              {scan.lowCount}L
                            </span>
                          )}
                          {scan.findingsCount === 0 && (
                            <span className="text-emerald-400 font-bold">CLEAN</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`font-black text-base ${scoreColor}`}>
                          {scan.securityScore !== null ? `${scan.securityScore}/100` : '—'}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLoadScanById(scan.id);
                            }}
                            className="btn-liquid-secondary px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer"
                          >
                            OPEN
                          </button>
                          <button
                            onClick={(e) => handleDelete(scan.id, e)}
                            disabled={deletingId === scan.id}
                            className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                            title="Delete scan record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
