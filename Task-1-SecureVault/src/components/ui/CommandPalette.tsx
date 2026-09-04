import React, { useState, useEffect } from 'react';
import {
  Search,
  Shield,
  Lock,
  FileText,
  Share2,
  Activity,
  History,
  Terminal,
  Settings,
  Upload,
  RefreshCw,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (viewId: string) => void;
  onUpload: () => void;
  onRunAudit: () => void;
  onSeedDemo: () => void;
  onResetDemo: () => void;
  isDemoActive: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onUpload,
  onRunAudit,
  onSeedDemo,
  onResetDemo,
  isDemoActive,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Handled externally if needed
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationItems = [
    { id: 'overview', title: '01 Overview', desc: 'Vault security summary & telemetry', icon: Shield },
    { id: 'vault', title: '02 Encrypted Vault', desc: 'Manage AES-256-GCM encrypted files', icon: Lock },
    { id: 'crypto-inspector', title: '03 Cryptographic Inspector', desc: 'Examine envelopes, IVs, and digests', icon: Terminal },
    { id: 'shares', title: '04 Secure Shares', desc: 'Review active tokens & expiration bounds', icon: Share2 },
    { id: 'security', title: '05 Security Posture & Intelligence', desc: 'Agents, automations, and controls', icon: Activity },
    { id: 'audit', title: '06 Audit Activity', desc: 'Immutable security log timeline', icon: History },
    { id: 'architecture', title: '07 Architecture & Threat Model', desc: 'Cryptographic dataflow & mitigation', icon: FileText },
    { id: 'settings', title: '08 Settings & Account', desc: 'Security policies & timeouts', icon: Settings },
  ];

  const actionItems = [
    {
      id: 'action-upload',
      title: 'Upload & Encrypt File',
      desc: 'Encrypt with AES-256-GCM and store in vault',
      icon: Upload,
      action: () => {
        onClose();
        onUpload();
      },
    },
    {
      id: 'action-audit',
      title: 'Run Storage Integrity Verification',
      desc: 'Verify SHA-256 digests across all stored blobs',
      icon: RefreshCw,
      action: () => {
        onClose();
        onRunAudit();
      },
    },
    ...(isDemoActive
      ? [
          {
            id: 'action-reset-demo',
            title: 'Reset Security Demo Data',
            desc: 'Purge deterministic demo payloads from vault',
            icon: RotateCcw,
            action: () => {
              onClose();
              onResetDemo();
            },
          },
        ]
      : [
          {
            id: 'action-seed-demo',
            title: 'Seed Deterministic Security Demo',
            desc: 'Load verified encrypted files and audit logs',
            icon: Play,
            action: () => {
              onClose();
              onSeedDemo();
            },
          },
        ]),
  ];

  const filteredNav = navigationItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actionItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-24 px-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-[#06080e]/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[3px] overflow-hidden z-10 animate-scaleUp">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-4 h-4 text-white/50 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or jump to module... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none text-sm text-white font-sans-main placeholder:text-white/30 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block font-mono-tech text-[10px] text-white/40 border border-white/15 px-1.5 py-0.5 rounded-[2px]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 font-mono-tech text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
                Direct Actions
              </div>
              <div className="space-y-1 mt-1">
                {filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full text-left px-3 py-2 rounded-[2px] hover:bg-white/[0.08] flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-white/30">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-mono-tech text-xs tracking-wider text-white">
                            {action.title}
                          </div>
                          <div className="font-sans-main text-[11px] text-white/50">
                            {action.desc}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono-tech text-[10px] text-white/40 group-hover:text-white/80 uppercase">
                        EXECUTE ↵
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 font-mono-tech text-[9.5px] tracking-[0.16em] text-white/40 uppercase">
                Primary Modules
              </div>
              <div className="space-y-1 mt-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onClose();
                        onNavigate(item.id);
                      }}
                      className="w-full text-left px-3 py-2 rounded-[2px] hover:bg-white/[0.08] flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-white/30">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-mono-tech text-xs tracking-wider text-white">
                            {item.title}
                          </div>
                          <div className="font-sans-main text-[11px] text-white/50">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono-tech text-[10px] text-white/40 group-hover:text-white/80 uppercase">
                        GOTO ↵
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && (
            <div className="py-8 text-center font-mono-tech text-xs text-white/40">
              [ NO COMMANDS MATCHING &quot;{query}&quot; ]
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-white/10 bg-black/40 flex items-center justify-between font-mono-tech text-[10px] text-white/40">
          <span>SECUREVAULT FAST NAVIGATION</span>
          <span className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleUp {
          animation: scaleUp 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
