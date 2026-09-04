import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  ShieldAlert, 
  Code2, 
  ShieldCheck, 
  History, 
  FileText, 
  Settings, 
  Sparkles, 
  GitCompare,
  FileCheck,
  Menu,
  X,
  Shield,
  Layers,
  ArrowRight,
  Search
} from 'lucide-react';
import { ScanResult, Finding } from './types.ts';
import { BackgroundCanvas } from './components/BackgroundCanvas.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Navbar } from './components/Navbar.tsx';
import { OverviewView } from './components/OverviewView.tsx';
import { ScannerView } from './components/ScannerView.tsx';
import { FindingsView } from './components/FindingsView.tsx';
import { CodeExplorerView } from './components/CodeExplorerView.tsx';
import { RulesView } from './components/RulesView.tsx';
import { ScanHistoryView } from './components/ScanHistoryView.tsx';
import { ScanComparisonView } from './components/ScanComparisonView.tsx';
import { AuditTrailView } from './components/AuditTrailView.tsx';
import { ComplianceView } from './components/ComplianceView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SettingsDocsView } from './components/SettingsDocsView.tsx';
import { SecurityCopilotModal } from './components/SecurityCopilotModal.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';

export function App() {
  // Navigation & View State
  const [inWorkstation, setInWorkstation] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Scan & Investigation State
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [targetFile, setTargetFile] = useState<string | null>(null);
  const [targetLine, setTargetLine] = useState<number | null>(null);

  // Copilot State
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotFinding, setCopilotFinding] = useState<Finding | null>(null);

  // Synchronize with URL hash for persistent routing and browser history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const validTabs = [
        'overview', 'scanner', 'findings', 'code', 'rules', 
        'history', 'compare', 'audit', 'compliance', 'reports', 'settings'
      ];
      if (hash && validTabs.includes(hash)) {
        setInWorkstation(true);
        setActiveTab(hash);
      } else if (hash === 'home' || hash === 'landing') {
        setInWorkstation(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when tab changes
  const switchTab = useCallback((tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    setSidebarOpen(false);
  }, []);

  // Global Ctrl+K / Cmd+K Command Palette Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial scan history or latest scan if available
  useEffect(() => {
    fetch('/api/scans')
      .then(res => res.json())
      .then(data => {
        if (data.scans && data.scans.length > 0) {
          fetch(`/api/scans/${data.scans[0].id}`)
            .then(r => r.json())
            .then(latest => {
              if (latest && latest.id) {
                setCurrentScan(latest);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Load Benchmark Demo
  const handleLoadDemo = async () => {
    try {
      setInWorkstation(true);
      switchTab('overview');

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDemo: true,
          projectName: 'Apex Bank & API Microservice',
          sourceType: 'DEMO'
        })
      });

      if (res.ok) {
        const data: ScanResult = await res.json();
        setCurrentScan(data);
      }
    } catch (err) {
      console.error('Failed to load demo:', err);
    }
  };

  // Load specific scan by ID
  const handleLoadScanById = async (id: string) => {
    try {
      const res = await fetch(`/api/scans/${id}`);
      if (res.ok) {
        const data: ScanResult = await res.json();
        setCurrentScan(data);
        switchTab('overview');
      }
    } catch (err) {
      console.error('Failed to load scan:', err);
    }
  };

  // Navigation Helper
  const handleNavigate = (tab: string, findingId?: string) => {
    switchTab(tab);
    if (findingId) {
      setSelectedFindingId(findingId);
    }
  };

  // Navigate to Code Explorer
  const handleNavigateToCode = (file: string, line: number) => {
    setTargetFile(file);
    setTargetLine(line);
    switchTab('code');
  };

  // Open Copilot with specific finding
  const handleOpenCopilotWithFinding = (finding: Finding) => {
    setCopilotFinding(finding);
    setCopilotOpen(true);
  };

  // Professional Navigation Categories (Section 31)
  const navSections = [
    {
      title: null,
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: currentScan ? `${currentScan.securityScore ?? '—'}` : null },
      ]
    },
    {
      title: 'ASSESSMENT',
      items: [
        { id: 'scanner', label: 'Scanner', icon: Terminal, badge: null },
        { id: 'findings', label: 'Findings', icon: ShieldAlert, badge: currentScan ? `${currentScan.findings.length}` : null },
        { id: 'code', label: 'Source Explorer', icon: Code2, badge: currentScan ? `${currentScan.files?.length || 0}` : null },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'rules', label: 'Rules', icon: ShieldCheck, badge: '18' },
        { id: 'history', label: 'History', icon: History, badge: null },
        { id: 'compare', label: 'Compare', icon: GitCompare, badge: null },
      ]
    },
    {
      title: 'GOVERNANCE',
      items: [
        { id: 'audit', label: 'Audit Trail', icon: Shield, badge: null },
        { id: 'compliance', label: 'Compliance', icon: FileCheck, badge: null },
        { id: 'reports', label: 'Reports', icon: FileText, badge: null },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Docs & Settings', icon: Settings, badge: null },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col font-sans selection:bg-emerald-500/20 selection:text-white">
      {/* Background atmosphere continuity */}
      {inWorkstation && <BackgroundCanvas />}

      {!inWorkstation ? (
        /* Master Cinematic Landing Page */
        <LandingPage
          onEnterApp={(tab) => {
            setInWorkstation(true);
            switchTab(tab || 'overview');
          }}
          onLoadDemo={handleLoadDemo}
        />
      ) : (
        /* Workstation Shell */
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Top Navbar */}
          <Navbar
            currentScan={currentScan}
            activeTab={activeTab}
            onOpenTab={(t) => switchTab(t)}
            onLoadDemo={handleLoadDemo}
            onReturnToLanding={() => {
              setInWorkstation(false);
              window.location.hash = 'home';
            }}
            onOpenCopilot={() => {
              setCopilotFinding(null);
              setCopilotOpen(true);
            }}
          />

          {/* Main Layout Container */}
          <div className="flex-1 flex overflow-hidden">
            {/* Mobile Sidebar Toggle Button */}
            <div className="no-print lg:hidden fixed bottom-4 right-4 z-40">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-12 h-12 rounded-full bg-white text-black font-bold flex items-center justify-center shadow-2xl cursor-pointer"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Persistent Enterprise Sidebar */}
            <aside
              style={{
                backgroundColor: 'rgba(2, 6, 23, 0.82)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.10)'
              }}
              className={`no-print fixed lg:static inset-y-0 left-0 z-30 w-72 flex flex-col justify-between py-6 px-4 transition-transform duration-300 lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Navigation Section */}
              <div className="space-y-6 overflow-y-auto">
                {/* Command Palette Trigger in Sidebar */}
                <button
                  onClick={() => setCommandPaletteOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-sm font-mono text-white/80 hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-[#85D743]" />
                    <span>Search / Jump</span>
                  </div>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/60 border border-white/15">
                    ⌘K
                  </kbd>
                </button>

                {/* Categorized Nav Sections */}
                <nav className="space-y-6">
                  {navSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      {section.title && (
                        <div className="px-3 pt-2 pb-1 font-press-start text-[8px] tracking-widest text-[#85D743]/70 uppercase">
                          {section.title}
                        </div>
                      )}

                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                          <button
                            key={item.id}
                            id={`nav-tab-${item.id}`}
                            onClick={() => switchTab(item.id)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#85D743]/15 text-[#85D743] font-semibold border border-[#85D743]/40 shadow-[0_0_15px_rgba(133,215,67,0.18)]'
                                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#85D743]' : 'text-white/40'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>

                            {item.badge && (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-press-start flex-shrink-0 ${
                                isActive 
                                  ? 'bg-[#85D743]/20 text-[#85D743] font-semibold border border-[#85D743]/40' 
                                  : 'bg-white/5 text-white/50'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Sidebar Footer */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                  onClick={() => {
                    setCopilotFinding(null);
                    setCopilotOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 flex items-center justify-between transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>SECURITY COPILOT</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400/60" />
                </button>

                <div className="text-[11px] font-mono text-white/40 px-2 flex items-center justify-between">
                  <span>CodeSentinel AST</span>
                  <span className="text-[#85D743] font-press-start text-[8px]">v2.4</span>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 sm:p-10 lg:p-12 max-w-[1680px] mx-auto w-full overflow-y-auto min-h-[calc(100vh-3.5rem)]">
              {activeTab === 'overview' && (
                <OverviewView
                  currentScan={currentScan}
                  onNavigate={handleNavigate}
                  onLoadDemo={handleLoadDemo}
                />
              )}

              {activeTab === 'scanner' && (
                <ScannerView
                  onScanCompleted={(res) => {
                    setCurrentScan(res);
                    switchTab('overview');
                  }}
                  onLoadDemo={handleLoadDemo}
                />
              )}

              {activeTab === 'findings' && (
                <FindingsView
                  currentScan={currentScan}
                  selectedFindingId={selectedFindingId}
                  onNavigateToCode={handleNavigateToCode}
                  onOpenCopilotWithFinding={handleOpenCopilotWithFinding}
                />
              )}

              {activeTab === 'code' && (
                <CodeExplorerView
                  currentScan={currentScan}
                  targetFile={targetFile}
                  targetLine={targetLine}
                  onOpenCopilotWithFinding={handleOpenCopilotWithFinding}
                />
              )}

              {activeTab === 'rules' && (
                <RulesView />
              )}

              {activeTab === 'history' && (
                <ScanHistoryView
                  onLoadScanById={handleLoadScanById}
                  onNavigateToScanner={() => switchTab('scanner')}
                  onLoadDemo={handleLoadDemo}
                />
              )}

              {activeTab === 'compare' && (
                <ScanComparisonView
                  currentScan={currentScan}
                  onNavigateToFindings={() => switchTab('findings')}
                  onNavigateToScanner={() => switchTab('scanner')}
                />
              )}

              {activeTab === 'audit' && (
                <AuditTrailView />
              )}

              {activeTab === 'compliance' && (
                <ComplianceView
                  currentScan={currentScan}
                  onNavigateToFindings={() => switchTab('findings')}
                  onNavigateToScanner={() => switchTab('scanner')}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  currentScan={currentScan}
                  onNavigateToScanner={() => switchTab('scanner')}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsDocsView />
              )}
            </main>
          </div>

          {/* AI Copilot Modal */}
          <SecurityCopilotModal
            isOpen={copilotOpen}
            onClose={() => setCopilotOpen(false)}
            initialFinding={copilotFinding}
            projectName={currentScan?.projectName}
          />

          {/* Command Palette */}
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onNavigate={handleNavigate}
            onOpenCopilot={() => setCopilotOpen(true)}
            onLoadDemo={handleLoadDemo}
            currentScan={currentScan}
          />
        </div>
      )}
    </div>
  );
}
export default App;
