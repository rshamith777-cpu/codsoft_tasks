import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Check, 
  Copy, 
  Bot, 
  User
} from 'lucide-react';
import { Finding, AIAnalysisResponse } from '../types.ts';

interface SecurityCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFinding?: Finding | null;
  projectName?: string;
}

export const SecurityCopilotModal: React.FC<SecurityCopilotModalProps> = ({
  isOpen,
  onClose,
  initialFinding,
  projectName
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; patch?: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  // If opened with an initial finding, auto-analyze
  useEffect(() => {
    if (isOpen && initialFinding) {
      setMessages([
        {
          role: 'assistant',
          text: `Analyzing ${initialFinding.title} (${initialFinding.cwe}) in \`${initialFinding.file}:${initialFinding.line}\`...\n\nEvidence: \`${initialFinding.evidence}\``
        }
      ]);
      analyzeFinding(initialFinding);
    } else if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          text: `Hello! I am your CodeSentinel Security Copilot powered by Gemini. You can ask me how to remediate specific vulnerabilities, request secure architectural patterns, or discuss potential attack vectors for "${projectName || 'your codebase'}".`
        }
      ]);
    }
  }, [isOpen, initialFinding]);

  const analyzeFinding = async (finding: Finding) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-finding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding,
          codeContext: finding.codeSnippet || finding.evidence
        })
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data: AIAnalysisResponse = await res.json();
      const textResponse = `### Technical Assessment: ${finding.title}\n\n**Exploit Mechanics:**\n${data.exploitMechanics}\n\n**Attack Vector:**\n${data.attackVector}\n\n**Potential Impact:**\n${data.potentialImpact}\n\n**Remediation Guidance:**\n${data.remediationGuidance}\n\n**Mitigation Priority:** ${data.mitigationPriority}`;

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: textResponse,
          patch: data.secureCodePatch
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Static Fallback Analysis:\n\n**Vulnerability:** ${finding.title} (${finding.cwe})\n**File:** ${finding.file}:${finding.line}\n**Evidence:** ${finding.evidence}\n\n**Remediation:** ${finding.remediation}`,
          patch: finding.fixSnippet || finding.evidence
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          contextFinding: initialFinding || undefined
        })
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'No response received from Security Copilot.'
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Unable to reach Copilot engine: ${err?.message || 'Network communication error'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPatch = (patch: string) => {
    navigator.clipboard.writeText(patch);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#09090b] border border-white/20 rounded-2xl shadow-2xl flex flex-col h-[640px] max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-2">
                SECURITY COPILOT
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                  GEMINI 3.7 FLASH
                </span>
              </h3>
              <p className="text-[11px] text-[#9a9a9a] font-mono truncate max-w-md">
                {initialFinding ? `${initialFinding.title} (${initialFinding.cwe})` : 'Application Security Assistant'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2 p-3.5 rounded-xl ${
                m.role === 'user' 
                  ? 'bg-white/15 text-white border border-white/20' 
                  : 'bg-white/5 text-white/90 border border-white/10'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </div>

                {m.patch && (
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                      <span>RECOMMENDED SECURE PATCH:</span>
                      <button
                        onClick={() => handleCopyPatch(m.patch!)}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedPatch ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPatch ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded bg-black/80 border border-emerald-500/20 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
                      {m.patch}
                    </pre>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-md bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-[#9a9a9a] text-xs font-mono">
              <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Copilot is analyzing security context...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about vulnerability impact, exploit mechanics, or fix steps..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs font-sans text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
            className="btn-liquid-primary p-2 rounded-lg text-xs font-semibold flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};
