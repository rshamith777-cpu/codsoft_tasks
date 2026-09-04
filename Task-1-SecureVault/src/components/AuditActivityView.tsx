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
  Clock,
  History,
  Terminal,
} from 'lucide-react';
import { AuditEvent, AuditEventType, SeverityLevel } from '../types';
import { Button } from './ui/Button';
import { SeverityBadge } from './ui/Badges';
import { SearchInput, Select } from './ui/Input';
import { Drawer } from './ui/Drawer';

interface AuditActivityViewProps {
  auditLogs: AuditEvent[];
  onRefresh: () => void;
}

export const AuditActivityView: React.FC<AuditActivityViewProps> = ({ auditLogs = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const safeLogs = auditLogs ?? [];

  const filteredLogs = safeLogs.filter((log) => {
    if (!log) return false;
    const search = (searchTerm || '').toLowerCase();
    const userEmail = (log.userEmail || '').toLowerCase();
    const resourceName = (log.resourceName || '').toLowerCase();
    const eventType = (log.eventType || '').toLowerCase();
    const id = (log.id || '').toLowerCase();
    const details = (log.details || '').toLowerCase();

    const matchesSearch =
      userEmail.includes(search) ||
      resourceName.includes(search) ||
      eventType.includes(search) ||
      id.includes(search) ||
      details.includes(search);

    const matchesType = filterType === 'ALL' || log.eventType === filterType;
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;

    return matchesSearch && matchesType && matchesSeverity;
  });

  const getStatusBadge = (status: string, severity: SeverityLevel) => {
    if (status === 'DENIED' || status === 'FAILED' || severity === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-red-500/40 bg-red-500/10 text-red-300 font-mono-tech text-[9.5px] uppercase rounded-[2px]">
          <XCircle className="w-2.5 h-2.5 text-red-400" />
          {status}
        </span>
      );
    }
    if (status === 'WARNING' || severity === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono-tech text-[9.5px] uppercase rounded-[2px]">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono-tech text-[9.5px] uppercase rounded-[2px]">
        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
        {status}
      </span>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-start">
      <div className="w-full max-w-[1720px] mx-auto space-y-6 animate-hero-entrance">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
              <History className="w-3.5 h-3.5 text-white/70" />
              <span>06 FORENSIC AUDIT TRAIL &amp; IMMUTABILITY</span>
            </div>
            <h1 className="font-sans-main text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Audit Activity Timeline
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3 h-3" />}
              onClick={onRefresh}
            >
              Sync Audit Stream
            </Button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <SearchInput
              placeholder="Filter by actor email, resource, or event description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'ALL', label: 'ALL EVENT TYPES' },
                { value: 'LOGIN', label: 'LOGIN' },
                { value: 'UPLOAD', label: 'UPLOAD' },
                { value: 'ENCRYPT', label: 'ENCRYPT' },
                { value: 'DOWNLOAD', label: 'DOWNLOAD' },
                { value: 'SHARE', label: 'SHARE' },
                { value: 'REVOKE', label: 'REVOKE' },
                { value: 'FAILED_ACCESS', label: 'FAILED_ACCESS' },
                { value: 'INTEGRITY_VERIFIED', label: 'INTEGRITY_VERIFIED' },
                { value: 'SETTING_CHANGE', label: 'SETTING_CHANGE' },
              ]}
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'ALL SEVERITIES' },
                { value: 'INFO', label: 'INFO ONLY' },
                { value: 'WARNING', label: 'WARNING' },
                { value: 'CRITICAL', label: 'CRITICAL ONLY' },
              ]}
            />
          </div>
        </div>

        {/* Forensic Event Table */}
        <div className="glass-panel rounded-[3px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-tech text-xs sm:text-sm">
              <thead className="bg-white/[0.04] border-b border-white/10 text-xs tracking-[0.16em] uppercase text-white/50 select-none">
                <tr>
                  <th className="py-3.5 px-5">TIMESTAMP</th>
                  <th className="py-3.5 px-5">EVENT</th>
                  <th className="py-3.5 px-5">ACTOR</th>
                  <th className="py-3.5 px-5">RESOURCE</th>
                  <th className="py-3.5 px-5">STATUS</th>
                  <th className="py-3.5 px-5">SEVERITY</th>
                  <th className="py-3.5 px-5">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-white/40 text-sm">
                      [ ZERO AUDIT EVENTS RECORDED ]
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedEvent(log)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5 text-white/50 whitespace-nowrap text-xs">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-white font-semibold whitespace-nowrap text-sm">
                        {log.eventType}
                      </td>
                      <td className="py-3.5 px-5 text-white/70 truncate max-w-[170px] text-xs sm:text-sm">
                        {log.userEmail}
                      </td>
                      <td className="py-3.5 px-5 text-white/80 truncate max-w-[200px] text-xs sm:text-sm">
                        {log.resourceName}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getStatusBadge(log.status, log.severity)}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <SeverityBadge severity={log.severity} />
                      </td>
                      <td className="py-3.5 px-5 text-white/60 text-xs truncate max-w-[260px]">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Event Details Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.eventType || 'Audit Event'}
        eyebrow="IMMUTABLE AUDIT LOG ENTRY"
        subtitle={`Event ID: ${selectedEvent?.id}`}
        width="md"
      >
        {selectedEvent && (
          <div className="space-y-4 font-mono-tech text-xs">
            <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
              <div className="text-[9.5px] text-white/40 uppercase">TIMESTAMP</div>
              <div className="text-white font-semibold">
                {new Date(selectedEvent.timestamp).toISOString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-0.5">
                <div className="text-[9.5px] text-white/40 uppercase">STATUS</div>
                <div>{getStatusBadge(selectedEvent.status, selectedEvent.severity)}</div>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-0.5">
                <div className="text-[9.5px] text-white/40 uppercase">SEVERITY</div>
                <div><SeverityBadge severity={selectedEvent.severity} /></div>
              </div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
              <div className="text-[9.5px] text-white/40 uppercase">ACTOR</div>
              <div className="text-white">{selectedEvent.userEmail}</div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
              <div className="text-[9.5px] text-white/40 uppercase">RESOURCE</div>
              <div className="text-white">{selectedEvent.resourceName}</div>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
              <div className="text-[9.5px] text-white/40 uppercase">FULL FORENSIC DETAILS</div>
              <div className="text-white/80 font-sans-main text-xs leading-relaxed">
                {selectedEvent.details}
              </div>
            </div>

            {selectedEvent.ipAddress && (
              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
                <div className="text-[9.5px] text-white/40 uppercase">CLIENT IP ADDRESS</div>
                <div className="text-white font-mono">{selectedEvent.ipAddress}</div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
