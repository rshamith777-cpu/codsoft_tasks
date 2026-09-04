import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check,
  Play,
  FileText,
  Bot,
  ShieldAlert,
  ChevronDown,
  Search,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Packet, CaptureMode } from '../types';
import { PageHeader } from './common/PageHeader';
import { StatusBadge } from './common/StatusBadge';

interface PacketAnalysisViewProps {
  packet: Packet | null;
  packets: Packet[];
  captureMode?: CaptureMode;
  onSelectPacket: (p: Packet) => void;
  onAnalyzeWithAI: (p: Packet) => void;
  onStartLive?: () => void;
  onLoadDemoDataset?: () => void;
  onSendToInvestigation?: (p: Packet) => void;
  onCreateIncidentFromPacket?: (p: Packet) => void;
  onPreserveEvidence?: (p: Packet) => void;
}

export const PacketAnalysisView: React.FC<PacketAnalysisViewProps> = ({
  packet,
  packets,
  captureMode = 'IDLE',
  onSelectPacket,
  onAnalyzeWithAI,
  onStartLive,
  onLoadDemoDataset,
  onSendToInvestigation,
  onCreateIncidentFromPacket,
  onPreserveEvidence
}) => {
  const [copied, setCopied] = useState(false);
  const [evidencePreserved, setEvidencePreserved] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [protocolAnalysis, setProtocolAnalysis] = useState<{
    whatHappened: string;
    whyItMatters: string;
    evidence: string[];
    securityRelevance: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentPacket = packet || (packets.length > 0 ? packets[0] : null);

  const handleRunProtocolAgent = async () => {
    if (!currentPacket) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/agent/protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packet: currentPacket })
      });
      const data = await res.json();
      setProtocolAnalysis(data);
    } catch (e) {
      console.error('Protocol agent failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyHex = () => {
    if (currentPacket) {
      navigator.clipboard.writeText(currentPacket.payloadHex || currentPacket.hexDump || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreserve = () => {
    if (currentPacket && onPreserveEvidence) {
      onPreserveEvidence(currentPacket);
      setEvidencePreserved(true);
      setTimeout(() => setEvidencePreserved(false), 3000);
    }
  };

  if (!currentPacket) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Packet Forensics & Dissection"
          subtitle="Deep packet inspection, OSI decapsulation, control flag analysis, and raw payload forensics."
        />
        <div className="sovereign-glass p-12 text-center rounded-2xl border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/40">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No Packet Selected for Forensics</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto font-mono">
              Start live hardware capture or replay a forensic PCAP session to inspect OSI layers and protocol fields.
            </p>
          </div>
          {onStartLive && (
            <div className="pt-2">
              <button
                onClick={onStartLive}
                className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs inline-flex items-center gap-2 hover:bg-white/90 transition-all cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live Hardware Capture</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const tcpFlags = [
    { name: 'SYN', active: !!currentPacket.tcpFlags?.syn || (currentPacket.flags || '').includes('SYN') },
    { name: 'ACK', active: !!currentPacket.tcpFlags?.ack || (currentPacket.flags || '').includes('ACK') },
    { name: 'PSH', active: !!currentPacket.tcpFlags?.psh || (currentPacket.flags || '').includes('PSH') },
    { name: 'FIN', active: !!currentPacket.tcpFlags?.fin || (currentPacket.flags || '').includes('FIN') },
    { name: 'RST', active: !!currentPacket.tcpFlags?.rst || (currentPacket.flags || '').includes('RST') },
    { name: 'URG', active: !!currentPacket.tcpFlags?.urg || (currentPacket.flags || '').includes('URG') },
  ];

  // Filtered packet stream for left column
  const filteredPackets = packets.filter(p => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      p.sourceIp?.toLowerCase().includes(q) ||
      p.destinationIp?.toLowerCase().includes(q) ||
      p.protocol?.toLowerCase().includes(q) ||
      String(p.no || p.id).includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Packet Forensics & Dissection"
        subtitle="Three-column deep OSI decapsulation, control flag analysis, and cryptographic evidence preservation."
      />

      {/* THREE COLUMN FORENSICS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUMN 1: Session / Packet Tree (3 cols) */}
        <div className="lg:col-span-3 sovereign-panel p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <span 
              className="text-white/70 font-bold uppercase text-[11px] font-display"
              style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
            >
              Stream Frames
            </span>
            <span className="text-[10px] text-white/40">{packets.length} Total</span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Filter frames..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-1.5 pr-1">
            {filteredPackets.slice(0, 50).map(p => {
              const isSelected = (p.no || p.id) === (currentPacket.no || currentPacket.id);
              const isSuspicious = p.isSuspicious;

              return (
                <div
                  key={p.no || p.id}
                  onClick={() => onSelectPacket(p)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-white/15 border-white/40 text-white shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/70 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">#{p.no || p.id} {p.protocol}</span>
                    {isSuspicious ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#EF4444]/20 text-[#EF4444] font-bold">ALT</span>
                    ) : (
                      <span className="text-[10px] text-white/30">{p.length}B</span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/50 truncate">
                    {p.sourceIp} → {p.destinationIp}:{p.destinationPort}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Packet Dissection & Hex (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Header Summary */}
          <div className="sovereign-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 
                  className="text-xs font-bold text-white uppercase tracking-wider font-display"
                  style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                >
                  Frame #{currentPacket.no || currentPacket.id} Dissection Record
                </h3>
                <p className="text-[11px] text-white/50 font-mono mt-0.5">Timestamp: {currentPacket.timestamp}</p>
              </div>
              <StatusBadge status={currentPacket.isSuspicious ? 'HIGH' : 'NORMAL'} label={currentPacket.isSuspicious ? 'FLAGGED ANOMALY' : 'CLEAN PROTOCOL'} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-white/40 uppercase">Protocol</span>
                <p className="text-sm font-semibold text-white mt-0.5">{currentPacket.protocol}</p>
              </div>
              <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-white/40 uppercase">Frame Size</span>
                <p className="text-sm font-semibold text-white mt-0.5">{currentPacket.length} B</p>
              </div>
              <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-white/40 uppercase">TTL</span>
                <p className="text-sm font-semibold text-white mt-0.5">{currentPacket.ttl || 64}</p>
              </div>
              <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-white/40 uppercase">Payload</span>
                <p className="text-sm font-semibold text-white mt-0.5">{Math.max(currentPacket.length - 40, 0)} B</p>
              </div>
            </div>

            {/* Endpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-white/40 uppercase">Source Endpoint</span>
                <p className="text-white font-medium">{currentPacket.sourceIp}:{currentPacket.sourcePort}</p>
                <p className="text-[10px] text-white/40 truncate">MAC: {currentPacket.macSource || '00:1a:2b:3c:4d:5e'}</p>
              </div>
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-white/40 uppercase">Destination Endpoint</span>
                <p className="text-white font-medium">{currentPacket.destinationIp}:{currentPacket.destinationPort}</p>
                <p className="text-[10px] text-white/40 truncate">MAC: {currentPacket.macDest || 'fa:16:3e:89:12:a4'}</p>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl font-mono text-xs space-y-1">
              <span className="text-[10px] text-white/40 uppercase">Protocol Summary Info</span>
              <p className="text-white break-all">{currentPacket.info}</p>
            </div>
          </div>

          {/* TCP Flags */}
          {currentPacket.protocol === 'TCP' && (
            <div className="sovereign-panel p-4 space-y-3 font-mono">
              <h4 
                className="text-[11px] font-bold text-white uppercase tracking-wider border-b border-white/[0.08] pb-2 font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                TCP Control Flags Decomposition
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {tcpFlags.map(flag => (
                  <div
                    key={flag.name}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      flag.active
                        ? 'bg-white text-black border-white font-bold shadow-sm'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/40'
                    }`}
                  >
                    <div className="text-xs font-semibold">{flag.name}</div>
                    <div className="text-[9px] mt-0.5">{flag.active ? '1 (SET)' : '0 (CLR)'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Payload & Hex Dump */}
          <div className="sovereign-panel p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span 
                className="text-white font-bold uppercase text-[11px] font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                Hex Memory View
              </span>
              <button
                onClick={handleCopyHex}
                className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 bg-black/60 border border-white/[0.06] rounded-xl max-h-48 overflow-y-auto font-mono text-[11px] text-white/80 space-y-1">
              <pre className="whitespace-pre-wrap leading-relaxed select-all">
                {currentPacket.hexDump || currentPacket.payloadHex || '0000  45 00 00 3c 1a 2b 40 00 40 06 b1 a2 c0 a8 01 6e  E..<.@.@......n\n0010  c0 a8 01 01 01 bb 00 50 00 00 00 00 00 00 00 00  .......P........'}
              </pre>
            </div>
          </div>

        </div>

        {/* COLUMN 3: Security Intelligence & Forensic Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-4 font-mono text-xs">
          
          {/* Forensic Actions Panel */}
          <div className="sovereign-panel p-5 space-y-3 font-ui">
            <h4 
              className="text-xs font-bold text-white uppercase tracking-wider font-display border-b border-white/[0.08] pb-2 flex items-center gap-1.5"
              style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
            >
              <ShieldAlert className="w-4 h-4 text-white/70" />
              <span>Forensic Response Actions</span>
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => onSendToInvestigation && onSendToInvestigation(currentPacket)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-between hover:bg-white/90 cursor-pointer shadow-sm font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                <span>Send to Incident Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onCreateIncidentFromPacket && onCreateIncidentFromPacket(currentPacket)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-white border border-white/10 font-semibold text-xs flex items-center justify-between cursor-pointer transition-colors font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                <span>Promote Frame to New Incident</span>
                <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
              </button>

              <button
                onClick={handlePreserve}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-white border border-white/10 font-semibold text-xs flex items-center justify-between cursor-pointer transition-colors font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                <span>{evidencePreserved ? 'Preserved in Cryptographic Vault!' : 'Export Evidence to Vault'}</span>
                <Fingerprint className={`w-3.5 h-3.5 ${evidencePreserved ? 'text-[#10B981]' : 'text-white/60'}`} />
              </button>
            </div>
          </div>

          {/* Protocol Analyst Agent */}
          <div className="sovereign-panel p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-white/70" />
                <span 
                  className="text-xs font-bold text-white uppercase font-display"
                  style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                >
                  Agent 03: Protocol Analyst
                </span>
              </div>
              <button
                onClick={handleRunProtocolAgent}
                disabled={isAnalyzing}
                className="px-2.5 py-1 rounded bg-white text-black text-[10px] font-bold uppercase hover:bg-white/90 disabled:opacity-50 cursor-pointer shadow-sm font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Agent'}
              </button>
            </div>

            {protocolAnalysis ? (
              <div className="space-y-2.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 uppercase block">What Happened</span>
                  <p className="text-white mt-0.5">{protocolAnalysis.whatHappened}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 uppercase block">Why It Matters</span>
                  <p className="text-white/80 mt-0.5">{protocolAnalysis.whyItMatters}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] text-white/40 uppercase block">Security Relevance</span>
                  <p className="text-[#EF4444] mt-0.5">{protocolAnalysis.securityRelevance}</p>
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-[11px] leading-relaxed">
                Execute Agent 03 to dissect underlying L2-L7 protocol semantics, verify handshake states, and map potential security implications.
              </p>
            )}
          </div>

          {/* Detections & Heuristics */}
          <div className="sovereign-panel p-5 space-y-3 font-mono">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-white/[0.08] pb-2">
              Correlated Heuristics & MITRE
            </h4>

            {currentPacket.alerts && currentPacket.alerts.length > 0 ? (
              <div className="space-y-2">
                {currentPacket.alerts.map((alt, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#EF4444] text-[11px]">{alt.type}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] uppercase font-bold">{alt.severity}</span>
                    </div>
                    <p className="text-white/80 text-[10px]">{alt.description}</p>
                    {alt.mitre && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white/70">
                        MITRE: {alt.mitre}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-white/30 space-y-1">
                <ShieldCheck className="w-6 h-6 mx-auto opacity-40 text-[#10B981]" />
                <p className="text-[11px]">Clean Frame: Zero threat signatures detected.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
