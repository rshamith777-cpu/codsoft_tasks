import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Terminal, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  CornerDownLeft, 
  Sparkles,
  Info,
  CheckCircle2,
  Shield,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';
import { Packet, ThreatAlert, Incident, CopilotMessage } from '../types';

interface SecurityCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPacket?: Packet | null;
  selectedAlert?: ThreatAlert | null;
  selectedIncident?: Incident | null;
  allPackets: Packet[];
  allAlerts: ThreatAlert[];
}

export const SecurityCopilotModal: React.FC<SecurityCopilotModalProps> = ({
  isOpen,
  onClose,
  selectedPacket,
  selectedAlert,
  selectedIncident,
  allPackets,
  allAlerts
}) => {
  const contextId = selectedIncident 
    ? selectedIncident.id 
    : (selectedAlert 
      ? selectedAlert.id 
      : (selectedPacket ? `PACKET-#${selectedPacket.no || selectedPacket.id}` : 'GLOBAL TELEMETRY'));

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString(),
      content: `### OBSERVED
Ready for forensic query on ${contextId}. Telemetry telemetry stream is actively monitored.

### ANALYSIS
Defensive heuristics and Gemini 2.5 LLM adapters connected. Untrusted packet payloads are isolated as raw binary data.

### RISK
Nominal readiness. All recommendations require explicit human analyst approval before containment.

### RECOMMENDATION
Select an analyst action below or enter a specific technical query.`
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copilotStatus, setCopilotStatus] = useState<'ONLINE' | 'DETERMINISTIC_FALLBACK'>('ONLINE');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'EXPLAIN', query: selectedAlert ? `/explain alert` : (selectedPacket ? `/explain packet` : `/explain protocol`) },
    { label: 'INVESTIGATE', query: selectedIncident ? `/investigate incident` : `/summarize session` },
    { label: 'CORRELATE', query: `/explain mitre` },
    { label: 'SUMMARIZE', query: `/summarize session` },
    { label: 'RECOMMEND', query: `/recommend mitigation` }
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      content: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          context: {
            selectedPacket,
            selectedAlert,
            selectedIncident,
            allPackets: allPackets.slice(0, 30),
            allAlerts: allAlerts.slice(0, 15)
          }
        })
      });

      const data = await res.json();

      if (data.source === 'DETERMINISTIC_HEURISTIC') {
        setCopilotStatus('DETERMINISTIC_FALLBACK');
      } else {
        setCopilotStatus('ONLINE');
      }

      const agentMsg: CopilotMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString(),
        content: data.reply || 'Analysis completed.',
        command: data.commandUsed,
        citedIds: data.citedIds,
        untrustedPayloadWarning: data.untrustedPayloadWarning
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      setCopilotStatus('DETERMINISTIC_FALLBACK');
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'system',
          timestamp: new Date().toLocaleTimeString(),
          content: `### COPILOT OFFLINE\nSecurity Copilot cloud provider is unavailable. Deterministic rule engine is active for investigations.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render structured analyst sections
  const renderFormattedContent = (content: string) => {
    const sections: Array<{ title: string; body: string }> = [];
    const parts = content.split(/###\s+([A-Z\s&]+)/g);

    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i += 2) {
        sections.push({
          title: parts[i].trim(),
          body: (parts[i + 1] || '').trim()
        });
      }
    }

    if (sections.length === 0) {
      return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
    }

    return (
      <div className="space-y-3">
        {sections.map((sec, idx) => {
          let badgeColor = 'text-white/70 bg-white/5 border-white/10';
          let borderAccent = 'border-l-white/30';
          let Icon = Activity;

          if (sec.title.includes('OBSERVED')) {
            badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            borderAccent = 'border-l-cyan-400';
            Icon = Shield;
          } else if (sec.title.includes('ANALYSIS')) {
            badgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            borderAccent = 'border-l-blue-400';
            Icon = Cpu;
          } else if (sec.title.includes('RISK')) {
            badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            borderAccent = 'border-l-amber-400';
            Icon = AlertTriangle;
          } else if (sec.title.includes('RECOMMENDATION')) {
            badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            borderAccent = 'border-l-emerald-400';
            Icon = CheckCircle2;
          }

          return (
            <div key={idx} className={`p-3 rounded-lg bg-black/40 border border-white/[0.08] border-l-2 ${borderAccent}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-white/70" />
                <span className={`text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded border ${badgeColor}`}>
                  {sec.title}
                </span>
              </div>
              <div className="text-xs text-white/90 font-mono leading-relaxed whitespace-pre-wrap">
                {sec.body}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-2xl h-[92vh] bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-ui text-[#f4f4f2]"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 
                  className="text-sm font-bold tracking-wider text-white font-display"
                  style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                >
                  SECURITY COPILOT
                </h3>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-semibold ${
                  copilotStatus === 'ONLINE'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {copilotStatus === 'ONLINE' ? 'AI ACTIVE' : 'DETERMINISTIC ENGINE'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-white/50">
                CONTEXT: <span className="text-white font-semibold">{contextId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Analyst Actions Bar */}
        <div className="px-4 py-2 bg-black/40 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          <span 
            className="text-white/40 text-[10px] tracking-wider uppercase mr-1 font-display"
            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
          >
            Actions:
          </span>
          {quickActions.map(act => (
            <button
              key={act.label}
              onClick={() => handleSend(act.query)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/80 hover:text-white transition-all text-[11px] font-bold cursor-pointer shrink-0 font-display"
              style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
            >
              {act.label}
            </button>
          ))}
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-white/40 font-mono">
                  <span>{isUser ? 'ANALYST' : 'COPILOT'}</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`max-w-[92%] p-3.5 rounded-xl border ${
                    isUser
                      ? 'bg-white/15 text-white border-white/20'
                      : 'bg-white/[0.04] text-white/90 border-white/[0.08]'
                  }`}
                >
                  {isUser ? (
                    <div className="text-xs font-mono">{m.content}</div>
                  ) : (
                    renderFormattedContent(m.content)
                  )}

                  {m.untrustedPayloadWarning && (
                    <div className="mt-3 p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Defensive isolation active: untrusted wire payloads quarantined as raw binary.</span>
                    </div>
                  )}

                  {m.citedIds && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center gap-2 text-[10px] text-white/40 font-mono">
                      <span>CITED REFERENCES:</span>
                      {m.citedIds.incidentIds?.map(id => (
                        <span key={id} className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/15">{id}</span>
                      ))}
                      {m.citedIds.alertIds?.map(id => (
                        <span key={id} className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">{id}</span>
                      ))}
                      {m.citedIds.packetIds?.map(id => (
                        <span key={id} className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">PKT #{id}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 py-2">
              <Activity className="w-4 h-4 animate-spin" />
              <span>Analyzing telemetry & evaluating defensive heuristics...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/[0.08] bg-black/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Copilot or use slash commands (/explain, /investigate, /summarize)..."
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 font-mono focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-white text-black font-semibold rounded-xl text-xs flex items-center gap-1.5 hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer font-mono shrink-0"
            >
              <span>SEND</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </motion.div>
    </div>
  );
};
