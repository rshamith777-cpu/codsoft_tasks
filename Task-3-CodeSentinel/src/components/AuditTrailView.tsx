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
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'SCAN_FAILED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'AI_REQUEST':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'SCAN_DELETED':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'CONFIG_CHANGED':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'REPORT_GENERATED':
      case 'REPORT_EXPORTED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">04 / GOVERNANCE & AUDIT</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            AUDIT <span className="font-serif-italic font-normal">TRAIL</span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Immutable event journal recording security operations, scan execution, and intelligence requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#9a9a9a] hover:text-white transition-colors cursor-pointer"
            title="Refresh Audit Trail"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            className="btn-liquid-secondary px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT AUDIT JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="panel-surface p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[#9a9a9a]">EVENT TYPE:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-2.5 py-1.5 rounded bg-black/40 border border-white/15 text-white outline-none"
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

          <div className="flex items-center gap-2">
            <span className="text-[#9a9a9a]">SEVERITY:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 rounded bg-black/40 border border-white/15 text-white outline-none"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="SECURITY">SECURITY</option>
            </select>
          </div>
        </div>

        <div className="text-[#9a9a9a]">
          Showing <span className="text-white font-semibold">{filteredLogs.length}</span> of {logs.length} events
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="panel-surface border border-white/10 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#9a9a9a] space-y-2">
            <Shield className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <div className="text-white font-semibold">NO AUDIT RECORDS FOUND</div>
            <p className="max-w-md mx-auto">
              Security events will appear here automatically when scans are executed, findings are investigated, or configuration changes occur.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredLogs.map((entry) => (
              <div 
                key={entry.id} 
                className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-white/40 text-[11px]">{entry.id}</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getEventBadgeColor(entry.eventType)}`}>
                      {entry.eventType}
                    </span>
                    {entry.severity && entry.severity !== 'INFO' && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        entry.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                        entry.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {entry.severity}
                      </span>
                    )}
                  </div>

                  <p className="text-white/90 text-xs leading-relaxed">
                    {entry.description}
                  </p>

                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="text-[11px] text-[#9a9a9a] flex items-center gap-3 flex-wrap">
                      {Object.entries(entry.metadata).map(([k, v]) => (
                        <span key={k} className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                          <span className="text-white/50">{k}:</span> {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col md:items-end justify-between text-[11px] text-[#9a9a9a] flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className="text-white/40 text-[10px]">
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
