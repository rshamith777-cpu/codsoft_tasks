import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Flag,
  Search,
  Bot,
  ListFilter,
  Radio,
  Crosshair
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { ThreatAlert, CaptureMode, IOCItem } from '../types';
import { PageHeader } from './common/PageHeader';
import { StatusBadge } from './common/StatusBadge';

interface ThreatAlertsViewProps {
  alerts: ThreatAlert[];
  captureMode?: CaptureMode;
  onTriggerAttack: (attackType: string) => void;
  onAnalyzeAlertWithAI: (alert: ThreatAlert) => void;
  onResolveAlert: (id: string) => void;
  onInvestigateAlert?: (alert: ThreatAlert) => void;
  onMarkFalsePositive?: (alert: ThreatAlert, reason: string) => void;
}

export const ThreatAlertsView: React.FC<ThreatAlertsViewProps> = ({
  alerts,
  captureMode = 'IDLE',
  onTriggerAttack,
  onAnalyzeAlertWithAI,
  onResolveAlert,
  onInvestigateAlert,
  onMarkFalsePositive
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity.toUpperCase() !== filterSeverity.toUpperCase()) return false;
    return true;
  });

  // Calculate Real 6-Axis MITRE ATT&CK Tactical Threat Radar
  const reconAlerts = alerts.filter(a => a.alertType?.includes('Scan') || a.alertType?.includes('Sweep') || a.mitreTechnique?.includes('T1046') || a.mitreTechnique?.includes('Discovery')).length;
  const dosAlerts = alerts.filter(a => a.alertType?.includes('Flood') || a.mitreTechnique?.includes('T1498') || a.alertType?.includes('SYN') || a.alertType?.includes('ICMP')).length;
  const c2Alerts = alerts.filter(a => a.alertType?.includes('Beacon') || a.alertType?.includes('C2') || a.mitreTechnique?.includes('T1071')).length;
  const lateralAlerts = alerts.filter(a => a.alertType?.includes('Lateral') || a.mitreTechnique?.includes('T1021') || a.alertType?.includes('SMB')).length;
  const credAlerts = alerts.filter(a => a.alertType?.includes('Brute') || a.alertType?.includes('Credential') || a.mitreTechnique?.includes('T1110') || a.mitreTechnique?.includes('T1552')).length;
  const exfilAlerts = alerts.filter(a => a.alertType?.includes('Exfiltration') || a.mitreTechnique?.includes('T1041') || a.alertType?.includes('Jumbo')).length;

  const threatRadarData = [
    {
      tactic: 'Reconnaissance',
      count: reconAlerts,
      score: reconAlerts === 0 ? 10 : Math.min(100, 25 + reconAlerts * 25),
      fullMark: 100
    },
    {
      tactic: 'Denial of Service',
      count: dosAlerts,
      score: dosAlerts === 0 ? 10 : Math.min(100, 25 + dosAlerts * 25),
      fullMark: 100
    },
    {
      tactic: 'Command & Control',
      count: c2Alerts,
      score: c2Alerts === 0 ? 10 : Math.min(100, 25 + c2Alerts * 25),
      fullMark: 100
    },
    {
      tactic: 'Lateral Movement',
      count: lateralAlerts,
      score: lateralAlerts === 0 ? 10 : Math.min(100, 25 + lateralAlerts * 25),
      fullMark: 100
    },
    {
      tactic: 'Credential Access',
      count: credAlerts,
      score: credAlerts === 0 ? 10 : Math.min(100, 25 + credAlerts * 25),
      fullMark: 100
    },
    {
      tactic: 'Exfiltration',
      count: exfilAlerts,
      score: exfilAlerts === 0 ? 10 : Math.min(100, 25 + exfilAlerts * 25),
      fullMark: 100
    }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-ui">
      
      {/* 04 / Page Title Header */}
      <PageHeader
        number="04"
        category="INTRUSION DETECTION"
        title="THREAT RADAR"
        description="Active heuristic intrusion detection, automated MITRE ATT&CK mapping, and automated anomaly triage."
        captureMode={captureMode}
      >
        {/* Attack Simulator Suite */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/[0.05] rounded-full border border-white/10 font-mono text-xs backdrop-blur-md">
          <span 
            className="text-white/50 px-2 text-[10px] uppercase font-bold font-display"
            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
          >
            Inject Test Vector:
          </span>
          <button
            onClick={() => onTriggerAttack('Port Scan')}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 text-xs transition-all cursor-pointer font-display"
            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
          >
            + SYN Port Scan
          </button>
          <button
            onClick={() => onTriggerAttack('Ping Flood')}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 text-xs transition-all cursor-pointer font-display"
            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
          >
            + ICMP Flood
          </button>
          <button
            onClick={() => onTriggerAttack('Suspicious IP')}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 text-xs transition-all cursor-pointer font-display"
            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
          >
            + C2 Beacon
          </button>
        </div>
      </PageHeader>

      {/* MITRE ATT&CK TACTICAL RADAR HERO PANEL */}
      <div className="sovereign-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[#EF4444]" />
              <h2 
                className="text-xs font-bold text-white tracking-wider uppercase font-display"
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                MITRE ATT&CK Tactical Threat Radar
              </h2>
            </div>
            <p className="text-[11px] text-white/60 font-mono mt-0.5">
              Live heuristic correlation mapped across adversary tactics and persistence vectors
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/50">
            <span>ACTIVE VECTORS:</span>
            <span className="font-bold text-[#EF4444]">{alerts.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          {/* Radar Chart Visual (3 Columns) */}
          <div className="md:col-span-3 h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={threatRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="tactic" 
                  stroke="rgba(255,255,255,0.7)" 
                  fontSize={10} 
                  tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 10, fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={9} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} 
                />
                <Radar 
                  name="Adversary Vector Intensity" 
                  dataKey="score" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fill="#EF4444" 
                  fillOpacity={0.30} 
                  dot={{ r: 3.5, fill: '#F59E0B', stroke: '#ffffff', strokeWidth: 1 }}
                  isAnimationActive={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 7, 12, 0.95)', 
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#ffffff'
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Tactic Vector Badges (2 Columns) */}
          <div className="md:col-span-2 space-y-2 font-mono text-xs">
            {threatRadarData.map((axis) => (
              <div key={axis.tactic} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div 
                    className="text-[11px] font-bold text-white tracking-wide font-display"
                    style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                  >
                    {axis.tactic}
                  </div>
                  <div className="text-[10px] text-white/50">{axis.count} detected threats</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold font-mono ${axis.count > 0 ? 'text-[#EF4444]' : 'text-white/40'}`}>
                    {axis.count > 0 ? `${axis.score}/100` : 'STANDBY'}
                  </div>
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        axis.count > 0 ? 'bg-[#EF4444]' : 'bg-white/20'
                      }`} 
                      style={{ width: `${axis.score}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span 
            className="text-white/50 mr-1 text-[11px] uppercase font-bold font-display"
            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
          >
            Filter:
          </span>
          {['ALL', 'High', 'Medium', 'Low'].map((sev) => {
            const isSelected = filterSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3.5 py-1 rounded-full transition-all cursor-pointer font-display ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/[0.05] text-white/60 hover:text-white border border-white/10 backdrop-blur-md'
                }`}
                style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
              >
                {sev}
              </button>
            );
          })}
        </div>

        <span className="text-white/50 text-[11px]">
          Displaying <strong className="text-white font-semibold">{filteredAlerts.length}</strong> active threat vectors
        </span>
      </div>

      {/* THREAT ALERT CARDS */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="sovereign-panel p-12 text-center text-white/50 font-mono">
            <ShieldCheck className="w-10 h-10 text-[#10B981] mx-auto mb-2 opacity-80" />
            <p className="text-white text-sm font-semibold">Zero Active Threat Vectors Detected</p>
            <p className="text-xs text-white/50 mt-1">Network traffic parameters conform to baseline heuristic boundaries.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'Resolved';
            const isSim = alert.isSimulation || alert.alertType?.includes('Simulation') || alert.description?.includes('DEMO');
            return (
              <div 
                key={alert.id}
                className={`sovereign-panel p-5 space-y-3 transition-all ${
                  isResolved ? 'opacity-50' : 'border-white/[0.10] hover:border-[#EF4444]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 
                          className="text-sm font-bold text-white font-display"
                          style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                        >
                          {alert.alertType}
                        </h3>
                        <StatusBadge 
                          status={alert.severity.toUpperCase()} 
                          label={`${alert.severity.toUpperCase()} SEVERITY`} 
                        />
                        {isSim && (
                          <span 
                            className="px-2 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold font-display"
                            style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                          >
                            SIMULATION VECTOR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/50 font-mono mt-0.5">
                        Vector ID: {alert.id} • Detected: {alert.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-display text-xs flex-wrap" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>
                    {onInvestigateAlert && (
                      <button
                        onClick={() => onInvestigateAlert(alert)}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
                        title="Investigate in Incident Workspace"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Investigate</span>
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => onAnalyzeAlertWithAI(alert)}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Copilot</span>
                      </button>
                    )}

                    {onMarkFalsePositive && !isResolved && (
                      <button
                        onClick={() => {
                          const reason = prompt('State reason for marking this alert as false positive:') || 'Benign local developer/admin activity';
                          onMarkFalsePositive(alert, reason);
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        title="Mark as false positive (informs Detection Engineering Agent)"
                      >
                        <Flag className="w-3 h-3 text-[#F59E0B]" />
                        <span>False +</span>
                      </button>
                    )}

                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                        isResolved
                          ? 'bg-white/5 text-white/40 border-white/10'
                          : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{isResolved ? 'Resolved' : 'Dismiss'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <p className="text-white/80 leading-relaxed font-ui text-sm">{alert.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-white/60">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-white/40 block text-[10px] uppercase">Source IP</span>
                      <span className="text-white font-medium">{alert.sourceIp}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-white/40 block text-[10px] uppercase">Target Endpoint</span>
                      <span className="text-white font-medium">{alert.destinationIp || alert.destIp || '192.168.1.10'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-white/40 block text-[10px] uppercase">MITRE ATT&CK Mapping</span>
                      <span className="text-[#F59E0B] font-medium">{alert.mitreTechnique || alert.mitreId || 'T1046 Network Discovery'}</span>
                    </div>
                  </div>

                  {alert.recommendedAction && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/70 text-[11px] flex items-center gap-2">
                      <span className="text-white font-semibold text-[10px] uppercase tracking-wider text-white/40">Action:</span>
                      <span>{alert.recommendedAction}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
