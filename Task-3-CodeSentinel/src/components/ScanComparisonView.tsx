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
  onNavigateToFindings: _onNavigateToFindings,
  onNavigateToScanner
}) => {
  const [allScans, setAllScans] = useState<any[]>([]);
  const [baseScanId, setBaseScanId] = useState<string>('');
  const [compareScanId, setCompareScanId] = useState<string>('');
  const [comparison, setComparison] = useState<ScanComparisonResult | null>(null);
  const [filterStatus, setFilterStatus] = useState<DiffStatus | 'ALL'>('ALL');
  const [_isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all historical scans to populate dropdowns
  useEffect(() => {
    fetch('/api/scans')
      .then(r => r.json())
      .then(data => {
        if (data.scans && Array.isArray(data.scans)) {
          setAllScans(data.scans);
          if (data.scans.length >= 2) {
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
      <div className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
              07 // SCAN COMPARISON & REGRESSION
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-4">
              SCAN <span className="font-serif-italic font-normal">COMPARISON</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
              Deterministic differential security assessment between historical code scans.
            </p>
          </div>
        </div>

        <div className="panel-surface p-12 sm:p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-12 border border-white/15 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#85D743]/10 border-2 border-[#85D743]/40 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(133,215,67,0.2)]">
            <GitCompare className="w-8 h-8 text-[#85D743]" />
          </div>
          <div className="font-press-start text-xs text-[#85D743] mb-3 uppercase tracking-wider">
            MINIMUM TWO SCANS REQUIRED
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">TWO SCANS REQUIRED</h3>
          <p className="text-base text-white/70 leading-relaxed mb-8 max-w-lg">
            Scan comparison evaluates vulnerability regressions and remediations between code versions. Run at least two assessments to compute differential telemetry.
          </p>
          <button
            onClick={onNavigateToScanner}
            className="btn-liquid-primary px-8 py-3.5 rounded-xl text-sm font-bold cursor-pointer shadow-lg"
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
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            07 // SCAN COMPARISON & REGRESSION
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-4">
            SCAN <span className="font-serif-italic font-normal">COMPARISON</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Differential security delta analysis between two authentic assessment runs.
          </p>
        </div>

        {comparison && (
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono">
            <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">DELTA SCORE</div>
              <div className={`font-black flex items-center justify-end gap-1.5 mt-0.5 text-base ${
                comparison.scoreDelta > 0 
                  ? 'text-emerald-400' 
                  : comparison.scoreDelta < 0 
                  ? 'text-rose-400' 
                  : 'text-white/70'
              }`}>
                {comparison.scoreDelta > 0 && <TrendingUp className="w-4 h-4" />}
                {comparison.scoreDelta < 0 && <TrendingDown className="w-4 h-4" />}
                {comparison.scoreDelta === 0 && <Minus className="w-4 h-4" />}
                <span>{comparison.scoreDelta > 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} PTS</span>
              </div>
            </div>
            <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">MUTATED FINDINGS</div>
              <div className="text-white font-extrabold text-base mt-0.5">{comparison.totalDiffCount} CHANGED</div>
            </div>
          </div>
        )}
      </div>

      {/* Selector Toolbar */}
      <div className="panel-surface p-6 sm:p-8 border border-white/15 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl">
        <div>
          <label className="block text-xs font-mono font-bold text-white/80 uppercase mb-2">
            BASELINE SCAN (BEFORE)
          </label>
          <select
            value={baseScanId}
            onChange={(e) => setBaseScanId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white focus:border-[#85D743]/60 outline-none transition-colors"
          >
            {allScans.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.projectName} ({s.id.slice(-8)}) — Score: {s.securityScore ?? '—'} ({new Date(s.startedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-white/80 uppercase mb-2">
            COMPARISON SCAN (AFTER / CURRENT)
          </label>
          <select
            value={compareScanId}
            onChange={(e) => setCompareScanId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white focus:border-[#85D743]/60 outline-none transition-colors"
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
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-mono flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {comparison && (
        <>
          {/* Summary Delta Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <button
              onClick={() => setFilterStatus(filterStatus === 'NEW' ? 'ALL' : 'NEW')}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer shadow-lg ${
                filterStatus === 'NEW' 
                  ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]' 
                  : 'panel-surface border-white/15 hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-press-start text-[9px] text-rose-400 font-bold uppercase">NEW FLAWS</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-2">
                +{comparison.newFindings.length}
              </div>
              <p className="text-xs text-white/60 mt-1">Introduced in comparison scan</p>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer shadow-lg ${
                filterStatus === 'RESOLVED' 
                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                  : 'panel-surface border-white/15 hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-press-start text-[9px] text-emerald-400 font-bold uppercase">RESOLVED</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-2">
                -{comparison.resolvedFindings.length}
              </div>
              <p className="text-xs text-white/60 mt-1">Successfully mitigated</p>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'REGRESSED' ? 'ALL' : 'REGRESSED')}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer shadow-lg ${
                filterStatus === 'REGRESSED' 
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                  : 'panel-surface border-white/15 hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-press-start text-[9px] text-amber-400 font-bold uppercase">REGRESSED</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-2">
                {comparison.regressedFindings.length}
              </div>
              <p className="text-xs text-white/60 mt-1">Escalated severity</p>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'UNCHANGED' ? 'ALL' : 'UNCHANGED')}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer shadow-lg ${
                filterStatus === 'UNCHANGED' 
                  ? 'bg-white/20 border-white/45' 
                  : 'panel-surface border-white/15 hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-press-start text-[9px] text-white/70 font-bold uppercase">UNCHANGED</span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/50" />
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-2">
                {comparison.unchangedFindings.length}
              </div>
              <p className="text-xs text-white/60 mt-1">Persistent across scans</p>
            </button>
          </div>

          {/* Detailed Differential Findings List */}
          <div className="panel-surface border border-white/15 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm sm:text-base font-mono text-white flex items-center gap-3">
                <span className="font-bold uppercase tracking-wider">DIFFERENTIAL FINDINGS</span>
                <span className="text-[#9a9a9a]">({filteredItems.length} records)</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                {(['ALL', 'NEW', 'RESOLVED', 'REGRESSED', 'UNCHANGED'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      filterStatus === tab 
                        ? 'bg-white/20 text-white font-bold shadow-sm' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-12 text-center text-sm font-mono text-[#9a9a9a]">
                No findings match the "{filterStatus}" filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredItems.map(({ finding, status }, idx) => (
                  <div key={`${finding.id}-${idx}`} className="p-5 sm:p-6 hover:bg-white/[0.03] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm font-mono">
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {status === 'NEW' && (
                          <span className="px-2.5 py-0.5 rounded text-[8px] font-press-start bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                            + NEW
                          </span>
                        )}
                        {status === 'RESOLVED' && (
                          <span className="px-2.5 py-0.5 rounded text-[8px] font-press-start bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                            ✓ RESOLVED
                          </span>
                        )}
                        {status === 'REGRESSED' && (
                          <span className="px-2.5 py-0.5 rounded text-[8px] font-press-start bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                            ⚠ REGRESSED
                          </span>
                        )}
                        {status === 'UNCHANGED' && (
                          <span className="px-2.5 py-0.5 rounded text-[8px] font-press-start bg-white/10 text-white/70">
                            UNCHANGED
                          </span>
                        )}

                        <span className="text-white font-bold text-sm sm:text-base">{finding.title}</span>
                        <span className="text-white/50">({finding.cwe})</span>
                      </div>

                      <div className="text-[#9a9a9a] text-xs truncate">
                        <span className="text-white/70">{finding.file}</span> : Line {finding.line}
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-emerald-400 font-mono truncate shadow-inner">
                        {finding.evidence}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-[9px] font-press-start ${
                        finding.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        finding.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        finding.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
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
