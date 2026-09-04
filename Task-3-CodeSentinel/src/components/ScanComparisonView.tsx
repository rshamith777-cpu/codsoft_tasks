import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { ScanResult, Finding, ScanComparisonResult, DiffStatus } from '../types.ts';

interface ScanComparisonViewProps {
  currentScan: ScanResult | null;
  onNavigateToFindings: () => void;
  onNavigateToScanner: () => void;
}

export const ScanComparisonView: React.FC<ScanComparisonViewProps> = ({
  currentScan,
  onNavigateToFindings,
  onNavigateToScanner
}) => {
  const [allScans, setAllScans] = useState<any[]>([]);
  const [baseScanId, setBaseScanId] = useState<string>('');
  const [compareScanId, setCompareScanId] = useState<string>('');
  const [comparison, setComparison] = useState<ScanComparisonResult | null>(null);
  const [filterStatus, setFilterStatus] = useState<DiffStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all historical scans to populate dropdowns
  useEffect(() => {
    fetch('/api/scans')
      .then(r => r.json())
      .then(data => {
        if (data.scans && Array.isArray(data.scans)) {
          setAllScans(data.scans);
          if (data.scans.length >= 2) {
            // Default: compare previous scan with latest scan
            setBaseScanId(data.scans[1].id);
            setCompareScanId(data.scans[0].id);
          } else if (data.scans.length === 1) {
            setCompareScanId(data.scans[0].id);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load scan history for comparison:', err);
      });
  }, [currentScan]);

  // Run comparison when base or compare selection changes
  useEffect(() => {
    if (!baseScanId || !compareScanId) {
      setComparison(null);
      return;
    }
    if (baseScanId === compareScanId) {
      setError('Select two different assessment scans to perform delta comparison.');
      setComparison(null);
      return;
    }

    setError(null);
    setIsLoading(true);

    fetch('/api/scans/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseScanId, compareScanId })
    })
      .then(r => {
        if (!r.ok) throw new Error('Comparison failed');
        return r.json();
      })
      .then(data => {
        setComparison(data);
      })
      .catch(err => {
        setError('Failed to compute scan comparison. Ensure both scans exist.');
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [baseScanId, compareScanId]);

  if (allScans.length < 2) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">03 / INTELLIGENCE ENGINE</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              SCAN <span className="font-serif-italic font-normal">COMPARISON</span>
            </h1>
            <p className="text-sm text-[#9a9a9a]">
              Deterministic differential security assessment between historical code scans.
            </p>
          </div>
        </div>

        <div className="panel-surface p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <GitCompare className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">MINIMUM TWO SCANS REQUIRED</h3>
          <p className="text-sm text-[#9a9a9a] leading-relaxed mb-6">
            Scan comparison evaluates vulnerability regressions and remediations between code versions. Run at least two assessments to compute differential telemetry.
          </p>
          <button
            onClick={onNavigateToScanner}
            className="btn-liquid-primary px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
          >
            START ASSESSMENT
          </button>
        </div>
      </div>
    );
  }

  // Combine findings with categorized status
  const allDiffItems: Array<{ finding: Finding; status: DiffStatus }> = [];
  if (comparison) {
    comparison.newFindings.forEach(f => allDiffItems.push({ finding: f, status: 'NEW' }));
    comparison.resolvedFindings.forEach(f => allDiffItems.push({ finding: f, status: 'RESOLVED' }));
    comparison.regressedFindings.forEach(f => allDiffItems.push({ finding: f, status: 'REGRESSED' }));
    comparison.unchangedFindings.forEach(f => allDiffItems.push({ finding: f, status: 'UNCHANGED' }));
  }

  const filteredItems = filterStatus === 'ALL' 
    ? allDiffItems 
    : allDiffItems.filter(item => item.status === filterStatus);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">03 / INTELLIGENCE ENGINE</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            SCAN <span className="font-serif-italic font-normal">COMPARISON</span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Differential security delta analysis between two authentic assessment runs.
          </p>
        </div>

        {comparison && (
          <div className="flex items-center gap-6 text-xs font-mono">
            <div className="text-right">
              <div className="text-[#9a9a9a] text-[10px]">DELTA SCORE</div>
              <div className={`font-bold flex items-center justify-end gap-1 ${
                comparison.scoreDelta > 0 
                  ? 'text-emerald-400' 
                  : comparison.scoreDelta < 0 
                  ? 'text-rose-400' 
                  : 'text-white/60'
              }`}>
                {comparison.scoreDelta > 0 && <TrendingUp className="w-3.5 h-3.5" />}
                {comparison.scoreDelta < 0 && <TrendingDown className="w-3.5 h-3.5" />}
                {comparison.scoreDelta === 0 && <Minus className="w-3.5 h-3.5" />}
                <span>{comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} PTS</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#9a9a9a] text-[10px]">MUTATED FINDINGS</div>
              <div className="text-white/90 font-bold">{comparison.totalDiffCount} CHANGED</div>
            </div>
          </div>
        )}
      </div>

      {/* Selector Toolbar */}
      <div className="panel-surface p-5 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-mono text-[#9a9a9a] uppercase mb-1.5">
            BASELINE SCAN (BEFORE)
          </label>
          <select
            value={baseScanId}
            onChange={(e) => setBaseScanId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs font-mono text-white focus:border-[#85D743] outline-none"
          >
            {allScans.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.projectName} ({s.id.slice(-8)}) — Score: {s.securityScore ?? '—'} ({new Date(s.startedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-[#9a9a9a] uppercase mb-1.5">
            COMPARISON SCAN (AFTER / CURRENT)
          </label>
          <select
            value={compareScanId}
            onChange={(e) => setCompareScanId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-xs font-mono text-white focus:border-[#85D743] outline-none"
          >
            {allScans.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.projectName} ({s.id.slice(-8)}) — Score: {s.securityScore ?? '—'} ({new Date(s.startedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {comparison && (
        <>
          {/* Summary Delta Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setFilterStatus(filterStatus === 'NEW' ? 'ALL' : 'NEW')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                filterStatus === 'NEW' 
                  ? 'bg-rose-500/15 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                  : 'panel-surface border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-rose-400 font-semibold uppercase">NEW FLAWS</span>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                +{comparison.newFindings.length}
              </div>
              <p className="text-[10px] text-[#9a9a9a] mt-0.5">Introduced in comparison scan</p>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                filterStatus === 'RESOLVED' 
                  ? 'bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                  : 'panel-surface border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase">RESOLVED</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                -{comparison.resolvedFindings.length}
              </div>
              <p className="text-[10px] text-[#9a9a9a] mt-0.5">Successfully mitigated</p>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'REGRESSED' ? 'ALL' : 'REGRESSED')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                filterStatus === 'REGRESSED' 
                  ? 'bg-amber-500/15 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                  : 'panel-surface border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase">REGRESSED</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {comparison.regressedFindings.length}
              </div>
              <p className="text-[10px] text-[#9a9a9a] mt-0.5">Escalated severity</p>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'UNCHANGED' ? 'ALL' : 'UNCHANGED')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                filterStatus === 'UNCHANGED' 
                  ? 'bg-white/15 border-white/40' 
                  : 'panel-surface border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#9a9a9a] font-semibold uppercase">UNCHANGED</span>
                <span className="w-2 h-2 rounded-full bg-white/40" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {comparison.unchangedFindings.length}
              </div>
              <p className="text-[10px] text-[#9a9a9a] mt-0.5">Persistent across scans</p>
            </button>
          </div>

          {/* Detailed Differential Findings List */}
          <div className="panel-surface border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-mono text-white flex items-center gap-2">
                <span className="font-semibold uppercase tracking-wider">DIFFERENTIAL FINDINGS</span>
                <span className="text-[#9a9a9a]">({filteredItems.length} records)</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                {(['ALL', 'NEW', 'RESOLVED', 'REGRESSED', 'UNCHANGED'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      filterStatus === tab 
                        ? 'bg-white/20 text-white font-semibold' 
                        : 'text-[#9a9a9a] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#9a9a9a]">
                No findings match the "{filterStatus}" filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredItems.map(({ finding, status }, idx) => (
                  <div key={`${finding.id}-${idx}`} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        {status === 'NEW' && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-[10px]">
                            + NEW
                          </span>
                        )}
                        {status === 'RESOLVED' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                            ✓ RESOLVED
                          </span>
                        )}
                        {status === 'REGRESSED' && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px]">
                            ⚠ REGRESSED
                          </span>
                        )}
                        {status === 'UNCHANGED' && (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/60 text-[10px]">
                            UNCHANGED
                          </span>
                        )}

                        <span className="text-white font-semibold">{finding.title}</span>
                        <span className="text-white/40">({finding.cwe})</span>
                      </div>

                      <div className="text-[#9a9a9a] text-[11px] truncate">
                        <span className="text-white/60">{finding.file}</span> : Line {finding.line}
                      </div>

                      <div className="p-2 rounded bg-black/40 border border-white/5 text-[11px] text-emerald-400 font-mono truncate">
                        {finding.evidence}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        finding.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        finding.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                        finding.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {finding.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
