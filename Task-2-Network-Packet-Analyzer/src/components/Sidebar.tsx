import React from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  SearchCode, 
  BarChart3, 
  ShieldAlert, 
  FileSpreadsheet, 
  Settings,
  ArrowLeft,
  ShieldCheck,
  Bot,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  alertCount: number;
  incidentCount?: number;
  pendingApprovalsCount?: number;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  alertCount, 
  incidentCount = 0,
  pendingApprovalsCount = 0,
  onSignOut
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'RADAR', number: '01', icon: LayoutDashboard },
    { id: 'capture', label: 'CAPTURE', number: '02', icon: Radio },
    { id: 'analysis', label: 'FORENSICS', number: '03', icon: SearchCode },
    { id: 'alerts', label: 'THREATS', number: '04', icon: ShieldAlert, badge: alertCount },
    { id: 'incidents', label: 'INCIDENTS', number: '05', icon: Bot, badge: incidentCount || (pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined) },
    { id: 'evidence', label: 'EVIDENCE', number: '06', icon: ShieldCheck },
    { id: 'reports', label: 'REPORTS', number: '07', icon: FileSpreadsheet },
    { id: 'settings', label: 'SYSTEM', number: '08', icon: Settings }
  ];

  return (
    <aside className="w-64 sovereign-sidebar flex flex-col justify-between select-none z-30 shrink-0">
      
      <div className="py-5 px-3 space-y-6">
        
        {/* Navigation Section Label */}
        <div className="px-3">
          <p 
            className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold font-display"
            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
          >
            Workstation Modules
          </p>
        </div>

        {/* Navigation Items: 01 to 08 */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm backdrop-blur-md'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                {/* White Active Left Indicator */}
                {isActive && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-white rounded-full" />
                )}

                <div className="flex items-center gap-3 pl-1.5">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`} />
                  <span 
                    className="tracking-wider text-[11px] font-bold font-display"
                    style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#EF4444] text-white font-bold text-[10px]">
                      {item.badge}
                    </span>
                  ) : (
                    <span 
                      className={`text-[10px] font-display ${isActive ? 'text-white/80' : 'text-white/30'}`}
                      style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                    >
                      {item.number}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Footer: Return to Homepage + Status */}
      <div className="p-3 border-t border-white/[0.08] space-y-1.5">
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer border border-transparent hover:border-red-500/20 font-ui"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Lock</span>
            </span>
            <span className="text-[10px] font-mono text-red-400/60">EXIT</span>
          </button>
        )}

        <button
          onClick={() => onSelectTab('landing')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer border border-transparent hover:border-white/10 font-ui"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-white/70" />
            <span>Return to Home</span>
          </span>
          <span className="text-[10px] font-mono text-white/40">ESC</span>
        </button>

        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/60 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-white/90">eth0</span>
          </span>
          <span className="text-[10px] text-white/40 uppercase">Promiscuous</span>
        </div>
      </div>

    </aside>
  );
};
