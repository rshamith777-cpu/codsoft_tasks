import React from 'react';
import { 
  Download,
  Play,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';
import { CaptureStats, Packet, CaptureMode } from '../types';
import { PageHeader } from './common/PageHeader';

interface StatisticsViewProps {
  stats: CaptureStats;
  packets: Packet[];
  captureMode?: CaptureMode;
  onExport: (format: 'csv' | 'json' | 'txt') => void;
  onStartLive?: () => void;
  onLoadDemoDataset?: () => void;
}

const STAT_COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

export const StatisticsView: React.FC<StatisticsViewProps> = ({ 
  stats, 
  packets,
  captureMode = 'IDLE',
  onExport,
  onStartLive,
  onLoadDemoDataset
}) => {
  const protocolData = [
    { name: 'TCP', value: stats.tcpCount || 0 },
    { name: 'UDP', value: stats.udpCount || 0 },
    { name: 'ICMP', value: stats.icmpCount || 0 },
    { name: 'ARP', value: stats.arpCount || 0 },
    { name: 'DNS', value: stats.dnsCount || 0 },
    { name: 'HTTP', value: stats.httpCount || 0 },
    { name: 'HTTPS', value: stats.httpsCount || 0 },
  ].filter(p => p.value > 0);

  // Compute Real Top Talkers from Packets Array
  const ipMap: Record<string, { sentBytes: number; recvBytes: number }> = {};
  packets.forEach(p => {
    if (p.sourceIp) {
      if (!ipMap[p.sourceIp]) ipMap[p.sourceIp] = { sentBytes: 0, recvBytes: 0 };
      ipMap[p.sourceIp].sentBytes += p.length || 64;
    }
    if (p.destinationIp) {
      if (!ipMap[p.destinationIp]) ipMap[p.destinationIp] = { sentBytes: 0, recvBytes: 0 };
      ipMap[p.destinationIp].recvBytes += p.length || 64;
    }
  });

  const ipTrafficData = Object.entries(ipMap)
    .map(([ip, data]) => ({
      ip,
      sent: data.sentBytes,
      recv: data.recvBytes,
      total: data.sentBytes + data.recvBytes
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const hasData = packets.length > 0;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-ui">
      
      {/* 05 / Page Title Header */}
      <PageHeader
        number="05"
        category="NETWORK INTELLIGENCE"
        title="NETWORK ANALYTICS"
        description="Protocol breakdown, endpoint conversation matrices, and longitudinal network throughput distribution."
        captureMode={captureMode}
      >
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => onExport('csv')}
            disabled={!hasData}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-white/60" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onExport('json')}
            disabled={!hasData}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-white/60" />
            <span>Export JSON</span>
          </button>
        </div>
      </PageHeader>

      {!hasData ? (
        <div className="sovereign-panel p-12 text-center text-white/50 font-mono space-y-4">
          <p className="text-base text-white font-semibold">No Network Traffic Telemetry Available</p>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Analytics require active or imported packet frames to calculate protocol distribution, top talkers, and throughput velocity.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2 font-mono text-xs">
            {onStartLive && (
              <button
                onClick={onStartLive}
                className="px-4 py-2 rounded-full bg-white text-black font-semibold hover:bg-white/90 cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live Capture</span>
              </button>
            )}
            {onLoadDemoDataset && (
              <button
                onClick={onLoadDemoDataset}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Load Demo Dataset</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Protocol Donut Chart */}
          <div className="sovereign-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Protocol Composition
              </h3>
              <span className="text-[10px] font-mono text-white/50">L3 / L4 / L7 LAYERS</span>
            </div>

            <div className="h-56 w-full">
              {protocolData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={protocolData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {protocolData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STAT_COLORS[index % STAT_COLORS.length]} stroke="rgba(5,7,12,0.8)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(5, 7, 12, 0.92)', 
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#ffffff'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/40 font-mono text-xs">
                  No protocol breakdown available
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
              {protocolData.map((item, idx) => (
                <div key={item.name} className="flex flex-col">
                  <span className="text-white/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STAT_COLORS[idx % STAT_COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="text-white font-semibold">{item.value} frames</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Talkers Endpoint Matrix */}
          <div className="sovereign-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Top Communicating Hosts (Bytes)
              </h3>
              <span className="text-[10px] font-mono text-white/50">CONVERSATION MATRIX</span>
            </div>

            <div className="h-56 w-full">
              {ipTrafficData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ipTrafficData} layout="vertical">
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis dataKey="ip" type="category" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(5, 7, 12, 0.92)', 
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#ffffff'
                      }} 
                    />
                    <Bar dataKey="sent" name="Bytes Sent" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="recv" name="Bytes Recv" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/40 font-mono text-xs">
                  No IP conversations recorded
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 text-[11px] font-mono text-white/60 pt-2 border-t border-white/[0.06]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Bytes Ingress / Sent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Bytes Egress / Recv
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 sovereign-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Longitudinal Traffic Ingestion Rate
                </h3>
                <p className="text-[11px] text-white/50 font-mono mt-0.5">Rolling throughput record</p>
              </div>
            </div>

            <div className="h-56 w-full">
              {stats.timelineData && stats.timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.timelineData}>
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(5, 7, 12, 0.92)', 
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#ffffff'
                      }} 
                    />
                    <Line type="monotone" dataKey="bandwidth" stroke="#3B82F6" strokeWidth={2} dot={false} name="Throughput (Kbps)" isAnimationActive={false} />
                    <Line type="monotone" dataKey="packets" stroke="#10B981" strokeWidth={2} dot={false} name="Frames / sec" isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/40 font-mono text-xs">
                  Awaiting continuous capture to display rate distribution
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
