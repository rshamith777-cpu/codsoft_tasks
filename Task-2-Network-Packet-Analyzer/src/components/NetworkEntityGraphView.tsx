import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  Search, 
  ShieldAlert, 
  Server, 
  Globe, 
  Activity, 
  ArrowRight,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { Packet, ThreatAlert, Incident, EntityNode, EntityEdge } from '../types';

interface NetworkEntityGraphViewProps {
  packets: Packet[];
  alerts: ThreatAlert[];
  incidents: Incident[];
  onSelectEntity: (entityId: string, entityType: string) => void;
  onSelectPacket?: (pkt: Packet) => void;
}

export const NetworkEntityGraphView: React.FC<NetworkEntityGraphViewProps> = ({
  packets,
  alerts,
  incidents,
  onSelectEntity,
  onSelectPacket
}) => {
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract nodes and edges deterministically from actual traffic
  const graphData = useMemo(() => {
    const nodesMap = new Map<string, EntityNode>();
    const edgesList: EntityEdge[] = [];

    // Process packets
    packets.slice(0, 100).forEach(p => {
      const src = p.sourceIp;
      const dst = p.destinationIp;
      const port = String(p.destinationPort);
      const proto = p.protocol;

      if (src && !nodesMap.has(src)) {
        nodesMap.set(src, { id: src, label: src, type: 'IP', packetCount: 1, connections: 1 });
      } else if (src) {
        nodesMap.get(src)!.packetCount = (nodesMap.get(src)!.packetCount || 0) + 1;
      }

      if (dst && !nodesMap.has(dst)) {
        nodesMap.set(dst, { id: dst, label: dst, type: 'IP', packetCount: 1, connections: 1 });
      } else if (dst) {
        nodesMap.get(dst)!.packetCount = (nodesMap.get(dst)!.packetCount || 0) + 1;
      }

      if (src && dst) {
        const edgeId = `${src}->${dst}`;
        const existing = edgesList.find(e => e.id === edgeId);
        if (!existing) {
          edgesList.push({
            id: edgeId,
            source: src,
            target: dst,
            relation: 'COMMUNICATES_WITH',
            weight: 1,
            protocol: proto
          });
        } else {
          existing.weight++;
        }
      }
    });

    // Process alerts
    alerts.slice(0, 30).forEach(a => {
      nodesMap.set(a.id, {
        id: a.id,
        label: a.alertType,
        type: 'ALERT',
        severity: a.severity as any
      });

      if (a.sourceIp && nodesMap.has(a.sourceIp)) {
        edgesList.push({
          id: `${a.sourceIp}->${a.id}`,
          source: a.sourceIp,
          target: a.id,
          relation: 'TRIGGERED_ALERT',
          weight: 2
        });
      }
    });

    // Process incidents
    incidents.slice(0, 15).forEach(inc => {
      nodesMap.set(inc.id, {
        id: inc.id,
        label: inc.title,
        type: 'INCIDENT',
        severity: inc.severity as any
      });

      if (inc.sourceHost && nodesMap.has(inc.sourceHost)) {
        edgesList.push({
          id: `${inc.sourceHost}->${inc.id}`,
          source: inc.sourceHost,
          target: inc.id,
          relation: 'ASSOCIATED_WITH',
          weight: 3
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      edges: edgesList
    };
  }, [packets, alerts, incidents]);

  // Filtered nodes
  const filteredNodes = graphData.nodes.filter(n => {
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-4 font-ui">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-white/80" />
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight uppercase font-mono">
              Network Entity Relationship Topology
            </h3>
            <p className="text-[11px] text-white/50 font-mono">
              Deterministic communication graph linking observed Hosts, Ingress Ports, Alerts, and Correlated Incidents.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/10 text-[11px]">
            {['ALL', 'IP', 'ALERT', 'INCIDENT'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterType === type ? 'bg-white text-black font-semibold shadow-sm' : 'text-white/60 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.05] border border-white/15 rounded-full px-3 py-1 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Entity Node Matrix Display */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-black/40 border border-white/[0.08] min-h-[380px] max-h-[480px] overflow-y-auto space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredNodes.length === 0 ? (
              <div className="col-span-full py-16 text-center text-white/40">
                No entities found matching active filter. Capture traffic or select ALL.
              </div>
            ) : (
              filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isAlert = node.type === 'ALERT';
                const isIncident = node.type === 'INCIDENT';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-white/15 border-white/40 shadow-lg scale-[1.02]'
                        : (isIncident 
                            ? 'bg-[#EF4444]/10 border-[#EF4444]/30 hover:bg-[#EF4444]/20' 
                            : (isAlert 
                                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 hover:bg-[#F59E0B]/20' 
                                : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07]'))
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        isIncident ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                        isAlert ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-white/10 text-white/70'
                      }`}>
                        {node.type}
                      </span>
                      {node.packetCount && (
                        <span className="text-[10px] text-white/40">{node.packetCount} pkts</span>
                      )}
                    </div>
                    <p className="font-bold text-white truncate text-xs">{node.label}</p>
                    <p className="text-[10px] text-white/40 truncate">{node.id}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Entity Inspector Side Drawer */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-4 font-mono text-xs">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div>
                  <span className="text-[10px] uppercase text-white/40 block">{selectedNode.type} Entity Detail</span>
                  <p className="text-sm font-bold text-white truncate font-ui">{selectedNode.label}</p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                  <span className="text-white/40 block text-[10px]">ENTITY IDENTIFIER</span>
                  <span className="text-white font-semibold break-all">{selectedNode.id}</span>
                </div>

                {selectedNode.severity && (
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                    <span className="text-white/40 block text-[10px]">ASSOCIATED SEVERITY</span>
                    <span className="text-[#EF4444] font-bold">{selectedNode.severity}</span>
                  </div>
                )}

                {/* Connected Edges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase text-white/40">Connected Relationships</span>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {graphData.edges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map(e => (
                        <div key={e.id} className="p-2 rounded bg-white/[0.04] text-[10px] space-y-0.5">
                          <span className="text-white/60 font-semibold">{e.relation}</span>
                          <p className="text-white/40 truncate">{e.source} → {e.target} ({e.weight}x)</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.08] space-y-2">
                <button
                  onClick={() => onSelectEntity(selectedNode.id, selectedNode.type)}
                  className="w-full py-2 px-3 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/90 cursor-pointer shadow-sm font-ui"
                >
                  <span>Filter Workspace by this Entity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-white/40 space-y-2">
              <Activity className="w-8 h-8 mx-auto opacity-30 text-white" />
              <p>Select any node in the topology matrix to inspect relationships and filter workspace telemetry.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
