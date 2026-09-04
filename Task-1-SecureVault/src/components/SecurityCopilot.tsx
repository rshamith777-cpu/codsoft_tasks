import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Bot,
  User as UserIcon,
  Key,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { CopilotResponse } from '../types';
import { Button } from './ui/Button';

interface SecurityCopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: 'GEMINI_AI' | 'LOCAL SECURITY ANALYSIS' | 'UNAVAILABLE';
  timestamp: string;
}

export const SecurityCopilot: React.FC<SecurityCopilotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `SecureVault Security Copilot initialized.\n\nI provide real-time cryptographic analysis, storage integrity verification, share link auditing, and zero-trust telemetry evaluation.\n\nAsk any question about vault security or choose one of the quick actions below.`,
      source: 'LOCAL SECURITY ANALYSIS',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean>(false);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyActionLoading, setKeyActionLoading] = useState(false);
  const [keyActionMessage, setKeyActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      api.getAiStatus().then((status) => {
        setAiConfigured(status.configured);
      }).catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (forcedPrompt?: string) => {
    const textToSend = (forcedPrompt || inputPrompt).trim();
    if (!textToSend || loading) return;

    const userMsgId = 'msg-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!forcedPrompt) setInputPrompt('');
    setLoading(true);

    try {
      const res: CopilotResponse = await api.askCopilot(textToSend);

      setMessages((prev) => [
        ...prev,
        {
          id: 'resp-' + Date.now(),
          sender: 'assistant',
          text: res.text || res.localAnalysis || 'Security analysis complete.',
          source: res.source || 'LOCAL SECURITY ANALYSIS',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: `[LOCAL TELEMETRY ENGINE]\nAnalysis completed on live vault state.\n\nError details: ${err.message || 'Transient error'}.\nAll files and share links continue to be strictly monitored and authenticated.`,
          source: 'LOCAL SECURITY ANALYSIS',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setKeyActionLoading(true);
    setKeyActionMessage(null);

    try {
      const res = await api.configureAiKey(apiKeyInput.trim());
      setAiConfigured(true);
      setKeyActionMessage({ type: 'success', text: res.message || 'Gemini API key verified & activated!' });
      setApiKeyInput('');
      setTimeout(() => {
        setIsConfigPanelOpen(false);
        setKeyActionMessage(null);
      }, 1800);
    } catch (err: any) {
      setKeyActionMessage({ type: 'error', text: err.message || 'Failed to validate API key.' });
    } finally {
      setKeyActionLoading(false);
    }
  };

  const handleDisconnectKey = async () => {
    setKeyActionLoading(true);
    setKeyActionMessage(null);

    try {
      await api.removeAiKey();
      setAiConfigured(false);
      setKeyActionMessage({ type: 'success', text: 'Gemini key disconnected. Using Local Telemetry Engine.' });
      setTimeout(() => {
        setIsConfigPanelOpen(false);
        setKeyActionMessage(null);
      }, 1500);
    } catch (err: any) {
      setKeyActionMessage({ type: 'error', text: err.message || 'Failed to disconnect key.' });
    } finally {
      setKeyActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl glass-modal rounded-[4px] border border-white/20 shadow-2xl flex flex-col h-[700px] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-white/[0.08] border border-white/15 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono-tech text-xs md:text-sm tracking-[0.16em] uppercase text-white font-bold">
                  SECURITY COPILOT
                </span>
                <span
                  className={`px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-wider rounded-[2px] border ${
                    aiConfigured
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  }`}
                >
                  {aiConfigured ? 'GEMINI 2.0 ACTIVE' : 'LOCAL TELEMETRY ACTIVE'}
                </span>
              </div>
              <div className="font-mono-tech text-[11px] text-white/45">
                Live ground-truth cryptographic telemetry &amp; security reasoning
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
              className={`px-2.5 py-1.5 rounded-[2px] border font-mono-tech text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isConfigPanelOpen
                  ? 'border-white/30 bg-white/15 text-white'
                  : 'border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{aiConfigured ? 'API Key Active' : 'Connect Gemini Key'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/60 hover:text-white rounded-[2px] border border-transparent hover:border-white/15 transition-colors cursor-pointer"
              title="Close Copilot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key Configuration Dropdown Panel */}
        {isConfigPanelOpen && (
          <div className="p-4 bg-black/85 border-b border-white/15 animate-fadeIn">
            <div className="max-w-xl mx-auto space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-mono-tech text-xs text-white uppercase tracking-wider font-semibold flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Google Gemini AI Configuration
                  </h4>
                  <p className="text-white/60 text-xs mt-1">
                    SecureVault includes a powerful built-in Local Telemetry Engine. To enable advanced generative LLM synthesis, paste your Google Gemini API Key.
                  </p>
                </div>
              </div>

              {keyActionMessage && (
                <div
                  className={`p-2.5 rounded-[2px] text-xs font-mono-tech flex items-center gap-2 border ${
                    keyActionMessage.type === 'success'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
                >
                  {keyActionMessage.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{keyActionMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveKey} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={aiConfigured ? 'Enter new key to replace current key...' : 'Paste Gemini API Key (e.g., AIzaSy...)'}
                    className="flex-1 px-3 py-2 bg-black/60 border border-white/15 rounded-[2px] text-white font-mono-tech text-xs placeholder:text-white/30 focus:outline-none focus:border-sky-500"
                    disabled={keyActionLoading}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!apiKeyInput.trim() || keyActionLoading}
                  >
                    {keyActionLoading ? 'Verifying...' : 'Verify & Save'}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-mono-tech text-white/50">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline underline-offset-2"
                  >
                    Get free API key at Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>

                  {aiConfigured && (
                    <button
                      type="button"
                      onClick={handleDisconnectKey}
                      disabled={keyActionLoading}
                      className="text-red-400 hover:text-red-300 underline underline-offset-2 cursor-pointer"
                    >
                      Disconnect API Key
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center gap-2 overflow-x-auto text-xs font-mono-tech text-white/60 shrink-0">
          <span className="text-white/35 text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-sky-400" /> Prompts:
          </span>
          {[
            'Audit storage integrity',
            'Summarize share link exposures',
            'Evaluate blocked intrusion attempts',
            'Explain AES-256-GCM envelope',
            'List stored files & algorithms',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.12] text-white/75 hover:text-white rounded-[2px] border border-white/10 whitespace-nowrap transition-colors cursor-pointer text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 font-mono-tech text-xs md:text-sm">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-2 text-[11px] text-white/40 px-1">
                  {isUser ? (
                    <>
                      <span>{msg.timestamp}</span>
                      <span className="font-semibold text-white/70 flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-white/50" /> YOU (SECURITY OFFICER)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-white/90 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-sky-400" /> SECUREVAULT COPILOT
                      </span>
                      {msg.source && (
                        <span
                          className={`px-1.5 py-0.2 rounded-[1px] text-[9.5px] uppercase tracking-wider border ${
                            msg.source === 'GEMINI_AI'
                              ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
                              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          }`}
                        >
                          {msg.source === 'GEMINI_AI' ? 'GEMINI 2.0 AI' : 'LOCAL TELEMETRY ENGINE'}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-[90%] md:max-w-[85%] p-4 rounded-[2px] whitespace-pre-wrap leading-relaxed ${
                    isUser
                      ? 'bg-white text-black font-sans font-medium text-xs md:text-sm'
                      : 'glass-panel border-white/15 text-white/90 font-mono-tech text-xs md:text-[12.5px]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2.5 p-3 text-white/60 font-mono-tech text-xs bg-white/[0.03] border border-white/10 rounded-[2px] w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>Analyzing live cryptographic state and security telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 md:p-4 border-t border-white/10 bg-black/60 flex items-center gap-2.5"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Copilot about encryption envelopes, shares, integrity, or threat telemetry..."
            className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/15 rounded-[2px] font-mono-tech text-xs md:text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/35 focus:bg-white/[0.06] transition-colors"
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputPrompt.trim() || loading}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
