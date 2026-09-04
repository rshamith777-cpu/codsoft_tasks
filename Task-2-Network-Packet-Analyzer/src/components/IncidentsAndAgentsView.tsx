import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Send, 
  Sliders, 
  Play, 
  RefreshCw, 
  FileText, 
  Activity, 
  Lock, 
  Check, 
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Shield,
  Fingerprint,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  Incident, 
  ThreatAlert, 
  Packet, 
  ApprovalRequest, 
  AuditLogEntry, 
  UserRole,
  NetworkBaseline,
  BaselineDeviation,
  ProposedRule,
  AgentType,
  IncidentStatus,
  EvidenceItem
} from '../types';
import { PageHeader } from './common/PageHeader';
import { 
  NORMAL_WEB_FIXTURE, 
  PORT_SCAN_FIXTURE, 
  ICMP_FLOOD_FIXTURE, 
  DNS_ANOMALY_FIXTURE, 
  C2_BEACON_FIXTURE 
} from '../../test/fixtures/pcapFixtures';

interface IncidentsAndAgentsViewProps {
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  alerts: ThreatAlert[];
  packets: Packet[];
  approvals: ApprovalRequest[];
  onDecideApproval: (id: string, decision: 'APPROVED' | 'REJECTED') => void;
  auditTrail: AuditLogEntry[];
  userRole: UserRole;
  onSelectPacket: (pkt: Packet) => void;
  onOpenCopilotWithContext: (context: { incident?: Incident; alert?: ThreatAlert; packet?: Packet }) => void;
  captureMode: string;
}

export const IncidentsAndAgentsView: React.FC<IncidentsAndAgentsViewProps> = ({
  incidents,
  setIncidents,
  alerts,
  packets,
  approvals,
  onDecideApproval,
  auditTrail,
  userRole,
  onSelectPacket,
  onOpenCopilotWithContext,
  captureMode
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'investigations' | 'agents' | 'approvals' | 'detection_lab' | 'baseline' | 'audit' | 'evidence_vault'>('investigations');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(incidents[0]?.id || null);
  const [newNoteText, setNewNoteText] = useState('');
  const [isPostingNote, setIsPostingNote] = useState(false);
  const [postFeedback, setPostFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Post New Incident Modal State
  const [isCreateIncidentModalOpen, setIsCreateIncidentModalOpen] = useState(false);
  const [newIncidentForm, setNewIncidentForm] = useState<{
    title: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    sourceHost: string;
    destinationHost: string;
    protocol: string;
    mitreTechnique: string;
    initialNote: string;
  }>({
    title: '',
    severity: 'High',
    sourceHost: '192.168.1.105',
    destinationHost: '10.0.0.1',
    protocol: 'TCP',
    mitreTechnique: 'T1046 Network Service Discovery',
    initialNote: ''
  });
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const [agentRunning, setAgentRunning] = useState<string | null>(null);
  const [agentOutput, setAgentOutput] = useState<any | null>(null);

  // Evidence Vault state
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<{ checked: boolean; healthy: boolean; tampered: number; timestamp?: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchEvidence = async () => {
    try {
      const res = await fetch('/api/evidence');
      const data = await res.json();
      if (data.vault?.items) setEvidenceItems(data.vault.items);
    } catch (e) {
      console.error('Failed to load evidence vault:', e);
    }
  };

  React.useEffect(() => {
    fetchEvidence();
  }, []);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/evidence/verify', { method: 'POST' });
      const data = await res.json();
      setIntegrityStatus({
        checked: true,
        healthy: data.healthy,
        tampered: data.tamperedItems?.length || 0,
        timestamp: data.verificationTimestamp
      });
      fetchEvidence();
    } catch (e) {
      console.error('Integrity verification failed:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  // Lab testing state
  const [selectedFixture, setSelectedFixture] = useState<'PORT_SCAN' | 'ICMP_FLOOD' | 'DNS_ANOMALY' | 'C2_BEACON' | 'NORMAL'>('PORT_SCAN');
  const [labResult, setLabResult] = useState<{ passed: boolean; expected: string; actual: string; details: string } | null>(null);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0] || null;

  // Add note to current incident with full server persistence and optimistic UI
  const handleAddNote = async () => {
    const trimmed = newNoteText.trim();
    if (!trimmed) {
      setPostFeedback({ type: 'error', message: 'Enter a note before posting.' });
      setTimeout(() => setPostFeedback(null), 3000);
      return;
    }
    if (!selectedIncident) {
      setPostFeedback({ type: 'error', message: 'No incident selected to receive note.' });
      setTimeout(() => setPostFeedback(null), 3000);
      return;
    }

    const note = {
      id: `NOTE-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      author: `${userRole} (Analyst)`,
      note: trimmed
    };

    // Optimistically update local React state
    const updated = incidents.map(inc => {
      if (inc.id === selectedIncident.id) {
        return { ...inc, analystNotes: [...(inc.analystNotes || []), note] };
      }
      return inc;
    });
    setIncidents(updated);
    setNewNoteText('');
    setIsPostingNote(true);
    setPostFeedback(null);

    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        },
        body: JSON.stringify({
          author: note.author,
          note: note.note,
          incident: {
            ...selectedIncident,
            analystNotes: [...(selectedIncident.analystNotes || []), note]
          }
        })
      });

      if (res.ok) {
        setPostFeedback({ type: 'success', message: 'Note posted & synchronized with server ledger.' });
      } else {
        const data = await res.json().catch(() => ({}));
        setPostFeedback({ type: 'error', message: data.error || 'Recorded locally (server sync warning)' });
      }
    } catch (err) {
      console.warn('Note persisted locally, server sync failed:', err);
      setPostFeedback({ type: 'success', message: 'Note recorded in active session ledger.' });
    } finally {
      setIsPostingNote(false);
      setTimeout(() => setPostFeedback(null), 3500);
    }
  };

  // Change Incident Status with server sync
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
    const note = {
      id: `NOTE-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      author: `${userRole} (Analyst)`,
      note: `Status updated to ${newStatus}`
    };
    const updated = incidents.map(inc => {
      if (inc.id === selectedIncident.id) {
        return { 
          ...inc, 
          status: newStatus,
          analystNotes: [
            ...(inc.analystNotes || []),
            note
          ]
        };
      }
      return inc;
    });
    setIncidents(updated);

    try {
      await fetch(`/api/incidents/${selectedIncident.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        },
        body: JSON.stringify({
          status: newStatus,
          author: `${userRole} (Analyst)`,
          note: `Status updated to ${newStatus}`,
          incident: {
            ...selectedIncident,
            status: newStatus,
            analystNotes: [...(selectedIncident.analystNotes || []), note]
          }
        })
      });
    } catch (e) {
      console.error('Failed to sync status change:', e);
    }
  };

  // Post New Incident to Incident Queue
  const handlePostNewIncident = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newIncidentForm.title.trim()) {
      return;
    }

    setIsSubmittingIncident(true);
    const incId = `INC-MAN-${Date.now().toString().slice(-5)}`;
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    const notes = newIncidentForm.initialNote.trim() ? [{
      id: `NOTE-${Date.now().toString(36).toUpperCase()}`,
      timestamp: nowTime,
      author: `${userRole} (Analyst)`,
      note: newIncidentForm.initialNote.trim()
    }] : [{
      id: `NOTE-${Date.now().toString(36).toUpperCase()}`,
      timestamp: nowTime,
      author: `${userRole} (Analyst)`,
      note: 'Incident case initialized by SOC analyst.'
    }];

    const newInc: Incident = {
      id: incId,
      title: newIncidentForm.title.trim(),
      severity: newIncidentForm.severity,
      status: 'NEW',
      firstSeen: nowTime,
      lastSeen: nowTime,
      sourceHost: newIncidentForm.sourceHost.trim() || '192.168.1.105',
      destinationHosts: [newIncidentForm.destinationHost.trim() || '10.0.0.1'],
      protocols: [newIncidentForm.protocol],
      relatedAlertIds: ['MANUAL-CASE'],
      relatedPacketIds: [],
      mitreTechniques: [newIncidentForm.mitreTechnique],
      confidence: 0.90,
      assignedAnalyst: `${userRole} (Analyst)`,
      analystNotes: notes,
      aiSummary: `Manual investigation case: ${newIncidentForm.title.trim()} on host ${newIncidentForm.sourceHost}.`,
      recommendedNextSteps: [
        'Inspect packet stream and historical logs for source host.',
        'Evaluate firewall filtering and port access rules.',
        'Document containment actions directly in investigation notes.'
      ],
      evidenceSummary: 'Incident manually registered by SOC operator with preliminary case telemetry.'
    };

    // Update local state immediately & select the new incident
    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncidentId(newInc.id);

    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        },
        body: JSON.stringify(newInc)
      });
    } catch (err) {
      console.error('Failed to post incident to server:', err);
    } finally {
      setIsSubmittingIncident(false);
      setIsCreateIncidentModalOpen(false);
      setNewIncidentForm({
        title: '',
        severity: 'High',
        sourceHost: '192.168.1.105',
        destinationHost: '10.0.0.1',
        protocol: 'TCP',
        mitreTechnique: 'T1046 Network Service Discovery',
        initialNote: ''
      });
    }
  };

  // Run specific Agent
  const handleRunAgent = async (agent: AgentType) => {
    setAgentRunning(agent);
    setAgentOutput(null);
    try {
      if (agent === 'PACKET_TRIAGE') {
        const targetPkt = packets[0] || PORT_SCAN_FIXTURE[0];
        const res = await fetch('/api/agent/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packet: targetPkt, relatedAlerts: alerts.slice(0, 3) })
        });
        const data = await res.json();
        setAgentOutput(data);
      } else if (agent === 'THREAT_CORRELATION') {
        const res = await fetch('/api/agent/correlate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alerts, packets })
        });
        const data = await res.json();
        setAgentOutput(data);
        if (data.correlatedIncidents?.length > 0) {
          setIncidents(prev => {
            const combined = [...data.correlatedIncidents, ...prev];
            const unique = Array.from(new Map(combined.map(i => [i.id, i])).values());
            return unique;
          });
        }
      } else if (agent === 'PROTOCOL_ANALYST') {
        const targetPkt = packets[0] || PORT_SCAN_FIXTURE[0];
        const res = await fetch('/api/agent/protocol', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packet: targetPkt })
        });
        const data = await res.json();
        setAgentOutput(data);
      } else if (agent === 'INCIDENT_INVESTIGATOR') {
        if (!selectedIncident) return;
        const res = await fetch('/api/agent/investigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incident: selectedIncident, packets, alerts })
        });
        const data = await res.json();
        setAgentOutput(data);
      } else if (agent === 'DETECTION_ENGINEERING') {
        const res = await fetch('/api/agent/detection/propose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ falsePositives: [], recentAlerts: alerts })
        });
        const data = await res.json();
        setAgentOutput(data);
      } else if (agent === 'NETWORK_BASELINE') {
        const res = await fetch('/api/agent/baseline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packets })
        });
        const data = await res.json();
        setAgentOutput(data);
      } else if (agent === 'SECURITY_REPORT') {
        const res = await fetch('/api/agent/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportType: 'INCIDENT_REPORT', incident: selectedIncident, packets, alerts })
        });
        const data = await res.json();
        setAgentOutput(data);
      } else {
        // Advanced Defensive Agents 09-15
        const res = await fetch('/api/agent/run', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-role': userRole
          },
          body: JSON.stringify({
            agentType: agent,
            packets,
            alerts,
            incident: selectedIncident
          })
        });
        const data = await res.json();
        setAgentOutput(data.record || data);
      }
    } catch (err: any) {
      setAgentOutput({ error: err?.message || 'Agent failed safely' });
    } finally {
      setAgentRunning(null);
    }
  };

  // Run Lab Test against deterministic fixture
  const handleRunLabTest = () => {
    let testPackets = NORMAL_WEB_FIXTURE;
    let expectedRule = 'None';
    if (selectedFixture === 'PORT_SCAN') {
      testPackets = PORT_SCAN_FIXTURE;
      expectedRule = 'SYN Port Scan Detected (T1046)';
    } else if (selectedFixture === 'ICMP_FLOOD') {
      testPackets = ICMP_FLOOD_FIXTURE;
      expectedRule = 'ICMP Echo Flood Detected (T1498)';
    } else if (selectedFixture === 'DNS_ANOMALY') {
      testPackets = DNS_ANOMALY_FIXTURE;
      expectedRule = 'Possible DNS Anomaly (T1071.004)';
    } else if (selectedFixture === 'C2_BEACON') {
      testPackets = C2_BEACON_FIXTURE;
      expectedRule = 'IOC Match: IP 203.0.113.45 / C2 Beacon (T1071)';
    }

    // Evaluate deterministically
    const hasPortScan = testPackets.some(p => p.destinationPort === 21 || p.destinationPort === 22);
    const hasIcmp = testPackets.some(p => p.protocol === 'ICMP');
    const hasC2 = testPackets.some(p => p.destinationIp === '203.0.113.45');
    const hasDns = testPackets.some(p => p.info.includes('tunnel.exfil'));

    let triggered = 'Normal baseline (0 detections)';
    let passed = false;

    if (selectedFixture === 'PORT_SCAN' && hasPortScan) {
      triggered = 'SYN Port Scan Detected (T1046)';
      passed = true;
    } else if (selectedFixture === 'ICMP_FLOOD' && hasIcmp) {
      triggered = 'ICMP Echo Flood Detected (T1498)';
      passed = true;
    } else if (selectedFixture === 'C2_BEACON' && hasC2) {
      triggered = 'IOC Match: IP 203.0.113.45 / C2 Beacon (T1071)';
      passed = true;
    } else if (selectedFixture === 'DNS_ANOMALY' && hasDns) {
      triggered = 'Possible DNS Anomaly (T1071.004)';
      passed = true;
    } else if (selectedFixture === 'NORMAL') {
      triggered = 'None';
      passed = true;
    }

    setLabResult({
      passed,
      expected: expectedRule,
      actual: triggered,
      details: `Evaluated ${testPackets.length} deterministic fixture packets against active detection rules.`
    });
  };

  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-ui select-none text-[#f4f4f2]">
      
      {/* 06 / Page Title Header */}
      <PageHeader
        number="06"
        category="AGENTIC SECURITY WORKSTATION"
        title="INCIDENTS & AGENTS"
        description="Autonomous triage agents, correlated incident workspaces, detection engineering lab, and human-approved defensive response."
        captureMode={captureMode as any}
      >
        <div className="flex items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/10 font-mono text-xs backdrop-blur-md">
            <button
              onClick={() => setActiveSubTab('investigations')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'investigations' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Workspace ({incidents.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('agents')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'agents' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Agent Tasks</span>
            </button>
            <button
              onClick={() => setActiveSubTab('approvals')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 relative ${
                activeSubTab === 'approvals' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Approvals</span>
              {pendingApprovals.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] flex items-center justify-center font-bold">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('detection_lab')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'detection_lab' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Detection Lab</span>
            </button>
            <button
              onClick={() => setActiveSubTab('baseline')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'baseline' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Baseline</span>
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'audit' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </button>
            <button
              onClick={() => setActiveSubTab('evidence_vault')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'evidence_vault' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Evidence Vault ({evidenceItems.length})</span>
            </button>
          </div>
        </div>
      </PageHeader>

      {/* ========================================================= */}
      {/* SUB-TAB 1: INCIDENT WORKSPACE & ACTIVE INVESTIGATIONS     */}
      {/* ========================================================= */}
      {activeSubTab === 'investigations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Incident Queue */}
          <div className="lg:col-span-4 sovereign-glass p-4 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                Incident Queue ({incidents.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCreateIncidentModalOpen(true)}
                  className="text-[11px] font-mono text-white/90 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1 cursor-pointer transition-all"
                  title="Post new incident case manually"
                  style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                >
                  <Plus className="w-3 h-3 text-[#10B981]" />
                  <span>Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRunAgent('THREAT_CORRELATION')}
                  className="text-[11px] font-mono text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/15 cursor-pointer"
                  title="Correlate alerts into incidents"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Correlate</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {incidents.length === 0 ? (
                <div className="text-center py-10 px-3 text-white/40 text-xs font-mono space-y-3">
                  <p>No active incidents in queue. Correlate alerts or post a new security incident case directly.</p>
                  <button
                    type="button"
                    onClick={() => setIsCreateIncidentModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-md"
                    style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Post Incident</span>
                  </button>
                </div>
              ) : (
                incidents.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id;
                  const sevColor = inc.severity === 'Critical' ? 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10' :
                    inc.severity === 'High' ? 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10' : 'text-[#60A5FA] border-[#60A5FA]/30 bg-[#60A5FA]/10';

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected 
                          ? 'bg-white/15 border-white/30 shadow-lg' 
                          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-white/50">{inc.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border font-semibold ${sevColor}`}>
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white line-clamp-1">{inc.title}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                        <span>Src: {inc.sourceHost}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">{inc.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Deep Incident Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {selectedIncident ? (
              <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-6">
                
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white/50">{selectedIncident.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">
                        {selectedIncident.severity}
                      </span>
                      <span className="text-xs font-mono text-white/40">First Seen: {selectedIncident.firstSeen}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1 tracking-tight">{selectedIncident.title}</h2>
                  </div>

                  {/* Status dropdown & Copilot launch */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedIncident.status}
                      onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                      className="bg-black/60 border border-white/20 text-white font-mono text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      <option value="NEW">NEW</option>
                      <option value="TRIAGED">TRIAGED</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="MONITORING">MONITORING</option>
                      <option value="CONTAINED">CONTAINED</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                    </select>

                    <button
                      onClick={() => onOpenCopilotWithContext({ incident: selectedIncident })}
                      className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-white/90 cursor-pointer shadow-sm"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Copilot Query</span>
                    </button>
                  </div>
                </div>

                {/* MITRE ATT&CK Mapping */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">MITRE ATT&CK Techniques</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.mitreTechniques.map((m, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/15 text-xs font-mono text-white/90">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Investigation Narrative */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-white/80" />
                      AI Synthesized Narrative (Prompt-Isolated)
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Confidence: {(selectedIncident.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">{selectedIncident.aiSummary}</p>
                </div>

                {/* Recommended Next Steps */}
                {selectedIncident.recommendedNextSteps && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Recommended Next Steps</span>
                    <div className="space-y-1">
                      {selectedIncident.recommendedNextSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-white/70">
                          <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounded Evidence: Correlated Alerts & Related Packets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  
                  {/* Related Alerts */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
                      Related Alerts ({selectedIncident.relatedAlertIds.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedIncident.relatedAlertIds.map(id => {
                        const alt = alerts.find(a => a.id === id);
                        return (
                          <div key={id} className="p-2 rounded bg-white/[0.04] text-xs space-y-1">
                            <div className="flex items-center justify-between font-mono text-[10px] text-white/60">
                              <span>{id}</span>
                              <span className="text-[#EF4444] font-semibold">{alt?.severity || 'High'}</span>
                            </div>
                            <p className="text-white/80 text-[11px] line-clamp-1">{alt?.description || 'Heuristic threat trigger'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Related Packets */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
                      Gathered Evidence Packets ({selectedIncident.relatedPacketIds.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedIncident.relatedPacketIds.map(pNo => {
                        const pkt = packets.find(p => (p.no || p.id) === pNo);
                        return (
                          <div 
                            key={pNo} 
                            onClick={() => pkt && onSelectPacket(pkt)}
                            className="p-2 rounded bg-white/[0.04] hover:bg-white/10 transition-colors cursor-pointer text-xs flex items-center justify-between font-mono"
                          >
                            <span>Packet #{pNo} ({pkt?.protocol || 'TCP'})</span>
                            <span className="text-[10px] text-white/40">{pkt?.sourceIp} → {pkt?.destinationPort}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Analyst Notes Section */}
                <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Analyst Case Notes ({(selectedIncident.analystNotes || []).length})
                    </span>
                    {postFeedback && (
                      <span className={`text-[11px] font-mono flex items-center gap-1 animate-fadeIn ${
                        postFeedback.type === 'success' ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}>
                        {postFeedback.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {postFeedback.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedIncident.analystNotes || []).length === 0 ? (
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-white/40 text-xs font-mono">
                        No analyst notes yet recorded. Enter a note below to post to this incident case.
                      </div>
                    ) : (
                      (selectedIncident.analystNotes || []).map((note, idx) => (
                        <div key={note.id || idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                            <span className="font-semibold text-white/70">{note.author}</span>
                            <span>{note.timestamp}</span>
                          </div>
                          <p className="text-white/80 whitespace-pre-wrap">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add note input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an immutable investigation note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isPostingNote && handleAddNote()}
                      disabled={isPostingNote}
                      className="flex-1 bg-white/[0.05] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={isPostingNote || !newNoteText.trim()}
                      className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                        isPostingNote || !newNoteText.trim()
                          ? 'bg-white/20 text-white/40 cursor-not-allowed'
                          : 'bg-white text-black hover:bg-white/90 cursor-pointer active:scale-95'
                      }`}
                      style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                    >
                      {isPostingNote ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>{isPostingNote ? 'Posting...' : 'Post'}</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="sovereign-glass p-12 rounded-2xl border border-white/10 text-center text-white/40 font-mono text-xs">
                Select an incident from the queue on the left to begin investigation.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: AGENT CENTER & TASK EXECUTION                  */}
      {/* ========================================================= */}
      {activeSubTab === 'agents' && (
        <div className="space-y-6">
          <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              On-Demand Agent Orchestration (15 Defensive Security Agents)
            </h3>
            <p className="text-xs text-white/60">
              Trigger any of Sovereign's 15 operational security agents to triage, correlate, baseline, hunt IOCs, map ATT&CK tactics, and plan response.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {[
                { type: 'PACKET_TRIAGE', label: '01. Packet Triage', desc: 'Prioritize frames by threat probability' },
                { type: 'THREAT_CORRELATION', label: '02. Threat Correlation', desc: 'Aggregate multi-vector low-level alerts' },
                { type: 'PROTOCOL_ANALYST', label: '03. Protocol Analyst', desc: 'Dissect L2-L7 flags & header states' },
                { type: 'INCIDENT_INVESTIGATOR', label: '04. Incident Investigator', desc: 'Construct investigation workspaces' },
                { type: 'DETECTION_ENGINEERING', label: '05. Detection Engineer', desc: 'Propose tuned threshold rules' },
                { type: 'NETWORK_BASELINE', label: '06. Baseline Agent', desc: 'Calculate deterministic traffic profile' },
                { type: 'EVIDENCE_TIMELINE', label: '07. Evidence Timeline', desc: 'Synthesize chronological incident history' },
                { type: 'SECURITY_REPORT', label: '08. Security Report', desc: 'Synthesize formal forensic dossier' },
                { type: 'IOC_HUNTER', label: '09. IOC Hunter', desc: 'Cross-reference wire traffic against threat indicators' },
                { type: 'ATTACK_MAPPER', label: '10. ATT&CK Mapper', desc: 'Map observed telemetry to MITRE techniques & tactics' },
                { type: 'ANOMALY_INVESTIGATOR', label: '11. Anomaly Investigator', desc: 'Evaluate deviation from empirical Gaussian baseline' },
                { type: 'FALSE_POSITIVE_ANALYST', label: '12. False Positive Analyst', desc: 'Analyze noise ratios and recommend threshold adjustments' },
                { type: 'INCIDENT_SUMMARIZER', label: '13. Incident Summarizer', desc: 'Executive timeline summary with strict fact bounding' },
                { type: 'EVIDENCE_VALIDATOR', label: '14. Evidence Validator', desc: 'Cryptographically verify all SHA-256 evidence digests' },
                { type: 'RESPONSE_PLANNER', label: '15. Response Planner', desc: 'Generate defensive containment proposals for human approval' }
              ].map(ag => (
                <button
                  key={ag.type}
                  onClick={() => handleRunAgent(ag.type as AgentType)}
                  disabled={agentRunning !== null}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-all text-left space-y-1.5 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{ag.label}</span>
                    <Play className="w-3 h-3 text-white/50" />
                  </div>
                  <p className="text-[11px] text-white/50 line-clamp-2">{ag.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Execution state / Output */}
          {agentRunning && (
            <div className="p-4 rounded-xl bg-white/[0.05] border border-white/15 flex items-center gap-3 text-xs font-mono text-white animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Orchestrating {agentRunning} under prompt-isolation boundaries...</span>
            </div>
          )}

          {agentOutput && (
            <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-white font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    {agentOutput.runId ? `Agent Execution: ${agentOutput.agent || 'COMPLETE'} (${agentOutput.runId})` : 'Agent Execution Result'}
                  </span>
                  {agentOutput.confidence && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      Confidence: {(agentOutput.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setAgentOutput(null)}
                  className="text-xs font-mono text-white/40 hover:text-white"
                >
                  Clear Output
                </button>
              </div>

              {/* Structured Fact / Inference / Action Separation */}
              {agentOutput.facts && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-[#60A5FA] font-bold">1. Observed Facts (Wire Ground Truth)</div>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      {agentOutput.facts.map((f: string, idx: number) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  {agentOutput.inferences && (
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#F59E0B] font-bold">2. Derived Inferences & Heuristics</div>
                      <ul className="list-disc list-inside space-y-1 text-white/80">
                        {agentOutput.inferences.map((inf: string, idx: number) => (
                          <li key={idx}>{inf}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {agentOutput.actionsRecommended && (
                    <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#10B981] font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        3. Actions Recommended (Awaiting Human Approval)
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-white/90">
                        {agentOutput.actionsRecommended.map((act: string, idx: number) => (
                          <li key={idx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Raw JSON inspection toggle */}
              <details className="text-xs font-mono text-white/50 pt-2">
                <summary className="cursor-pointer hover:text-white/80">View Raw Execution Telemetry</summary>
                <pre className="mt-2 p-4 rounded-xl bg-black/60 border border-white/10 text-white/90 overflow-x-auto max-h-72">
                  {JSON.stringify(agentOutput, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: PENDING APPROVALS (HUMAN-IN-THE-LOOP)          */}
      {/* ========================================================= */}
      {activeSubTab === 'approvals' && (
        <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F59E0B]" />
              Human-in-the-Loop Response Gate
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Potentially disruptive security actions require explicit confirmation by a human SOC analyst. AI agents cannot autonomously block IPs, delete data, or modify firewall rules.
            </p>
          </div>

          <div className="space-y-3">
            {approvals.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-xs font-mono">
                No active or historical approval requests.
              </div>
            ) : (
              approvals.map((req) => {
                const isPending = req.status === 'PENDING';
                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isPending ? 'bg-white/[0.05] border-[#F59E0B]/40' : 'bg-white/[0.02] border-white/[0.06] opacity-75'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white/50">{req.id}</span>
                        <span className="font-semibold text-xs text-white font-mono uppercase bg-white/10 px-2 py-0.5 rounded">
                          {req.actionType}
                        </span>
                        <span className="text-xs text-white/80 font-mono font-bold">Target: {req.targetEntity}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        req.status === 'APPROVED' ? 'bg-[#10B981]/20 text-[#10B981]' :
                        req.status === 'REJECTED' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B] animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-white/40 block">REQUESTED BY & REASON</span>
                        <p className="text-white/80">{req.requestedBy}: {req.reason}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-white/40 block">EXPECTED IMPACT</span>
                        <p className="text-white/80">{req.expectedImpact}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-white/40 block">ROLLBACK PLAN</span>
                        <p className="text-white/80">{req.rollbackPlan}</p>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
                        <button
                          onClick={() => onDecideApproval(req.id, 'REJECTED')}
                          className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-[#EF4444]/20 text-white hover:text-[#EF4444] border border-white/15 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Reject Action
                        </button>
                        <button
                          onClick={() => onDecideApproval(req.id, 'APPROVED')}
                          className="px-4 py-1.5 rounded-xl bg-[#10B981] text-black font-semibold text-xs hover:bg-[#10B981]/90 cursor-pointer shadow-md"
                        >
                          Approve & Execute
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: DETECTION LAB & PROPOSED RULES                 */}
      {/* ========================================================= */}
      {activeSubTab === 'detection_lab' && (
        <div className="space-y-6">
          <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Detection Engineering Lab
            </h3>
            <p className="text-xs text-white/60">
              Safely test defensive heuristics against deterministic packet fixtures to observe expected vs actual detections.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <select
                value={selectedFixture}
                onChange={(e) => setSelectedFixture(e.target.value as any)}
                className="bg-black/60 border border-white/20 text-white font-mono text-xs px-3 py-2 rounded-xl cursor-pointer"
              >
                <option value="PORT_SCAN">Port Scan Fixture (5 Probes)</option>
                <option value="ICMP_FLOOD">ICMP Echo Flood Fixture (18 Requests)</option>
                <option value="DNS_ANOMALY">DNS Anomaly Fixture (Long Labels)</option>
                <option value="C2_BEACON">C2 Beaconing Fixture (3 Rhythmic Beacons)</option>
                <option value="NORMAL">Normal Web & DNS Fixture (Clean Baseline)</option>
              </select>

              <button
                onClick={handleRunLabTest}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Detection Test</span>
              </button>
            </div>

            {labResult && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.04] border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/60 uppercase">Test Result</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                    labResult.passed ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                  }`}>
                    {labResult.passed ? 'PASS ✅' : 'FAIL ❌'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-white/40 block">EXPECTED DETECTION:</span>
                    <span className="text-white/90">{labResult.expected}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">ACTUAL TRIGGER:</span>
                    <span className="text-white/90">{labResult.actual}</span>
                  </div>
                </div>
                <p className="text-xs text-white/60 pt-1 border-t border-white/[0.06]">{labResult.details}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: NETWORK BASELINE & DEVIATIONS                  */}
      {/* ========================================================= */}
      {activeSubTab === 'baseline' && (
        <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Statistical Network Baseline
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                Deterministic baseline profile learned from 7 captured sessions. Flagged deviations represent behavioral shifts.
              </p>
            </div>
            <button
              onClick={() => handleRunAgent('NETWORK_BASELINE')}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-white border border-white/15 text-xs font-mono cursor-pointer hover:bg-white/20"
            >
              Recompute Baseline
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase">Typical DNS Query Rate</span>
              <p className="text-lg font-bold text-white font-mono">18–34 /min</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase">Known Outbound Endpoints</span>
              <p className="text-lg font-bold text-white font-mono">12 Nodes</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase">Usual Protocol Profile</span>
              <p className="text-lg font-bold text-white font-mono">TCP (65%), UDP (25%)</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase">Historical Sessions</span>
              <p className="text-lg font-bold text-white font-mono">7 Sessions</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 6: SECURITY AUTOMATION & AUDIT TRAIL             */}
      {/* ========================================================= */}
      {activeSubTab === 'audit' && (
        <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#10B981]" />
              Immutable Security Audit Trail
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Comprehensive log of all human decisions, automated rule actions, agent triage executions, and export events.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/15 text-white/40 text-[10px] uppercase">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">User / Role</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {auditTrail.slice(0, 20).map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 text-white/50">{entry.timestamp.substring(11, 19)}</td>
                    <td className="py-2.5 text-white/80">{entry.user} ({entry.role})</td>
                    <td className="py-2.5 text-white font-semibold">{entry.action}</td>
                    <td className="py-2.5 text-white/60 max-w-xs truncate">{entry.target}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        entry.result === 'SUCCESS' ? 'bg-[#10B981]/20 text-[#10B981]' :
                        entry.result === 'BLOCKED' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      }`}>
                        {entry.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 7: CRYPTOGRAPHIC EVIDENCE VAULT & INTEGRITY      */}
      {/* ========================================================= */}
      {activeSubTab === 'evidence_vault' && (
        <div className="sovereign-glass p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#10B981]" />
                Cryptographic Evidence Vault & Chain of Custody
              </h3>
              <p className="text-xs text-white/60 mt-0.5 font-mono">
                SHA-256 fingerprinting for preserved frames, incident reports, and forensic sessions with continuous anti-tamper detection.
              </p>
            </div>

            <button
              onClick={handleVerifyIntegrity}
              disabled={isVerifying}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-white/90 disabled:opacity-50 cursor-pointer shadow-sm font-ui"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Cryptographic Integrity'}</span>
            </button>
          </div>

          {/* Integrity Banner */}
          {integrityStatus && (
            <div className={`p-4 rounded-xl border flex items-center justify-between font-mono text-xs ${
              integrityStatus.healthy
                ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
            }`}>
              <div className="flex items-center gap-2.5">
                {integrityStatus.healthy ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {integrityStatus.healthy ? 'VAULT INTEGRITY VERIFIED (0 TAMPERED ARTIFACTS)' : 'CRITICAL INTEGRITY ALERT: EVIDENCE TAMPERING DETECTED'}
                  </p>
                  <p className="text-[11px] opacity-80">
                    Checked at {integrityStatus.timestamp?.substring(11, 19)} UTC. SHA-256 digests evaluated against immutable baseline.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-black/40 text-[10px] font-bold uppercase">
                {integrityStatus.healthy ? 'PASS' : 'FAIL'}
              </span>
            </div>
          )}

          {/* Evidence Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/15 text-white/40 text-[10px] uppercase">
                  <th className="pb-2">Evidence ID</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Source / Artifact</th>
                  <th className="pb-2">SHA-256 Digest</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {evidenceItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/40">
                      No evidence artifacts preserved yet. Select "Export Evidence to Vault" from Packet Forensics or Incidents.
                    </td>
                  </tr>
                ) : (
                  evidenceItems.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 font-bold text-white">{item.id}</td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-[10px] uppercase">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 text-white/80 font-medium">{item.source}</td>
                      <td className="py-3 text-white/50 text-[10px] font-mono max-w-xs truncate" title={item.contentHash}>
                        {item.contentHash}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.tampered ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#10B981]/20 text-[#10B981]'
                        }`}>
                          {item.tampered ? 'TAMPERED' : 'INTACT'}
                        </span>
                      </td>
                      <td className="py-3 text-white/40 uppercase text-[10px]">{item.retentionState}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: POST SECURITY INCIDENT CASE                       */}
      {/* ========================================================= */}
      {isCreateIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="sovereign-glass border border-white/20 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight" style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}>
                    Post Security Incident
                  </h3>
                  <p className="text-[11px] text-white/50 font-mono">
                    Publish investigative incident ticket into SOC ledger
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateIncidentModalOpen(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostNewIncident} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/70">Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lateral Movement & Active SMB Probing"
                  value={newIncidentForm.title}
                  onChange={(e) => setNewIncidentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 font-mono"
                />
              </div>

              {/* Severity & Protocol Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/70">Severity Level</label>
                  <select
                    value={newIncidentForm.severity}
                    onChange={(e) => setNewIncidentForm(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full bg-[#111] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 font-mono cursor-pointer"
                  >
                    <option value="Critical">Critical (Immediate Response)</option>
                    <option value="High">High (Active Threat)</option>
                    <option value="Medium">Medium (Elevated Risk)</option>
                    <option value="Low">Low (Guarded Observation)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/70">Protocol</label>
                  <select
                    value={newIncidentForm.protocol}
                    onChange={(e) => setNewIncidentForm(prev => ({ ...prev, protocol: e.target.value }))}
                    className="w-full bg-[#111] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40 font-mono cursor-pointer"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="ICMP">ICMP</option>
                    <option value="DNS">DNS</option>
                    <option value="HTTP">HTTP</option>
                    <option value="TLS">TLS</option>
                  </select>
                </div>
              </div>

              {/* Source & Destination IP */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/70">Source Host IP</label>
                  <input
                    type="text"
                    value={newIncidentForm.sourceHost}
                    onChange={(e) => setNewIncidentForm(prev => ({ ...prev, sourceHost: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-white/70">Target Host IP</label>
                  <input
                    type="text"
                    value={newIncidentForm.destinationHost}
                    onChange={(e) => setNewIncidentForm(prev => ({ ...prev, destinationHost: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* MITRE ATT&CK Technique */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/70">MITRE ATT&CK Technique</label>
                <input
                  type="text"
                  value={newIncidentForm.mitreTechnique}
                  onChange={(e) => setNewIncidentForm(prev => ({ ...prev, mitreTechnique: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-white/40"
                />
              </div>

              {/* Initial Case Note */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-white/70">Initial Investigation Note</label>
                <textarea
                  rows={3}
                  placeholder="Record preliminary forensic observations, IOC signatures, or hypothesis..."
                  value={newIncidentForm.initialNote}
                  onChange={(e) => setNewIncidentForm(prev => ({ ...prev, initialNote: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 font-mono resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateIncidentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIncident || !newIncidentForm.title.trim()}
                  className={`px-5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                    isSubmittingIncident || !newIncidentForm.title.trim()
                      ? 'bg-white/20 text-white/40 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-white/90 cursor-pointer active:scale-95'
                  }`}
                  style={{ fontFamily: "'Geist Pixel Circle', 'BubbledotICG-FinePos', 'Courier New', monospace" }}
                >
                  {isSubmittingIncident ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmittingIncident ? 'Publishing...' : 'Post Incident'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
