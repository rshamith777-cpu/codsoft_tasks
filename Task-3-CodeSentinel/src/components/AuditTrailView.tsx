import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  Download, 
  Filter, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';
import { AuditLogEntry, AuditEventType } from '../types.ts';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<AuditEventType | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const fetchLogs = () => {
    setIsLoading(true);
    fetch('/api/audit-log?limit=250')
      .then(r => r.json())
      .then(data => {
        if (data.auditLog && Array.isArray(data.auditLog)) {
          setLogs(data.auditLog);
        }
      })
      .catch(err => console.error('Failed to load audit trail:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `codesentinel-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter(entry => {
    if (filterType !== 'ALL' && entry.eventType !== filterType) return false;
    if (filterSeverity !== 'ALL' && entry.severity !== filterSeverity) return false;
    return true;
  });

  const getEventBadgeColor = (type: AuditEventType) => {
    switch (type) {
      case 'SCAN_STARTED':
      case 'SCAN_COMPLETED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'SCAN_FAILED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'AI_REQUEST':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'SCAN_DELETED':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'CONFIG_CHANGED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'REPORT_GENERATED':
      case 'REPORT_EXPORTED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            08 // SECURITY AUDIT TRAIL
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-4">
            AUDIT <span className="font-serif-italic font-normal">TRAIL</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Immutable event journal recording security operations, scan execution, and intelligence requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Refresh Audit Trail"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#85D743]' : ''}`} />
          </button>

          <button
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            className="btn-liquid-secondary px-5 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT AUDIT JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="panel-surface p-6 sm:p-7 border border-white/15 rounded-2xl flex flex-wrap items-center justify-between gap-6 text-xs sm:text-sm font-mono shadow-xl">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-[#9a9a9a] font-bold uppercase text-xs">EVENT TYPE:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white outline-none focus:border-[#85D743]/50 transition-colors"
            >
              <option value="ALL">ALL EVENTS</option>
              <option value="SCAN_STARTED">SCAN_STARTED</option>
              <option value="SCAN_COMPLETED">SCAN_COMPLETED</option>
              <option value="SCAN_FAILED">SCAN_FAILED</option>
              <option value="AI_REQUEST">AI_REQUEST</option>
              <option value="REPORT_GENERATED">REPORT_GENERATED</option>
              <option value="REPORT_EXPORTED">REPORT_EXPORTED</option>
              <option value="CONFIG_CHANGED">CONFIG_CHANGED</option>
              <option value="SCAN_DELETED">SCAN_DELETED</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#9a9a9a] font-bold uppercase text-xs">SEVERITY:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white outline-none focus:border-[#85D743]/50 transition-colors"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="SECURITY">SECURITY</option>
            </select>
          </div>
        </div>

        <div className="text-white/60 font-semibold">
          Showing <span className="text-[#85D743] font-bold">{filteredLogs.length}</span> of {logs.length} logged operations
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="panel-surface border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-sm font-mono text-[#9a9a9a] space-y-3">
            <Shield className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <div className="text-white font-bold text-base">NO AUDIT RECORDS FOUND</div>
            <p className="max-w-md mx-auto text-white/60">
              Security events will appear here automatically when scans are executed, findings are investigated, or configuration changes occur.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredLogs.map((entry) => (
              <div 
                key={entry.id} 
                className="p-5 sm:p-6 hover:bg-white/[0.03] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm font-mono"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white/40 text-xs">{entry.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-md border text-[9px] font-press-start ${getEventBadgeColor(entry.eventType)}`}>
                      {entry.eventType}
                    </span>
                    {entry.severity && entry.severity !== 'INFO' && (
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-press-start font-bold ${
                        entry.severity === 'CRITICAL' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' :
                        entry.severity === 'WARNING' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' :
                        'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                      }`}>
                        {entry.severity}
                      </span>
                    )}
                  </div>

                  <p className="text-white font-sans text-sm sm:text-base font-medium leading-relaxed">
                    {entry.description}
                  </p>

                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="text-xs text-[#9a9a9a] flex items-center gap-3 flex-wrap pt-1">
                      {Object.entries(entry.metadata).map(([k, v]) => (
                        <span key={k} className="bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                          <span className="text-white/50">{k}:</span> <span className="text-white/90 font-semibold">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col md:items-end justify-between text-xs text-white/60 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/40" />
                    <span className="font-bold text-white/80">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className="text-white/40 text-xs mt-1">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
