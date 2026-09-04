import React, { useState } from 'react';
import { 
  Layers, 
  Radio, 
  SearchCode, 
  ShieldAlert, 
  BarChart3, 
  FileSpreadsheet, 
  FolderArchive, 
  Settings, 
  BookOpenCheck, 
  Lock, 
  User, 
  CheckCircle2,
  ChevronRight,
  Monitor
} from 'lucide-react';

interface ScreenshotsShowcaseViewProps {
  onSelectTab: (tabId: string) => void;
}

export const ScreenshotsShowcaseView: React.FC<ScreenshotsShowcaseViewProps> = ({ onSelectTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const pagesList = [
    {
      id: 'splash',
      title: '1. Welcome & Splash Interface',
      category: 'Auth & Welcome',
      icon: Radio,
      tabTarget: 'auth-splash',
      description: 'Initial entry interface presenting application capabilities, CodSoft project credentials, feature highlights, and portal entry actions.',
      features: [
        'Minimalist banner with calm indigo-slate accents',
        'CodSoft Cyber Security project verification badge',
        'Core module highlights (Live Capture, Threat Radar, AI Copilot, Exports)',
        'Direct "Sign In" and "Guest Access" action buttons'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-center text-xs">
          <h3 className="font-semibold text-slate-100 text-sm">Network Packet Analyzer</h3>
          <p className="text-slate-400 text-xs">CodSoft Cyber Security Project</p>
          <div className="flex justify-center gap-2 pt-1">
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-medium">Sign In</span>
            <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-md text-[10px] font-medium">Guest Access</span>
          </div>
        </div>
      )
    },
    {
      id: 'login',
      title: '2. Analyst Sign In Portal',
      category: 'Auth & Welcome',
      icon: Lock,
      tabTarget: 'auth-login',
      description: 'Authentication view for security analysts to access the live packet stream with credential validation.',
      features: [
        'Clean username/email and password inputs',
        'Remember Session toggle & password recovery',
        'Direct registration toggle link'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Analyst Sign In</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-400 font-mono-calm">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">Email: analyst@codsoft.sec</div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">Password: ••••••••••••</div>
          </div>
        </div>
      )
    },
    {
      id: 'signup',
      title: '3. Analyst Registration',
      category: 'Auth & Welcome',
      icon: User,
      tabTarget: 'auth-signup',
      description: 'Profile registration interface with role designations (SOC Analyst, Security Researcher, Incident Lead).',
      features: [
        'Name and Email input controls',
        'Role Designation dropdown selector',
        'Instant profile creation and redirection'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>Register Profile</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400 font-mono-calm">
            <div className="p-1.5 bg-slate-950 rounded border border-slate-800">Role: SOC Security Analyst</div>
            <div className="p-1.5 bg-slate-950 rounded border border-slate-800">Email: new.analyst@codsoft.sec</div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: '4. Telemetry Dashboard',
      category: 'Core Analysis',
      icon: Layers,
      tabTarget: 'dashboard',
      description: 'Real-time monitoring dashboard displaying traffic volume, protocol breakdown, bandwidth gauges, active threat count, and recent packet stream.',
      features: [
        '5 Metric Cards (Total Frames, TCP, UDP, ICMP, Threat Alerts)',
        'Protocol Distribution Donut Chart with calm palette',
        'Real-time Bandwidth Line Graph',
        'Recent Packet Stream table with one-click AI inspection'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 font-mono-calm text-xs">
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="p-1.5 bg-slate-950 rounded border border-slate-800 text-slate-200 font-medium">Frames: 24,610</div>
            <div className="p-1.5 bg-slate-950 rounded border border-rose-900/40 text-rose-300 font-medium">Threats: 3</div>
            <div className="p-1.5 bg-slate-950 rounded border border-slate-800 text-emerald-300 font-medium">Rate: 1.8 Mbps</div>
          </div>
        </div>
      )
    },
    {
      id: 'capture',
      title: '5. Live Packet Capture Stream',
      category: 'Core Analysis',
      icon: Radio,
      tabTarget: 'capture',
      description: 'Real-time packet capture table rendering incoming TCP, UDP, ICMP, DNS, HTTP, and ARP frames in promiscuous mode.',
      features: [
        'Capture Toolbar (Start, Pause, Stop, Clear, Save Session)',
        'Protocol Filter Ticker (ALL, TCP, UDP, ICMP, DNS, HTTP, ARP)',
        'BPF Search & Filter Bar',
        'Row selection with instant payload preview and AI analysis'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 font-mono-calm text-xs">
          <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-medium">● Capturing Live</span>
            <span className="text-slate-400 text-[10px]">eth0 (Promiscuous)</span>
          </div>
        </div>
      )
    },
    {
      id: 'analysis',
      title: '6. Packet Dissection & Hex Inspector',
      category: 'Core Analysis',
      icon: SearchCode,
      tabTarget: 'analysis',
      description: 'Protocol disassembly presenting Ethernet II, IPv4, TCP/UDP headers, control flags, and hexadecimal byte offsets with ASCII decoding.',
      features: [
        'Disassembled Protocol Tree (Data Link, Network, Transport, Payload)',
        'TCP Control Flags Inspector (SYN, ACK, PSH, FIN, RST)',
        'Raw Hexadecimal Byte Offset Table + ASCII decoded column'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 font-mono-calm text-xs">
          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-indigo-300 font-medium">
            Frame #24608 Protocol Tree Disassembly
          </div>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[10px]">
            0000 14 22 33 44 55 66 00 1A 2B 3C 4D 5E 08 00
          </div>
        </div>
      )
    },
    {
      id: 'statistics',
      title: '7. Network Analytics & Charts',
      category: 'Analytics & Alerts',
      icon: BarChart3,
      tabTarget: 'statistics',
      description: 'Data visualization panel rendering protocol distribution donut charts, bandwidth volume timelines, and host interaction comparisons.',
      features: [
        'Protocol Donut Chart with calm palette',
        'Bandwidth and Packets/sec timeline graphs',
        'Host Transmitted vs Received traffic bar chart'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 font-mono-calm text-xs">
          <div className="flex justify-between text-slate-300 font-medium">
            <span>Protocol Mix</span>
            <span className="text-indigo-400">TCP 42% | UDP 28% | DNS 15%</span>
          </div>
        </div>
      )
    },
    {
      id: 'alerts',
      title: '8. Threat Alerts & Attack Simulator',
      category: 'Analytics & Alerts',
      icon: ShieldAlert,
      tabTarget: 'alerts',
      description: 'Automated threat detection view displaying heuristic alerts for port scans, ICMP floods, and C2 IPs with attack simulation triggers.',
      features: [
        'Attack Simulator Bar (+ Port Scan, + Ping Flood, + C2 Botnet)',
        'Severity filtering (High, Medium, Low, ALL)',
        'MITRE ATT&CK technique mapping (T1046, T1498, T1071)',
        'One-click AI copilot investigation modal'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-rose-950/40 space-y-2 font-mono-calm text-xs">
          <div className="p-2.5 bg-rose-950/30 border border-rose-800/40 rounded-lg space-y-1">
            <span className="px-1.5 py-0.5 bg-rose-900 text-rose-200 text-[9px] font-medium rounded">HIGH SEVERITY</span>
            <p className="text-slate-200 font-medium text-[11px] font-sans-calm">Port Scan Detected from 192.168.1.110</p>
          </div>
        </div>
      )
    },
    {
      id: 'filters',
      title: '9. BPF Query & Syntax Builder',
      category: 'Tools & Management',
      icon: Settings,
      tabTarget: 'filters',
      description: 'Berkeley Packet Filter studio enabling analysts to construct Wireshark expressions or apply saved presets.',
      features: [
        'Active BPF Query Input field',
        'Pre-configured presets (HTTPS, DNS, Subnet, ICMP, Large Frames)',
        'Custom rule builder form'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 font-mono-calm text-xs">
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-indigo-300 text-[11px]">
            ip.src == 192.168.1.10 and tcp.port == 443
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: '10. Report & Data Export Center',
      category: 'Tools & Management',
      icon: FileSpreadsheet,
      tabTarget: 'reports',
      description: 'Report generation hub to download executive PDF security audit reports, CSV packet tables, and raw JSON logs.',
      features: [
        'One-click jsPDF Executive Report generator',
        'CSV spreadsheet export',
        'JSON stream dataset export'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs text-center">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="font-medium text-slate-200 block text-[11px]">Generate PDF Summary Report</span>
            <span className="text-slate-400 text-[10px]">Formatted with metrics & recommendations</span>
          </div>
        </div>
      )
    },
    {
      id: 'saved',
      title: '11. PCAP Archives & Session Vault',
      category: 'Tools & Management',
      icon: FolderArchive,
      tabTarget: 'saved',
      description: 'Capture session archive manager to import external .pcap files or reload saved packet sessions.',
      features: [
        'Drag-and-Drop file upload zone',
        'Saved Capture History table',
        'Session Load & Delete controls'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="p-3 border border-dashed border-slate-700 rounded-lg text-center text-slate-400 text-[11px]">
            Drag & Drop .pcap File Here
          </div>
        </div>
      )
    },
    {
      id: 'srs',
      title: '12. SRS Specs & Architecture Docs',
      category: 'Documentation',
      icon: BookOpenCheck,
      tabTarget: 'srs',
      description: 'Software Requirements Specification, system architecture flowcharts, testing verification, and copyable README markdown.',
      features: [
        'SRS Functional & Non-Functional Requirements tab',
        'System Architecture & Data Flowchart tab',
        'Testing Verification Report tab (100% Passed)',
        'Copyable GitHub README.md markdown'
      ],
      previewContent: (
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-medium text-[11px]">
            1. Software Requirements Specification (SRS)
          </div>
        </div>
      )
    }
  ];

  const categories = ['ALL', 'Auth & Welcome', 'Core Analysis', 'Analytics & Alerts', 'Tools & Management', 'Documentation'];

  const filteredPages = pagesList.filter(p => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans-calm bg-transparent min-h-full">
      
      {/* Top Banner */}
      <div className="calm-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Module Showcase & Interface Previews
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual breakdown and direct navigation shortcuts for all 12 application views.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-slate-800 text-indigo-300 border border-slate-700/60 rounded-lg text-xs font-mono-calm">
          {pagesList.length} Views Available
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-medium shrink-0">Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Pages Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPages.map((page) => {
          const Icon = page.icon;
          return (
            <div
              key={page.id}
              className="calm-card rounded-xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-slate-100">
                      {page.title}
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[10px] font-mono-calm rounded border border-slate-800">
                    {page.category}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {page.description}
                </p>

                {/* Mock Visual Screenshot Container */}
                <div className="mt-1">
                  <span className="text-[10px] text-slate-500 font-medium uppercase block mb-1">
                    Interface Preview:
                  </span>
                  {page.previewContent}
                </div>

                {/* Features List */}
                <div className="space-y-1 pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-300 font-medium text-[11px] block">
                    Key Features:
                  </span>
                  {page.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-400 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Action Button */}
              <button
                onClick={() => onSelectTab(page.tabTarget)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg border border-slate-700/60 transition-colors cursor-pointer flex items-center justify-center gap-1 mt-2"
              >
                <span>Open Live View</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
