import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Check, 
  Copy, 
  Bot, 
  User,
  StopCircle,
  RotateCcw,
  Trash2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Code2
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
  const [copiedPatchIdx, setCopiedPatchIdx] = useState<number | null>(null);
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(true);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check Copilot status
  useEffect(() => {
    if (isOpen) {
      fetch('/api/copilot/status')
        .then(r => r.json())
        .then(data => {
          setIsAiConfigured(!!data.configured);
        })
        .catch(() => setIsAiConfigured(false));
    }
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // If opened with an initial finding, auto-analyze
  useEffect(() => {
    if (isOpen && initialFinding) {
      setMessages([
        {
          role: 'assistant',
          text: `Analyzing **${initialFinding.title}** (${initialFinding.cwe}) detected in \`${initialFinding.file}:${initialFinding.line}\`...\n\nEvidence: \`${initialFinding.evidence}\``
        }
      ]);
      analyzeFinding(initialFinding);
    } else if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          text: `Hello! I am your CodeSentinel Security Copilot. I analyze security findings, explain exploit mechanics, evaluate attack surface vectors, and generate verified remediation patches for "${projectName || 'your codebase'}".`
        }
      ]);
    }
  }, [isOpen, initialFinding]);

  const analyzeFinding = async (finding: Finding) => {
    setIsLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch('/api/ai/analyze-finding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          finding,
          codeContext: finding.codeSnippet || finding.evidence
        })
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data: AIAnalysisResponse = await res.json();
      const textResponse = `### ANALYSIS
${data.exploitMechanics}

### EVIDENCE & ATTACK VECTOR
- **Entrypoint / Vector:** ${data.attackVector}
- **Potential Impact:** ${data.potentialImpact}
- **Mitigation Priority:** ${data.mitigationPriority}

### RECOMMENDATION
${data.remediationGuidance}`;

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: textResponse,
          patch: data.secureCodePatch
        }
      ]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `### ANALYSIS
Vulnerability: ${finding.title} (${finding.cwe}) in \`${finding.file}:${finding.line}\`.

### EVIDENCE & ATTACK VECTOR
Evidence: \`${finding.evidence}\`
Impact: ${finding.impact}

### RECOMMENDATION
${finding.remediation}`,
          patch: finding.fixSnippet || finding.evidence
        }
      ]);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const executePrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMsg = promptText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
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
      if (err.name === 'AbortError') return;
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Security Copilot communication error: ${err?.message || 'Unable to contact analysis server.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Conversation history cleared. How can I assist with your code assessment?'
      }
    ]);
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPatchIdx(idx);
    setTimeout(() => setCopiedPatchIdx(null), 2000);
  };

  if (!isOpen) return null;

  const quickActions = initialFinding ? [
    { label: 'Why Is This Dangerous?', prompt: `Why is this finding (${initialFinding.title}, ${initialFinding.cwe}) dangerous? Explain the real-world attack scenario.` },
    { label: 'Show Secure Fix', prompt: `Provide the minimal, drop-in replacement secure code fix for this ${initialFinding.title} in ${initialFinding.file}.` },
    { label: 'Explain CWE', prompt: `Explain the ${initialFinding.cwe} classification and how it is typically prevented in software development.` },
    { label: 'Review Remediation', prompt: `Review the recommended remediation for ${initialFinding.title} and identify any edge cases or potential bypasses.` }
  ] : [
    { label: 'Prioritize Findings', prompt: 'Which severity categories should our AppSec team remediate first, and what is the recommended triage workflow?' },
    { label: 'Summarize Scan', prompt: 'Provide an executive summary of best practices for static application security testing.' },
    { label: 'Secure Coding Rules', prompt: 'What are the top 5 most critical secure coding habits developers should adopt to prevent injection and authentication flaws?' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md select-none font-mono">
      <div className="w-full max-w-4xl bg-[#09090b]/95 border border-white/20 rounded-3xl shadow-2xl flex flex-col h-[760px] max-h-[94vh] overflow-hidden backdrop-blur-xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-press-start text-xs sm:text-sm text-white tracking-wider">
                  SECURITY COPILOT
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-press-start ${
                  isAiConfigured 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {isAiConfigured ? 'GEMINI' : 'DETERMINISTIC'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#9a9a9a] truncate max-w-xl mt-1">
                {initialFinding ? `${initialFinding.title} (${initialFinding.cwe})` : 'Autonomous Application Security Advisory & Patch Generator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleClear}
              className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="px-5 py-3 border-b border-white/5 bg-black/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-press-start text-[9px] text-white/40 uppercase mr-1 whitespace-nowrap">QUICK ACTIONS:</span>
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => executePrompt(qa.prompt)}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 text-xs font-mono"
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div className={`space-y-3 max-w-[85%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-4 sm:p-5 rounded-2xl leading-relaxed whitespace-pre-wrap text-sm ${
                    m.role === 'user'
                      ? 'bg-[#85D743]/15 border border-[#85D743]/30 text-white rounded-tr-none'
                      : 'panel-surface border border-white/10 text-white/90 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>

                {/* Secure Patch Display */}
                {m.patch && (
                  <div className="panel-surface p-4 sm:p-5 rounded-2xl border border-white/15 bg-black/70 text-left space-y-3">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10 text-emerald-400">
                      <div className="flex items-center gap-2 font-bold font-press-start text-[10px]">
                        <Code2 className="w-4 h-4" />
                        <span>SECURE CODE PATCH</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(m.patch!, idx)}
                        className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded bg-white/5 border border-white/10"
                      >
                        {copiedPatchIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPatchIdx === idx ? 'COPIED' : 'COPY PATCH'}</span>
                      </button>
                    </div>

                    <pre className="text-xs sm:text-sm text-white/90 font-mono overflow-x-auto p-3.5 rounded-xl bg-black/60 border border-white/10 leading-relaxed">
                      {m.patch}
                    </pre>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#85D743]/20 border border-[#85D743]/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-[#85D743]" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="panel-surface p-4 rounded-2xl border border-white/10 text-white/70 flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Evaluating security context & generating guidance...</span>
                <button
                  onClick={handleStop}
                  className="ml-3 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>STOP</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executePrompt(inputText);
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isLoading ? 'Generating response...' : 'Ask Copilot about vulnerability fixes, attack surface, or CWE details...'}
              disabled={isLoading}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-black/60 border border-white/20 text-sm text-white placeholder:text-white/40 focus:border-[#85D743] outline-none transition-colors"
            />

            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-5 py-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 flex items-center gap-2 cursor-pointer text-sm font-medium"
              >
                <StopCircle className="w-4 h-4" />
                <span>STOP</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3.5 rounded-2xl bg-[#85D743] hover:bg-[#74c435] text-black font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-40 transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline font-mono">SEND</span>
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
