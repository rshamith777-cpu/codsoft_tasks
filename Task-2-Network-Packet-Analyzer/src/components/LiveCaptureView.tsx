import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Search, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Download,
  Radio,
  FileText
} from 'lucide-react';
import { Packet, DnsLookupResult, CaptureMode } from '../types';
import { PageHeader } from './common/PageHeader';
import { StatusBadge } from './common/StatusBadge';

interface LiveCaptureViewProps {
  packets: Packet[];
  isCapturing: boolean;
  isPaused: boolean;
  captureMode: CaptureMode;
  onStart: () => void;
  onStartDemo: () => void;
  onLoadDemoDataset: () => void;
  onPause: () => void;
  onStop: () => void;
  onClear: () => void;
  selectedPacket: Packet | null;
  onSelectPacket: (p: Packet) => void;
  protocolFilter: string;
  setProtocolFilter: (p: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  onAnalyzeWithAI: (packet: Packet) => void;
  onExportPackets: (format: 'csv' | 'json' | 'txt') => void;
}

export const LiveCaptureView: React.FC<LiveCaptureViewProps> = ({
  packets,
  isCapturing,
  isPaused,
  captureMode,
  onStart,
  onStartDemo,
  onLoadDemoDataset,
  onPause,
  onStop,
  onClear,
  selectedPacket,
  onSelectPacket,
  protocolFilter,
  setProtocolFilter,
  searchQuery,
  setSearchQuery,
  onAnalyzeWithAI,
  onExportPackets
}) => {
  const [activeInspectorTab, setActiveInspectorTab] = useState<'details' | 'hex' | 'tree' | 'dns'>('details');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    frame: true,
    eth: true,
    ip: true,
    transport: true,
  });

  // Real-Time DNS Probe State
  const [probeDomain, setProbeDomain] = useState<string>('cloudflare.com');
  const [dnsResult, setDnsResult] = useState<DnsLookupResult | null>(null);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeError, setProbeError] = useState<string | null>(null);

  const toggleNode = (node: string) => {
    setExpandedNodes(prev => ({ ...prev, [node]: !prev[node] }));
  };

  const handlePerformRealTimeLookup = async () => {
    if (!probeDomain.trim()) return;
    setIsProbing(true);
    setProbeError(null);

    try {
      const res = await fetch('/api/network/dns-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: probeDomain.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProbeError(data.error || 'DNS Lookup failed');
        setDnsResult(null);
      } else {
        setDnsResult(data);
        setActiveInspectorTab('dns');
      }
    } catch (err: any) {
      setProbeError(err.message || 'Connection error to DNS resolver');
    } finally {
      setIsProbing(false);
    }
  };

  // Filter packets with syntax-aware querying
  const filteredPackets = packets.filter(p => {
    const matchesProtocol = protocolFilter === 'ALL' || p.protocol.toUpperCase() === protocolFilter.toUpperCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesProtocol;

    // Syntax-Aware Filters
    if (q.startsWith('src:')) {
      const val = q.slice(4).trim();
      return matchesProtocol && p.sourceIp.toLowerCase().includes(val);
    }
    if (q.startsWith('dst:')) {
      const val = q.slice(4).trim();
      return matchesProtocol && p.destinationIp.toLowerCase().includes(val);
    }
    if (q.startsWith('ip:')) {
      const val = q.slice(3).trim();
      return matchesProtocol && (p.sourceIp.toLowerCase().includes(val) || p.destinationIp.toLowerCase().includes(val));
    }
    if (q.startsWith('port:')) {
      const val = q.slice(5).trim();
      return matchesProtocol && (p.sourcePort.toString() === val || p.destinationPort.toString() === val);
    }
    if (q.startsWith('protocol:')) {
      const val = q.slice(9).trim();
      return p.protocol.toLowerCase().includes(val);
    }
    if (q.startsWith('tcp.flags:') || q.startsWith('flags:')) {
      const val = (q.startsWith('tcp.flags:') ? q.slice(10) : q.slice(6)).trim();
      return matchesProtocol && (p.flags || '').toLowerCase().includes(val);
    }
    if (q.startsWith('dns:')) {
      const val = q.slice(4).trim();
      return matchesProtocol && (p.protocol.toUpperCase() === 'DNS' || (p.info || '').toLowerCase().includes('dns')) && (p.info || '').toLowerCase().includes(val);
    }
    if (q.startsWith('http:') || q.startsWith('tls:')) {
      const prefix = q.startsWith('http:') ? 'http:' : 'tls:';
      const val = q.slice(prefix.length).trim();
      return matchesProtocol && (p.info || '').toLowerCase().includes(val);
    }
    if (q.startsWith('alert:')) {
      const val = q.slice(6).trim();
      return matchesProtocol && (p.threatType || '').toLowerCase().includes(val);
    }

    // Default multi-field search
    const matchesSearch = 
      p.sourceIp.toLowerCase().includes(q) ||
      p.destinationIp.toLowerCase().includes(q) ||
      p.protocol.toLowerCase().includes(q) ||
      p.info.toLowerCase().includes(q) ||
      p.sourcePort.toString().includes(q) ||
      p.destinationPort.toString().includes(q);
    return matchesProtocol && matchesSearch;
  });

  const getProtocolBadgeClass = (proto: string) => {
    switch (proto.toUpperCase()) {
      case 'TCP': return 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30';
      case 'UDP': return 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30';
      case 'ICMP': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30';
      case 'DNS': return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30';
      case 'HTTP':
      case 'HTTPS': return 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const protocols = ['ALL', 'TCP', 'UDP', 'ICMP', 'ARP', 'DNS', 'HTTP', 'HTTPS'];

  return (
    <div className="space-y-5 pb-12 max-w-7xl mx-auto font-ui">
      
      {/* 02 / Page Title Header */}
      <PageHeader
        number="02"
        category="LIVE PACKET STREAM"
        title="LIVE CAPTURE"
        description="Monitor, filter, and inspect incoming network frames in real-time with full OSI layer dissection."
        captureMode={captureMode}
        isCapturing={isCapturing}
      >
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => onExportPackets('csv')}
            disabled={packets.length === 0}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md disabled:opacity-40"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => onExportPackets('json')}
            disabled={packets.length === 0}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md disabled:opacity-40"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </PageHeader>

      {/* CONTROLS BAR & PROTOCOL FILTERS */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Stream Controls: START / PAUSE / STOP / CLEAR */}
        <div className="flex items-center gap-2 font-mono">
          <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-full border border-white/10 backdrop-blur-md">
            {!isCapturing ? (
              <>
                <button
                  onClick={onStart}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm font-display"
                  style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>START LIVE</span>
                </button>
                <button
                  onClick={onStartDemo}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full transition-all cursor-pointer border border-white/10 font-display"
                  style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                  title="Replay deterministic demo stream"
                >
                  <Radio className="w-3 h-3 text-[#F59E0B]" />
                  <span>DEMO</span>
                </button>
              </>
            ) : isPaused ? (
              <button
                onClick={onStart}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>RESUME</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full transition-all cursor-pointer border border-white/10 font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                <Pause className="w-3 h-3 fill-current text-white" />
                <span>PAUSE</span>
              </button>
            )}

            {isCapturing && (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 text-xs font-semibold rounded-full transition-all cursor-pointer font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                <Square className="w-3 h-3 fill-current" />
                <span>STOP</span>
              </button>
            )}

            <button
              onClick={onClear}
              disabled={packets.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white/50 hover:text-white text-xs font-semibold rounded-full transition-all cursor-pointer disabled:opacity-30 font-display"
              style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              title="Clear buffer"
            >
              <Trash2 className="w-3 h-3" />
              <span>CLEAR</span>
            </button>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="w-full lg:w-80 relative font-mono text-xs">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search IP, port, protocol, info..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.05] text-white placeholder-white/40 text-xs rounded-full pl-9 pr-8 py-2 border border-white/10 focus:outline-none focus:border-white/30 transition-all font-mono backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* PROTOCOL FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2 font-mono">
        <span 
          className="text-[11px] text-white/50 uppercase tracking-wider mr-1 font-bold font-display"
          style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
        >
          Filter:
        </span>
        {protocols.map((proto) => {
          const isSelected = protocolFilter === proto;
          return (
            <button
              key={proto}
              onClick={() => setProtocolFilter(proto)}
              className={`px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer font-display ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-white/[0.05] text-white/60 hover:text-white border border-white/10 backdrop-blur-md'
              }`}
              style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
            >
              {proto}
            </button>
          );
        })}
      </div>

      {/* MAIN PACKET STREAM TABLE */}
      <div className="sovereign-panel overflow-hidden">
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs font-mono select-none">
            <thead className="sticky top-0 bg-black/70 backdrop-blur-xl border-b border-white/[0.08] z-10 text-white/50 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3 font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>#</th>
                <th className="py-2.5 px-3 font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>Time</th>
                <th className="py-2.5 px-3 font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>Source IP</th>
                <th className="py-2.5 px-3 font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>Destination IP</th>
                <th className="py-2.5 px-3 font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>Protocol</th>
                <th className="py-2.5 px-3 font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>Port</th>
                <th className="py-2.5 px-3 font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>Length</th>
                <th className="py-2.5 px-3 font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>Info / Flag</th>
                <th className="py-2.5 px-3 text-right font-display" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {packets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    <div className="space-y-2">
                      <p className="text-white/70 text-sm font-semibold">No Capture Stream Active</p>
                      <p className="text-xs text-white/40">Click "Start Live" to capture interface frames or "Demo" to replay the demo dataset.</p>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <button
                          onClick={onStart}
                          className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 cursor-pointer"
                        >
                          Start Live
                        </button>
                        <button
                          onClick={onLoadDemoDataset}
                          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 cursor-pointer"
                        >
                          Load Demo Dataset
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredPackets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-white/40">
                    No frames match the active filter or search criteria
                  </td>
                </tr>
              ) : (
                filteredPackets.map((pkt) => {
                  const isSelected = selectedPacket?.id === pkt.id;
                  return (
                    <tr
                      key={pkt.id}
                      onClick={() => onSelectPacket(pkt)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-white/10 text-white border-l-2 border-white'
                          : 'hover:bg-white/[0.05] text-white/80'
                      }`}
                    >
                      <td className="py-2 px-3 text-white/40">{pkt.id}</td>
                      <td className="py-2 px-3 text-white/60">{pkt.timestamp}</td>
                      <td className="py-2 px-3 text-white font-medium">{pkt.sourceIp}</td>
                      <td className="py-2 px-3 text-white font-medium">{pkt.destinationIp}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getProtocolBadgeClass(pkt.protocol)}`}>
                          {pkt.protocol}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-white/60">
                        {pkt.sourcePort} → {pkt.destinationPort}
                      </td>
                      <td className="py-2 px-3 text-white/60">{pkt.length} B</td>
                      <td className="py-2 px-3 text-white/70 max-w-xs truncate">{pkt.info}</td>
                      <td className="py-2 px-3 text-right">
                        {pkt.isSuspicious ? (
                          <StatusBadge status="HIGH" label="THREAT" />
                        ) : (
                          <StatusBadge status="READY" label="NORMAL" />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED PACKET DISSECTION INSPECTOR */}
      {selectedPacket ? (
        <div className="sovereign-panel p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-xs font-semibold text-white tracking-wider uppercase font-mono flex items-center gap-2">
                <span>Packet #{selectedPacket.id} Dissection</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] ${getProtocolBadgeClass(selectedPacket.protocol)}`}>
                  {selectedPacket.protocol}
                </span>
                {selectedPacket.isSuspicious && (
                  <span className="px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[10px]">
                    ANOMALY DETECTED
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-white/50 font-mono mt-0.5">
                Timestamp: {selectedPacket.timestamp} • Length: {selectedPacket.length} bytes • TTL: {selectedPacket.ttl || 64}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-full border border-white/10 font-mono text-xs backdrop-blur-md">
                <button
                  onClick={() => setActiveInspectorTab('details')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeInspectorTab === 'details' ? 'bg-white text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveInspectorTab('tree')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeInspectorTab === 'tree' ? 'bg-white text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
                  }`}
                >
                  OSI Tree
                </button>
                <button
                  onClick={() => setActiveInspectorTab('hex')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeInspectorTab === 'hex' ? 'bg-white text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Hex Dump
                </button>
                <button
                  onClick={() => setActiveInspectorTab('dns')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    activeInspectorTab === 'dns' ? 'bg-white text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
                  }`}
                >
                  DNS Probe
                </button>
              </div>

              <button
                onClick={() => onAnalyzeWithAI(selectedPacket)}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer font-mono backdrop-blur-md"
                title="Investigate with Security Copilot"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>
            </div>
          </div>

          {/* TAB 1: SUMMARY DETAILS */}
          {activeInspectorTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-white/40 uppercase">Layer 2 (Ethernet)</span>
                <p className="text-white font-medium truncate">Src: {selectedPacket.macSource || 'fa:16:3e:89:12:a4'}</p>
                <p className="text-white font-medium truncate">Dst: {selectedPacket.macDest || 'ff:ff:ff:ff:ff:ff'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-white/40 uppercase">Layer 3 (IP)</span>
                <p className="text-white font-medium">Source: {selectedPacket.sourceIp}</p>
                <p className="text-white font-medium">Dest: {selectedPacket.destinationIp}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-white/40 uppercase">Layer 4 (Transport)</span>
                <p className="text-white font-medium">Port: {selectedPacket.sourcePort} → {selectedPacket.destinationPort}</p>
                <p className="text-white/60">Flags: {selectedPacket.flags || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-white/40 uppercase">Layer 7 (Application)</span>
                <p className="text-white font-medium">{selectedPacket.protocol}</p>
                <p className="text-white/60 truncate">{selectedPacket.info}</p>
              </div>
            </div>
          )}

          {/* TAB 2: OSI DISSECTION TREE */}
          {activeInspectorTab === 'tree' && (
            <div className="space-y-2 text-xs font-mono">
              {/* Frame */}
              <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleNode('frame')}
                  className="w-full px-3.5 py-2 bg-white/[0.03] flex items-center justify-between text-left hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    {expandedNodes.frame ? <ChevronDown className="w-3.5 h-3.5 text-white/50" /> : <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
                    Frame #{selectedPacket.id}: {selectedPacket.length} bytes on interface eth0
                  </span>
                  <span className="text-[10px] text-white/40">Physical Layer</span>
                </button>
                {expandedNodes.frame && (
                  <div className="p-3 bg-black/40 text-[11px] text-white/70 space-y-1 border-t border-white/[0.04]">
                    <p>• Arrival Time: {selectedPacket.timestamp}</p>
                    <p>• Frame Number: {selectedPacket.id}</p>
                    <p>• Frame Length: {selectedPacket.length} bytes ({selectedPacket.length * 8} bits)</p>
                    <p>• Capture Length: {selectedPacket.length} bytes</p>
                  </div>
                )}
              </div>

              {/* Ethernet */}
              <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleNode('eth')}
                  className="w-full px-3.5 py-2 bg-white/[0.03] flex items-center justify-between text-left hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    {expandedNodes.eth ? <ChevronDown className="w-3.5 h-3.5 text-white/50" /> : <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
                    Ethernet II, Src: {selectedPacket.macSource || '00:1a:2b:3c:4d:5e'}, Dst: {selectedPacket.macDest || 'fa:16:3e:89:12:a4'}
                  </span>
                  <span className="text-[10px] text-white/40">Data Link Layer</span>
                </button>
                {expandedNodes.eth && (
                  <div className="p-3 bg-black/40 text-[11px] text-white/70 space-y-1 border-t border-white/[0.04]">
                    <p>• Destination MAC: {selectedPacket.macDest || 'fa:16:3e:89:12:a4'}</p>
                    <p>• Source MAC: {selectedPacket.macSource || '00:1a:2b:3c:4d:5e'}</p>
                    <p>• Type: IPv4 (0x0800)</p>
                  </div>
                )}
              </div>

              {/* IP */}
              <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleNode('ip')}
                  className="w-full px-3.5 py-2 bg-white/[0.03] flex items-center justify-between text-left hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    {expandedNodes.ip ? <ChevronDown className="w-3.5 h-3.5 text-white/50" /> : <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
                    Internet Protocol Version 4, Src: {selectedPacket.sourceIp}, Dst: {selectedPacket.destinationIp}
                  </span>
                  <span className="text-[10px] text-white/40">Network Layer</span>
                </button>
                {expandedNodes.ip && (
                  <div className="p-3 bg-black/40 text-[11px] text-white/70 space-y-1 border-t border-white/[0.04]">
                    <p>• Version: 4</p>
                    <p>• Header Length: 20 bytes (5)</p>
                    <p>• Time to Live: {selectedPacket.ttl || 64}</p>
                    <p>• Protocol: {selectedPacket.protocol}</p>
                    <p>• Source Address: {selectedPacket.sourceIp}</p>
                    <p>• Destination Address: {selectedPacket.destinationIp}</p>
                  </div>
                )}
              </div>

              {/* Transport */}
              <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleNode('transport')}
                  className="w-full px-3.5 py-2 bg-white/[0.03] flex items-center justify-between text-left hover:bg-white/[0.05] cursor-pointer"
                >
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    {expandedNodes.transport ? <ChevronDown className="w-3.5 h-3.5 text-white/50" /> : <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
                    {selectedPacket.protocol} Protocol, Src Port: {selectedPacket.sourcePort}, Dst Port: {selectedPacket.destinationPort}
                  </span>
                  <span className="text-[10px] text-white/40">Transport Layer</span>
                </button>
                {expandedNodes.transport && (
                  <div className="p-3 bg-black/40 text-[11px] text-white/70 space-y-1 border-t border-white/[0.04]">
                    <p>• Source Port: {selectedPacket.sourcePort}</p>
                    <p>• Destination Port: {selectedPacket.destinationPort}</p>
                    <p>• Flags: {selectedPacket.flags || 'None'}</p>
                    <p>• Payload Length: {Math.max(selectedPacket.length - 40, 0)} bytes</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HEX DUMP VIEWER */}
          {activeInspectorTab === 'hex' && (
            <div className="p-4 rounded-xl bg-black/80 border border-white/[0.08] font-mono text-xs text-white/80 overflow-x-auto leading-relaxed">
              <pre className="text-[11px] leading-5 text-white/90">
                {selectedPacket.hexDump || selectedPacket.payloadHex || `0000   45 00 00 3c 1a 2b 40 00  40 06 4a 2c c0 a8 01 0a   E..<.@.@.J,.....\n0010   08 08 08 08 d4 31 00 35  00 36 12 34 2b 4f 01 00   .....1.5.6.4+O..`}
              </pre>
            </div>
          )}

          {/* TAB 4: LIVE DNS RESOLVER PROBE */}
          {activeInspectorTab === 'dns' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter hostname to probe (e.g. google.com)..."
                  value={probeDomain}
                  onChange={(e) => setProbeDomain(e.target.value)}
                  className="flex-1 bg-white/[0.05] text-white px-3.5 py-2 rounded-full border border-white/10 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handlePerformRealTimeLookup}
                  disabled={isProbing}
                  className="px-4 py-2 bg-white text-black font-semibold rounded-full hover:bg-white/90 cursor-pointer disabled:opacity-50"
                >
                  {isProbing ? 'Querying...' : 'Resolve DNS'}
                </button>
              </div>

              {probeError && (
                <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-xs">
                  {probeError}
                </div>
              )}

              {dnsResult && (
                <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="font-semibold text-white">{dnsResult.domain}</span>
                    <span className="text-[#10B981] font-semibold">{dnsResult.latencyMs} ms Latency</span>
                  </div>
                  <div className="space-y-1 text-white/70 text-[11px]">
                    <p>• Resolved IPv4 (A Records): <span className="text-white font-medium">{dnsResult.addresses?.join(', ')}</span></p>
                    <p>• Resolver Provider: {dnsResult.provider || 'System Resolver'}</p>
                    <p>• Query Timestamp: {dnsResult.resolvedAt}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

    </div>
  );
};
