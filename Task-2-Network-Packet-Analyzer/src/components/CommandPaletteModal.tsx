import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  ShieldAlert, 
  Radio, 
  Bot, 
  FileText, 
  Lock, 
  CheckCircle2, 
  Play, 
  X, 
  ArrowRight,
  Fingerprint,
  Activity,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Packet, ThreatAlert, Incident, EvidenceItem, DetectionRule } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onStartLiveCapture?: () => void;
  onStopCapture?: () => void;
  onOpenCopilot?: () => void;
  onSelectPacket?: (pkt: Packet) => void;
  packets: Packet[];
  alerts: ThreatAlert[];
  incidents: Incident[];
  evidence: EvidenceItem[];
  rules: DetectionRule[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onStartLiveCapture,
  onStopCapture,
  onOpenCopilot,
  onSelectPacket,
  packets,
  alerts,
  incidents,
  evidence,
  rules
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Quick navigation commands
  const navigationCommands = [
    { id: 'nav-dashboard', label: 'Go to 01 OVERVIEW & RADAR', tab: 'dashboard', icon: Activity },
    { id: 'nav-capture', label: 'Go to 02 LIVE CAPTURE', tab: 'capture', icon: Radio },
    { id: 'nav-forensics', label: 'Go to 03 PACKET FORENSICS', tab: 'analysis', icon: Search },
    { id: 'nav-alerts', label: 'Go to 04 THREAT RADAR', tab: 'alerts', icon: ShieldAlert },
    { id: 'nav-analytics', label: 'Go to 05 NETWORK ANALYTICS', tab: 'statistics', icon: Sliders },
    { id: 'nav-incidents', label: 'Go to 06 INCIDENTS & AGENTS', tab: 'incidents', icon: Bot },
    { id: 'nav-reports', label: 'Go to 07 REPORTS & VAULT', tab: 'reports', icon: FileText },
    { id: 'nav-settings', label: 'Go to 08 SETTINGS & SECURITY', tab: 'settings', icon: Lock },
  ].filter(c => !q || c.label.toLowerCase().includes(q));

  // Quick execution actions
  const quickActions = [
    {
      id: 'act-copilot',
      label: 'Open Sovereign Security Copilot',
      action: () => { onClose(); onOpenCopilot?.(); },
      icon: Sparkles
    },
    {
      id: 'act-start-cap',
      label: 'Start Live Hardware Capture',
      action: () => { onClose(); onStartLiveCapture?.(); onSelectTab('capture'); },
      icon: Play
    },
    {
      id: 'act-stop-cap',
      label: 'Stop Live Capture Engine',
      action: () => { onClose(); onStopCapture?.(); },
      icon: X
    },
    {
      id: 'act-incidents',
      label: 'Inspect Active Incident Workspace',
      action: () => { onClose(); onSelectTab('incidents'); },
      icon: Bot
    }
  ].filter(a => !q || a.label.toLowerCase().includes(q));

  // Matching entity results
  const matchedPackets = q ? packets.filter(p => 
    p.sourceIp?.toLowerCase().includes(q) ||
    p.destinationIp?.toLowerCase().includes(q) ||
    p.protocol?.toLowerCase().includes(q) ||
    p.info?.toLowerCase().includes(q) ||
    String(p.no || p.id) === q ||
    String(p.destinationPort) === q
  ).slice(0, 5) : [];

  const matchedIncidents = q ? incidents.filter(i =>
    i.id.toLowerCase().includes(q) ||
    i.title.toLowerCase().includes(q) ||
    i.sourceHost.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedAlerts = q ? alerts.filter(a =>
    a.id.toLowerCase().includes(q) ||
    a.alertType.toLowerCase().includes(q) ||
    a.sourceIp.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedEvidence = q ? evidence.filter(e =>
    e.id.toLowerCase().includes(q) ||
    e.source.toLowerCase().includes(q) ||
    e.contentHash.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0b0d10] border border-white/20 rounded-2xl shadow-2xl overflow-hidden font-ui text-[#f4f4f2]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.03]">
          <Search className="w-5 h-5 text-white/50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search IP, packet #, incident, or evidence hash..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            className="flex-1 bg-transparent border-none text-white text-sm placeholder:text-white/30 focus:outline-none font-ui"
          />
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/40">
            <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15">ESC</span>
            <span>to close</span>
          </div>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 font-mono text-xs">
          
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="space-y-1">
              <span 
                className="text-[10px] uppercase text-white/40 px-2 font-bold font-display tracking-wider"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                Workstation Actions
              </span>
              {quickActions.map(act => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={act.action}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-white/70" />
                      <span className="font-medium">{act.label}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/30" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation Commands */}
          {navigationCommands.length > 0 && (
            <div className="space-y-1">
              <span 
                className="text-[10px] uppercase text-white/40 px-2 font-bold font-display tracking-wider"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                Navigate Workstation
              </span>
              {navigationCommands.map(cmd => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      onSelectTab(cmd.tab);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-white/50" />
                      <span 
                        className="font-display font-semibold text-xs tracking-wide"
                        style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                      >
                        {cmd.label}
                      </span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/30" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Matched Packets */}
          {matchedPackets.length > 0 && (
            <div className="space-y-1">
              <span 
                className="text-[10px] uppercase text-white/40 px-2 font-bold font-display tracking-wider"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                Matching Packets ({matchedPackets.length})
              </span>
              {matchedPackets.map(pkt => (
                <button
                  key={pkt.no || pkt.id}
                  onClick={() => {
                    if (onSelectPacket) onSelectPacket(pkt);
                    onSelectTab('analysis');
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-white">#{pkt.no || pkt.id} {pkt.protocol}</span>
                    <span className="text-white/50 text-[11px] ml-2">{pkt.sourceIp}:{pkt.sourcePort} → {pkt.destinationIp}:{pkt.destinationPort}</span>
                  </div>
                  <span className="text-[10px] text-white/40">{pkt.timestamp}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Incidents */}
          {matchedIncidents.length > 0 && (
            <div className="space-y-1">
              <span 
                className="text-[10px] uppercase text-white/40 px-2 font-bold font-display tracking-wider"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                Matching Incidents ({matchedIncidents.length})
              </span>
              {matchedIncidents.map(inc => (
                <button
                  key={inc.id}
                  onClick={() => {
                    onSelectTab('incidents');
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/10 text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-[#EF4444]">{inc.id}</span>
                    <span className="text-white text-xs ml-2 font-ui">{inc.title}</span>
                  </div>
                  <span className="text-[10px] text-white/50 uppercase">{inc.status}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Evidence Vault Items */}
          {matchedEvidence.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-white/40 px-2 flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-[#10B981]" />
                Cryptographic Evidence ({matchedEvidence.length})
              </span>
              {matchedEvidence.map(ev => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] text-white flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#10B981]">{ev.id}</span>
                    <span className="text-white/60 text-[11px] ml-2">{ev.source}</span>
                    <p className="text-[10px] text-white/40 truncate max-w-sm">SHA-256: {ev.contentHash}</p>
                  </div>
                  <span className="text-[10px] text-white/40">{ev.timestamp}</span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
