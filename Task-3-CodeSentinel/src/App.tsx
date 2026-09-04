import React, { useState, useEffect } from 'react';
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
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Shield,
  Layers,
  ArrowRight
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
import { ReportsView } from './components/ReportsView.tsx';
import { SettingsDocsView } from './components/SettingsDocsView.tsx';
import { SecurityCopilotModal } from './components/SecurityCopilotModal.tsx';

export function App() {
  // Navigation & View State
  const [inWorkstation, setInWorkstation] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scan & Investigation State
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [targetFile, setTargetFile] = useState<string | null>(null);
  const [targetLine, setTargetLine] = useState<number | null>(null);

  // Copilot State
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotFinding, setCopilotFinding] = useState<Finding | null>(null);

  // Fetch initial scan history or latest scan if available
  useEffect(() => {
    fetch('/api/scans')
      .then(res => res.json())
      .then(data => {
        if (data.scans && data.scans.length > 0) {
          // Fetch full latest scan
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
      setActiveTab('overview');

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
        setActiveTab('overview');
      }
    } catch (err) {
      console.error('Failed to load scan:', err);
    }
  };

  // Navigation Helper
  const handleNavigate = (tab: string, findingId?: string) => {
    setActiveTab(tab);
    if (findingId) {
      setSelectedFindingId(findingId);
    }
    setSidebarOpen(false);
  };

  // Navigate to Code Explorer
  const handleNavigateToCode = (file: string, line: number) => {
    setTargetFile(file);
    setTargetLine(line);
    setActiveTab('code');
    setSidebarOpen(false);
  };

  // Open Copilot with specific finding
  const handleOpenCopilotWithFinding = (finding: Finding) => {
    setCopilotFinding(finding);
    setCopilotOpen(true);
  };

  // Navigation Items Definition
  const navItems = [
    { id: 'overview', label: '01 OVERVIEW', icon: LayoutDashboard, badge: currentScan ? `${currentScan.securityScore ?? '—'}` : null },
    { id: 'scanner', label: '02 CODE SCANNER', icon: Terminal, badge: null },
    { id: 'findings', label: '03 FINDINGS', icon: ShieldAlert, badge: currentScan ? `${currentScan.findings.length}` : null },
    { id: 'code', label: '04 CODE EXPLORER', icon: Code2, badge: currentScan ? `${currentScan.files?.length || 0}` : null },
    { id: 'rules', label: '05 SECURITY RULES', icon: ShieldCheck, badge: '18' },
    { id: 'history', label: '06 SCAN HISTORY', icon: History, badge: null },
    { id: 'reports', label: '07 REPORTS', icon: FileText, badge: null },
    { id: 'settings', label: '08 SETTINGS & DOCS', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col font-sans selection:bg-emerald-500/20 selection:text-white">
      {/* Cinematic dark canvas background for workstation */}
      {inWorkstation && <BackgroundCanvas />}

      {!inWorkstation ? (
        /* Master Cinematic Landing Page */
        <LandingPage
          onEnterApp={(tab) => {
            setInWorkstation(true);
            if (tab) setActiveTab(tab);
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
            onOpenTab={(t) => setActiveTab(t)}
            onLoadDemo={handleLoadDemo}
            onReturnToLanding={() => setInWorkstation(false)}
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

            {/* Persistent Translucent Sidebar */}
            <aside
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.48)',
                backdropFilter: 'blur(18px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.10)'
              }}
              className={`no-print fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col justify-between py-5 px-3 transition-transform duration-300 lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Navigation Section */}
              <div className="space-y-6">
                <div className="px-3">
                  <div className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                    NAVIGATION WORKSPACE
                  </div>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        id={`nav-tab-${item.id}`}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono tracking-tight transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#85D743]/10 text-[#85D743] font-medium border border-[#85D743]/30 shadow-[0_0_12px_rgba(133,215,67,0.15)]'
                            : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#85D743] shadow-[0_0_8px_#85D743]' : 'bg-transparent'}`} />
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#85D743]' : 'text-white/50'}`} />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            isActive 
                              ? 'bg-[#85D743]/20 text-[#85D743] font-semibold border border-[#85D743]/30' 
                              : 'bg-white/5 text-white/40'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Footer / Benchmark Launcher */}
              <div className="px-3 pt-4 border-t border-white/10 space-y-3">
                <button
                  onClick={handleLoadDemo}
                  className="w-full py-2 px-3 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>LOAD DEMO</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/40" />
                </button>

                <div className="text-[11px] font-mono text-white/30 px-1">
                  CodeSentinel AST Engine v2.4
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto min-h-[calc(100vh-3.5rem)]">
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
                    setActiveTab('overview');
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
                  onNavigateToScanner={() => setActiveTab('scanner')}
                  onLoadDemo={handleLoadDemo}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  currentScan={currentScan}
                  onNavigateToScanner={() => setActiveTab('scanner')}
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
        </div>
      )}
    </div>
  );
}
export default App;
