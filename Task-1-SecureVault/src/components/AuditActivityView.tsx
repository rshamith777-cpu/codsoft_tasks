import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCode,
  Download,
  KeyRound,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { AuditEvent, AuditEventType, SeverityLevel } from '../types';

interface AuditActivityViewProps {
  auditLogs: AuditEvent[];
  onRefresh: () => void;
}

export const AuditActivityView: React.FC<AuditActivityViewProps> = ({ auditLogs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || log.eventType === filterType;
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchesSearch && matchesType && matchesSeverity;
  });

  const getStatusBadge = (status: string, severity: SeverityLevel) => {
    if (status === 'DENIED' || status === 'FAILED' || severity === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-red-500/40 bg-red-500/10 text-red-400 font-mono-tech text-[10px] uppercase">
          <XCircle className="w-2.5 h-2.5 text-red-400" />
          {status}
        </span>
      );
    }
    if (status === 'WARNING' || severity === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono-tech text-[10px] uppercase">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono-tech text-[10px] uppercase">
        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
        {status}
      </span>
    );
  };

  const getSeverityPill = (severity: SeverityLevel) => {
    if (severity === 'CRITICAL') {
      return <span className="text-red-400 font-bold">[CRITICAL]</span>;
    }
    if (severity === 'WARNING') {
      return <span className="text-amber-400">[WARNING]</span>;
    }
    return <span className="text-white/40">[INFO]</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-white/50 font-mono-tech text-[10px] tracking-widest uppercase">
            <Activity className="w-3.5 h-3.5 text-white/60" />
            IMMUTABLE SECURITY AUDIT TRAIL
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-1">
            Audit Activity
          </h1>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono-tech text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH LOGS</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event, user email, resource, or Event ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 text-white font-mono-tech text-xs focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 text-white font-mono-tech text-xs focus:outline-none focus:border-white"
          >
            <option value="ALL">ALL EVENT TYPES</option>
            <option value="UPLOAD">UPLOAD</option>
            <option value="ENCRYPT">ENCRYPT</option>
            <option value="DOWNLOAD">DOWNLOAD</option>
            <option value="SHARE">SHARE</option>
            <option value="REVOKE">REVOKE</option>
            <option value="DELETE">DELETE</option>
            <option value="FAILED_ACCESS">FAILED ACCESS (BLOCKED)</option>
            <option value="INTEGRITY_VERIFIED">INTEGRITY VERIFIED</option>
            <option value="INTEGRITY_FAILURE">INTEGRITY FAILURE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 text-white font-mono-tech text-xs focus:outline-none focus:border-white"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="INFO">INFO ONLY</option>
            <option value="WARNING">WARNING ONLY</option>
            <option value="CRITICAL">CRITICAL ONLY</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {auditLogs.length === 0 ? (
        <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md p-12 text-center font-mono-tech text-xs text-white/50">
          No security events recorded yet.
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md p-8 text-center font-mono-tech text-xs text-white/50">
          No audit logs matching current filter parameters.
        </div>
      ) : (
        <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left border-collapse" id="audit-log-table">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] font-mono-tech text-[10px] text-white/40 tracking-widest uppercase">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">EVENT ID</th>
                <th className="py-3 px-4">EVENT TYPE</th>
                <th className="py-3 px-4">ACTOR / IDENTITY</th>
                <th className="py-3 px-4">RESOURCE</th>
                <th className="py-3 px-4">RESULT</th>
                <th className="py-3 px-4">SEVERITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono-tech text-xs">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedEvent(log)}
                  className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-white/40">{log.id}</td>
                  <td className="py-3 px-4">
                    <span className="text-white font-medium">{log.eventType}</span>
                  </td>
                  <td className="py-3 px-4 text-white/80 truncate max-w-[160px]">
                    {log.userEmail}
                  </td>
                  <td className="py-3 px-4 text-white/70 truncate max-w-[180px]">
                    {log.resourceName}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(log.status, log.severity)}</td>
                  <td className="py-3 px-4 text-[11px]">{getSeverityPill(log.severity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#0a0a0c] border border-white/20 p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-white/70" />
                <span className="font-mono-tech text-xs text-white font-bold uppercase">
                  AUDIT EVENT INSPECTION // {selectedEvent.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-white/60 hover:text-white font-mono-tech text-xs"
              >
                [ CLOSE ]
              </button>
            </div>

            <div className="space-y-3 font-mono-tech text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-white/40">TIMESTAMP:</span>{' '}
                  <span className="text-white">{new Date(selectedEvent.timestamp).toISOString()}</span>
                </div>
                <div>
                  <span className="text-white/40">EVENT TYPE:</span>{' '}
                  <span className="text-white font-semibold">{selectedEvent.eventType}</span>
                </div>
                <div>
                  <span className="text-white/40">ACTOR:</span>{' '}
                  <span className="text-white">{selectedEvent.userEmail}</span>
                </div>
                <div>
                  <span className="text-white/40">RESOURCE:</span>{' '}
                  <span className="text-white">{selectedEvent.resourceName}</span>
                </div>
                <div>
                  <span className="text-white/40">RESULT STATUS:</span>{' '}
                  <span className="text-white">{selectedEvent.status}</span>
                </div>
                <div>
                  <span className="text-white/40">SEVERITY:</span>{' '}
                  <span className="text-white">{selectedEvent.severity}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="text-[10px] text-white/40 uppercase mb-1">DETAILED AUDIT PAYLOAD:</div>
                <div className="p-3 bg-black border border-white/10 text-white/80 leading-relaxed text-[11px]">
                  {selectedEvent.details}
                </div>
              </div>

              {selectedEvent.ipAddress && (
                <div className="text-[11px] text-white/50">
                  Origin IP: <span className="text-white/80">{selectedEvent.ipAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
