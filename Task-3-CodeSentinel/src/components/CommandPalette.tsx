import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  ShieldAlert, 
  Code2, 
  History, 
  FileText, 
  GitCompare, 
  ShieldCheck, 
  Settings, 
  Sparkles, 
  ArrowRight, 
  X,
  Layers
} from 'lucide-react';
import { ScanResult } from '../types.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, findingId?: string) => void;
  onOpenCopilot: () => void;
  onLoadDemo: () => void;
  currentScan: ScanResult | null;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCopilot,
  onLoadDemo,
  currentScan
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build command actions list
  const baseActions = [
    { id: 'action-scan', title: 'Start Code Assessment', category: 'Action', icon: Terminal, action: () => { onNavigate('scanner'); onClose(); } },
    { id: 'action-demo', title: 'Load Benchmark Demo (Apex Bank)', category: 'Action', icon: Terminal, action: () => { onLoadDemo(); onClose(); } },
    { id: 'action-copilot', title: 'Launch Security Copilot Assistant', category: 'Action', icon: Sparkles, action: () => { onOpenCopilot(); onClose(); } },
    { id: 'action-reports', title: 'Export Assessment Reports (JSON / CSV)', category: 'Action', icon: FileText, action: () => { onNavigate('reports'); onClose(); } },
    
    { id: 'nav-overview', title: '01 Overview — Security Command Center', category: 'Navigation', icon: Layers, action: () => { onNavigate('overview'); onClose(); } },
    { id: 'nav-scanner', title: '02 Scanner — Upload & Paste Engine', category: 'Navigation', icon: Terminal, action: () => { onNavigate('scanner'); onClose(); } },
    { id: 'nav-findings', title: '03 Findings — Vulnerability Intelligence', category: 'Navigation', icon: ShieldAlert, action: () => { onNavigate('findings'); onClose(); } },
    { id: 'nav-code', title: '04 Source Explorer — Code Line Inspector', category: 'Navigation', icon: Code2, action: () => { onNavigate('code'); onClose(); } },
    { id: 'nav-rules', title: '05 Rule Intelligence — AST Signatures', category: 'Navigation', icon: ShieldCheck, action: () => { onNavigate('rules'); onClose(); } },
    { id: 'nav-history', title: '06 Scan History — Historical Record', category: 'Navigation', icon: History, action: () => { onNavigate('history'); onClose(); } },
    { id: 'nav-compare', title: '07 Scan Comparison — Differential Delta', category: 'Navigation', icon: GitCompare, action: () => { onNavigate('compare'); onClose(); } },
    { id: 'nav-audit', title: '08 Audit Trail — Security Event Journal', category: 'Navigation', icon: ShieldCheck, action: () => { onNavigate('audit'); onClose(); } },
    { id: 'nav-compliance', title: '09 Compliance — OWASP & CWE Mapping', category: 'Navigation', icon: Layers, action: () => { onNavigate('compliance'); onClose(); } },
    { id: 'nav-reports', title: '10 Reports — Compliance & PDF', category: 'Navigation', icon: FileText, action: () => { onNavigate('reports'); onClose(); } },
    { id: 'nav-settings', title: '11 System Docs & Settings', category: 'Navigation', icon: Settings, action: () => { onNavigate('settings'); onClose(); } }
  ];

  // Include current scan findings if available
  const findingActions = (currentScan?.findings || []).slice(0, 10).map(f => ({
    id: `finding-${f.id}`,
    title: `Finding: ${f.title} (${f.severity}) — ${f.file}:${f.line}`,
    category: 'Vulnerability Finding',
    icon: ShieldAlert,
    action: () => {
      onNavigate('findings', f.id);
      onClose();
    }
  }));

  const allItems = [...baseActions, ...findingActions];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 8)
    : allItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 px-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl rounded-3xl bg-[#09090b]/95 border border-white/20 shadow-2xl overflow-hidden flex flex-col font-mono backdrop-blur-xl">
        {/* Search Input Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center gap-3.5 bg-white/5">
          <Search className="w-5 h-5 text-[#85D743] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInInput}
            placeholder="Search commands, views, rules, or findings... (Esc to close)"
            className="w-full bg-transparent border-none outline-none text-white text-sm sm:text-base placeholder:text-white/40"
          />
          <kbd className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white/60 border border-white/10 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[440px] overflow-y-auto p-3 divide-y divide-white/5 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-[#9a9a9a] text-sm">
              No matching commands or findings found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 sm:px-5 py-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-white/15 text-white font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-[#85D743]' : 'text-white/40'}`} />
                    <span className="truncate text-sm sm:text-base">{item.title}</span>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/50 border border-white/5 flex-shrink-0 ml-3 font-mono">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-black/50 text-xs text-white/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">↵</kbd> Select</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">Esc</kbd> Close</span>
          </div>
          <span className="font-press-start text-[9px] text-[#85D743]">CODESENTINEL // APPSEC</span>
        </div>
      </div>
    </div>
  );
};
