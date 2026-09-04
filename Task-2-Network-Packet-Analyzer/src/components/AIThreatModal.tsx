import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Copy, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { Packet, ThreatAlert, AIThreatAnalysisResponse } from '../types';

interface AIThreatModalProps {
  packet?: Packet | null;
  alert?: ThreatAlert | null;
  onClose: () => void;
}

export const AIThreatModal: React.FC<AIThreatModalProps> = ({ packet, alert, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AIThreatAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchAIAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packet, alert }),
      });

      if (!res.ok) {
        throw new Error('Failed to reach Security Copilot Engine');
      }

      const data: AIThreatAnalysisResponse = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      setError(err?.message || 'Error generating AI threat assessment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, [packet?.id, alert?.id]);

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/20 bg-[#05070c]/90 backdrop-blur-xl text-white">
        
        {/* Modal Header */}
        <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-white/10 text-white border border-white/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 
                  className="text-sm font-bold text-white uppercase tracking-wider font-display"
                  style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                >
                  Security Copilot Threat Diagnostic
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 font-mono">
                  gemini-2.5-flash
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono">
                Automated payload forensics & MITRE ATT&CK mapping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs text-white/90">
          
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 mx-auto text-white/70 animate-spin" />
              <p className="font-semibold text-white text-sm">Disassembling payload & inspecting signatures...</p>
              <p className="text-xs text-white/50">Evaluating heuristic vectors against MITRE ATT&CK enterprise corpus...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 space-y-2">
              <p className="font-semibold flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4" /> Error generating AI diagnostics
              </p>
              <p className="text-xs text-white/60">{error}</p>
              <button
                onClick={fetchAIAnalysis}
                className="px-3.5 py-1.5 bg-white/10 text-white rounded-full border border-white/15 hover:bg-white/20 text-xs font-mono cursor-pointer transition-all"
              >
                Retry Analysis
              </button>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              
              {/* Threat Severity & Summary */}
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">
                    Assessment Result
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    analysis.severity === 'High' || analysis.severity === 'Critical'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : analysis.severity === 'Medium'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {analysis.severity?.toUpperCase()} SEVERITY
                  </span>
                </div>
                <p className="text-white text-xs leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              {/* MITRE ATT&CK Technique Mapping */}
              {analysis.mitreTechnique && (
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-1.5">
                  <div className="text-[11px] text-white/80 font-semibold uppercase tracking-wider">
                    MITRE ATT&CK Mapping
                  </div>
                  <div className="text-white font-bold">{analysis.mitreTechnique}</div>
                  {analysis.mitreDescription && (
                    <p className="text-white/60 text-xs leading-relaxed">{analysis.mitreDescription}</p>
                  )}
                </div>
              )}

              {/* Remediation Action Steps */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-2">
                  <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Recommended SOC Remediation Steps
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/90">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white/[0.03] border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={!analysis}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/70 hover:text-white border border-white/15 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-white text-black font-semibold text-xs font-mono hover:bg-white/90 transition-all cursor-pointer shadow-md"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
