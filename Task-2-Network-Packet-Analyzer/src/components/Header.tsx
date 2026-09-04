import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Play, 
  Pause, 
  Square, 
  Search, 
  Bell, 
  Shield, 
  FileText,
  Bot,
  Lock,
  Radio,
  Share2,
  Sparkles,
  LogOut
} from 'lucide-react';
import { NetworkInterface, ThreatAlert, CaptureMode, UserRole } from '../types';

interface HeaderProps {
  isCapturing: boolean;
  isPaused: boolean;
  captureMode: CaptureMode;
  onStart: () => void;
  onStartDemo: () => void;
  onPause: () => void;
  onStop: () => void;
  activeInterface: NetworkInterface;
  totalPackets: number;
  packetsPerSec: number;
  bandwidthKbps: number;
  alerts: ThreatAlert[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenDocs: () => void;
  onSelectTab: (tab: string) => void;
  userRole?: UserRole;
  setUserRole?: (role: UserRole) => void;
  pendingApprovalsCount?: number;
  onOpenCopilot?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleEntityGraph?: () => void;
  currentTab?: string;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isCapturing,
  isPaused,
  captureMode,
  onStart,
  onStartDemo,
  onPause,
  onStop,
  activeInterface,
  alerts,
  searchQuery,
  setSearchQuery,
  onSelectTab,
  userRole = 'ANALYST',
  setUserRole,
  pendingApprovalsCount = 0,
  onOpenCopilot,
  onOpenCommandPalette,
  onToggleEntityGraph,
  currentTab = 'dashboard',
  onSignOut,
  isAuthenticated = true,
  onOpenAuthModal
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const unreadAlerts = alerts.filter(a => a.status === 'New');

  const tabTitles: Record<string, string> = {
    dashboard: '01 OVERVIEW & RADAR',
    capture: '02 LIVE CAPTURE',
    analysis: '03 PACKET FORENSICS',
    alerts: '04 THREAT RADAR',
    statistics: '05 NETWORK ANALYTICS',
    incidents: '06 INCIDENTS & AGENTS',
    reports: '07 REPORTS & VAULT',
    settings: '08 SETTINGS & SECURITY',
    landing: 'HOME'
  };

  return (
    <header className="sovereign-header sticky top-0 z-40 px-5 py-3 transition-all select-none">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity Matching Homepage */}
        <div 
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          title="Return to Homepage"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-all">
            <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4 text-black fill-current" />
            </div>
          </div>
          <div>
            <h1 
              className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase flex items-center gap-1.5 leading-none font-display"
              style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
            >
              SOVEREIGN
            </h1>
            <p 
              className="text-[9px] text-white/60 font-display tracking-widest uppercase mt-1"
              style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
            >
              NETWORK PACKET ANALYZER
            </p>
          </div>
        </div>

        {/* Center: Breadcrumb & Quick Filter */}
        <div className="hidden lg:flex items-center gap-2.5 font-mono text-xs text-white/40 mx-2">
          <span>SOC</span>
          <span>//</span>
          <span 
            className="text-white font-bold text-xs tracking-wider font-display"
            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
          >
            {tabTitles[currentTab] || currentTab.toUpperCase()}
          </span>
        </div>

        {/* Center Search / Filter */}
        <div className="hidden md:flex flex-1 max-w-sm items-center relative font-mono text-xs mx-2">
          <Search className="w-3.5 h-3.5 absolute left-3.5 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter stream (IP / port / proto)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.05] text-white placeholder-white/40 text-xs rounded-full pl-9 pr-8 py-1.5 border border-white/10 focus:outline-none focus:border-white/30 transition-all font-mono backdrop-blur-md"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 text-xs text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Telemetry + Controls + System Ready + Analyst Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Command Palette Button */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/15 text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
              title="Open Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-white/50" />
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white/60 border border-white/15">Ctrl K</kbd>
            </button>
          )}

          {/* Topology Graph Button */}
          {onToggleEntityGraph && (
            <button
              onClick={onToggleEntityGraph}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/15 text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
              title="Toggle Entity Relationship Topology Graph"
            >
              <Share2 className="w-3.5 h-3.5 text-white/60" />
              <span>Topology</span>
            </button>
          )}
          
          {/* Status Indicators */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono backdrop-blur-md">
            {isCapturing && !isPaused && captureMode === 'LIVE' ? (
              <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                CAPTURE: ACTIVE
              </span>
            ) : isCapturing && !isPaused && captureMode === 'DEMO' ? (
              <span className="flex items-center gap-1.5 text-[#F59E0B] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                CAPTURE: DEMO
              </span>
            ) : isPaused ? (
              <span className="flex items-center gap-1.5 text-[#F59E0B] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                CAPTURE: PAUSED
              </span>
            ) : captureMode === 'PCAP' ? (
              <span className="flex items-center gap-1.5 text-[#3B82F6] font-semibold">
                <FileText className="w-3 h-3 text-[#3B82F6]" />
                CAPTURE: PCAP
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-white/70 font-semibold">
                <span className="w-2 h-2 rounded-full bg-white/40" />
                CAPTURE: IDLE
              </span>
            )}
            <span className="text-white/20">•</span>
            <span className="text-white/60">{activeInterface.name}</span>
            <span className="text-white/20">•</span>
            <span className="hidden xl:inline text-[#10B981]/90 font-medium">ENGINE: READY (15 RULES)</span>
            <span className="text-white/20 hidden xl:inline">•</span>
            <span className="hidden xl:inline text-white/60 font-medium">EVIDENCE: VERIFIED</span>
            <span className="text-white/20 hidden 2xl:inline">•</span>
            <span className="hidden 2xl:inline text-white/50 font-medium">RBAC: ENFORCED</span>
          </div>

          {/* Quick Stream Play/Pause Controls */}
          <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-full border border-white/10 backdrop-blur-md">
            {!isCapturing ? (
              <>
                <button
                  onClick={onStart}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-sm"
                  title="Start live packet capture on interface"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Live</span>
                </button>
                <button
                  onClick={onStartDemo}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full transition-all cursor-pointer border border-white/10"
                  title="Replay fixed 15-packet demo sequence"
                >
                  <Radio className="w-3 h-3 text-[#F59E0B]" />
                  <span className="hidden sm:inline">Demo</span>
                </button>
              </>
            ) : isPaused ? (
              <button
                onClick={onStart}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full transition-all cursor-pointer border border-white/10"
              >
                <Pause className="w-3 h-3 fill-current text-white" />
                <span>Pause</span>
              </button>
            )}

            {isCapturing && (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 text-xs font-medium rounded-full transition-all cursor-pointer"
                title="Stop capture session"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            )}
          </div>

          {/* Threat Alerts Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2 rounded-full bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
              aria-label="Threat alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden text-white">
                <div className="p-3 bg-white/[0.04] border-b border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
                    Threat Alerts ({alerts.length})
                  </span>
                  <button
                    onClick={() => {
                      onSelectTab('alerts');
                      setShowAlertsDropdown(false);
                    }}
                    className="text-[11px] text-white/70 hover:text-white hover:underline font-medium cursor-pointer font-mono"
                  >
                    View All →
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.05]">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-white/50">No security threats detected</div>
                  ) : (
                    alerts.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onSelectTab('alerts');
                          setShowAlertsDropdown(false);
                        }}
                        className="p-3 hover:bg-white/[0.04] transition-colors cursor-pointer text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#EF4444] flex items-center gap-1 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                            {a.alertType}
                          </span>
                          <span className="text-[10px] text-white/50 font-mono">{a.timestamp}</span>
                        </div>
                        <p className="text-white/60 text-[11px] line-clamp-1">{a.description}</p>
                        <span className="text-[10px] text-white/40 font-mono">Source: {a.sourceIp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Security Copilot Quick Launcher */}
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all cursor-pointer shadow-sm font-ui"
              title="Open Sovereign Security Copilot"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Copilot</span>
            </button>
          )}

          {/* Pending Approvals Warning Indicator */}
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => onSelectTab('incidents')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/40 text-[#F59E0B] font-mono text-[11px] font-bold transition-all cursor-pointer animate-pulse"
              title="Pending human-in-the-loop approvals require decision"
            >
              <Lock className="w-3 h-3" />
              <span>{pendingApprovalsCount} Approval{pendingApprovalsCount > 1 ? 's' : ''}</span>
            </button>
          )}

          {/* User Role Switcher Dropdown */}
          <div className="relative flex items-center gap-2 pl-2 border-l border-white/[0.09]">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 text-left cursor-pointer group"
              title="Change active workstation role"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/15 flex items-center justify-center text-white font-medium text-xs transition-all">
                <span className="font-mono text-[10px] font-bold text-white">
                  {userRole === 'ADMIN' ? 'ADM' : (userRole === 'VIEWER' ? 'VWR' : 'SOC')}
                </span>
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold text-white leading-none font-ui tracking-wide group-hover:text-white/80">
                  {userRole}
                </p>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">Switch Role ▾</p>
              </div>
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 top-11 w-48 bg-black/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50 p-2 space-y-1 font-mono text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase text-white/40 border-b border-white/[0.08]">
                  Select Workstation Role
                </div>
                {(['ADMIN', 'ANALYST', 'VIEWER'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      if (setUserRole) setUserRole(role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      userRole === role ? 'bg-white text-black font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{role}</span>
                    <span className="text-[10px] opacity-60">
                      {role === 'ADMIN' ? 'Full Control' : (role === 'ANALYST' ? 'Investigate' : 'Read-Only')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sign Out / Lock Workstation Button */}
          {isAuthenticated && onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 text-white/70 border border-white/10 text-xs font-mono transition-all cursor-pointer"
              title="Sign Out / Lock Workstation"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          {!isAuthenticated && onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold font-mono transition-all cursor-pointer shadow-md"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
