import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  XCircle,
  CheckCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { AuditEvent } from '../types';

interface SecurityEventsViewProps {
  events: AuditEvent[];
  onRefresh: () => void;
}

export const SecurityEventsView: React.FC<SecurityEventsViewProps> = ({ events, onRefresh }) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'WARNING' | 'CRITICAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || e.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-400/80 font-mono-tech text-[10px] tracking-widest uppercase">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            SECURITY INCIDENT DETECTION & ACCESS VIOLATIONS
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-1">
            Security Incidents & Warnings
          </h1>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono-tech text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH INCIDENTS</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident details, blocked actors, or targeted resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 text-white font-mono-tech text-xs focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="sm:col-span-4 flex gap-1 border border-white/15 p-1 bg-[#08080a]/75 backdrop-blur-md">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`flex-1 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider transition-colors ${
              filterSeverity === 'ALL' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            ALL ({events.length})
          </button>
          <button
            onClick={() => setFilterSeverity('WARNING')}
            className={`flex-1 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider transition-colors ${
              filterSeverity === 'WARNING' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            WARNINGS
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`flex-1 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider transition-colors ${
              filterSeverity === 'CRITICAL' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            CRITICAL
          </button>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="border border-emerald-500/20 bg-emerald-950/10 p-12 text-center space-y-3">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
          <div className="font-mono-tech text-sm font-semibold tracking-wider text-white uppercase">
            ZERO ACTIVE SECURITY VIOLATIONS
          </div>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            All file access requests, cryptographic signatures, and authentication sessions are passing authorization checks cleanly.
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="border border-white/10 bg-[#0a0a0c] p-8 text-center font-mono-tech text-xs text-white/50">
          No security events matching current filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((evt) => {
            const isCritical = evt.severity === 'CRITICAL';
            return (
              <div
                key={evt.id}
                className={`p-4 border ${
                  isCritical
                    ? 'border-red-500/40 bg-red-950/20'
                    : 'border-amber-500/40 bg-amber-950/20'
                } space-y-3 font-mono-tech text-xs`}
                style={{ borderRadius: '6px' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="font-bold text-white uppercase tracking-wider">
                      {evt.eventType} // {evt.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 border ${
                        isCritical
                          ? 'border-red-500/50 bg-red-500/20 text-red-300'
                          : 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/50">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-white/40">ACTOR:</span>{' '}
                    <span className="text-white font-medium">{evt.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-white/40">TARGET RESOURCE:</span>{' '}
                    <span className="text-white font-medium">{evt.resourceName}</span>
                  </div>
                  <div>
                    <span className="text-white/40">RESULT:</span>{' '}
                    <span className={isCritical ? 'text-red-400 font-bold' : 'text-amber-400'}>
                      {evt.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/60 border border-white/10 text-white/80 leading-relaxed text-[11px]">
                  {evt.details}
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                  <span>ENFORCEMENT: ZERO-TRUST SERVER-SIDE RBAC GATE</span>
                  <span>IMMUTABLE AUDIT LOG GENERATED</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
