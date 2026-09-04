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
    <div className="space-y-8">
      {/* Consistent Internal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">06 / AUDIT TRAIL</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            ASSESSMENT <span className="font-serif-italic font-normal">HISTORY</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/10">
              {scans.length} ARCHIVED
            </span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Auditable log of previous source code vulnerability scans and posture score trajectories.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={onNavigateToScanner}
            className="btn-liquid-primary px-4 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-2 cursor-pointer"
          >
            <span>NEW ASSESSMENT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="panel-surface p-12 text-center text-xs font-mono text-[#9a9a9a]">
          Loading assessment archives...
        </div>
      ) : scans.length === 0 ? (
        <div className="panel-surface p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-8 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <History className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">NO ARCHIVED ASSESSMENTS</h3>
          <p className="text-sm text-[#9a9a9a] leading-relaxed mb-6">
            No previous scans found in history. Run a scan to create your first assessment log.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToScanner}
              className="btn-liquid-primary px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            >
              RUN SECURITY SCAN
            </button>
            <button
              onClick={onLoadDemo}
              className="btn-liquid-secondary px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>LOAD DEMO</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="panel-surface border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 border-b border-white/10 text-[#9a9a9a] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-normal">SCAN ID</th>
                  <th className="py-3 px-4 font-normal">PROJECT NAME</th>
                  <th className="py-3 px-4 font-normal">TIMESTAMP</th>
                  <th className="py-3 px-4 font-normal">FILES / LOC</th>
                  <th className="py-3 px-4 font-normal">FINDINGS</th>
                  <th className="py-3 px-4 font-normal">SCORE</th>
                  <th className="py-3 px-4 font-normal text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {scans.map((scan) => {
                  const score = scan.securityScore ?? 0;
                  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';

                  return (
                    <tr
                      key={scan.id}
                      onClick={() => onLoadScanById(scan.id)}
                      className="hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-white font-medium">
                        {scan.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-sans font-medium truncate max-w-[160px]">{scan.projectName}</span>
                          {scan.isDemo && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-white/60">
                        {new Date(scan.startedAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-white/60">
                        {scan.filesScanned} files ({scan.linesScanned} lines)
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {scan.criticalCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {scan.criticalCount}C
                            </span>
                          )}
                          {scan.highCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {scan.highCount}H
                            </span>
                          )}
                          {scan.mediumCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                              {scan.mediumCount}M
                            </span>
                          )}
                          {scan.lowCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {scan.lowCount}L
                            </span>
                          )}
                          {scan.findingsCount === 0 && (
                            <span className="text-emerald-400">CLEAN</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${scoreColor}`}>
                          {scan.securityScore !== null ? `${scan.securityScore}/100` : '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLoadScanById(scan.id);
                            }}
                            className="btn-liquid-secondary px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer"
                          >
                            OPEN
                          </button>
                          <button
                            onClick={(e) => handleDelete(scan.id, e)}
                            disabled={deletingId === scan.id}
                            className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete scan record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
