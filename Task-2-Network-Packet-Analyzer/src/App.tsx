import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LiveCaptureView } from './components/LiveCaptureView';
import { PacketAnalysisView } from './components/PacketAnalysisView';
import { ThreatAlertsView } from './components/ThreatAlertsView';
import { StatisticsView } from './components/StatisticsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AIThreatModal } from './components/AIThreatModal';
import { IncidentsAndAgentsView } from './components/IncidentsAndAgentsView';
import { EvidenceVaultView } from './components/EvidenceVaultView';
import { SecurityCopilotModal } from './components/SecurityCopilotModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { NetworkEntityGraphView } from './components/NetworkEntityGraphView';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Packet, 
  ThreatAlert, 
  CaptureStats, 
  NetworkInterface, 
  SavedSession, 
  CaptureMode,
  Incident,
  ApprovalRequest,
  AuditLogEntry,
  UserRole,
  EvidenceItem,
  DetectionRule
} from './types';
import { DETERMINISTIC_DEMO_PACKETS, DEMO_INITIAL_ALERTS } from './data/demoPackets';

export function App() {
  // Authentication & Session State (Persisted in sessionStorage)
  const [session, setSession] = useState<{
    token: string;
    username: string;
    role: UserRole;
    displayName: string;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sovereign_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem('sovereign_session'));
    } catch (e) {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Navigation State - Strictly gated to 'landing' unless authenticated
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Workstation User Role (RBAC) - Derived from session or defaults to ANALYST
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = sessionStorage.getItem('sovereign_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch (e) {}
    return 'ANALYST';
  });

  // Strict Navigation Gate: Block access to ANY workstation page unless authenticated
  const handleSelectTab = useCallback((tabId: string) => {
    if (tabId === 'landing' || tabId === 'auth') {
      setActiveTab(tabId);
      return;
    }

    if (!isAuthenticated) {
      setActiveTab('auth');
      return;
    }

    setActiveTab(tabId);
  }, [isAuthenticated]);

  // Safeguard: Ensure no unauthenticated user ever stays on a workstation tab
  useEffect(() => {
    if (!isAuthenticated && activeTab !== 'landing' && activeTab !== 'auth') {
      setActiveTab('auth');
    }
  }, [isAuthenticated, activeTab]);

  // Login handler
  const handleLoginSuccess = (newSession: {
    token: string;
    username: string;
    role: UserRole;
    displayName: string;
  }) => {
    try {
      sessionStorage.setItem('sovereign_session', JSON.stringify(newSession));
    } catch (e) {}
    setSession(newSession);
    setIsAuthenticated(true);
    setUserRole(newSession.role);
    setIsAuthModalOpen(false);
    setActiveTab('dashboard'); // Seamless transition directly into SOC Workstation
  };

  // Sign out handler
  const handleSignOut = async () => {
    if (session?.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` }
        });
      } catch (e) {}
    }
    try {
      sessionStorage.removeItem('sovereign_session');
    } catch (e) {}
    setSession(null);
    setIsAuthenticated(false);
    setActiveTab('auth');
  };

  // Network Interfaces & Hardware State
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([
    { id: 'eth0', name: 'eth0', mac: 'fa:16:3e:89:12:a4', ipAddress: '192.168.1.10', type: 'Ethernet', status: 'active', isPromiscuous: true },
    { id: 'wlan0', name: 'wlan0', mac: '00:1a:2b:3c:4d:5e', ipAddress: '192.168.1.25', type: 'Wireless', status: 'inactive' },
    { id: 'lo', name: 'lo', mac: '00:00:00:00:00:00', ipAddress: '127.0.0.1', type: 'Loopback', status: 'active' },
  ]);
  const [activeInterface, setActiveInterface] = useState<NetworkInterface>(interfaces[0]);
  const [promiscuousMode, setPromiscuousMode] = useState<boolean>(true);
  const [maxBuffer, setMaxBuffer] = useState<number>(2000);

  // Capture Engine State
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('IDLE');

  // Packets and Alerts (Initial state starts EMPTY as required for genuine capture)
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);

  // Agentic Workstation State: Incidents, Approvals, Audit Trail
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditLogEntry[]>([]);

  // Security Copilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotContext, setCopilotContext] = useState<{
    incident?: Incident;
    alert?: ThreatAlert;
    packet?: Packet;
  }>({});

  // Telemetry Rates
  const [bandwidthKbps, setBandwidthKbps] = useState<number>(0);
  const [packetsPerSec, setPacketsPerSec] = useState<number>(0);
  const [timelineData, setTimelineData] = useState<Array<{ time: string; bandwidth: number; packets: number }>>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');

  // Saved Session Archive Vault
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Command Palette & Entity Graph
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isEntityGraphOpen, setIsEntityGraphOpen] = useState<boolean>(false);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [detectionRules, setDetectionRules] = useState<DetectionRule[]>([]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial evidence and detection rules once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const headers: Record<string, string> = {
      'x-user-role': userRole
    };
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
      headers['x-session-token'] = session.token;
    }

    fetch('/api/evidence', { headers })
      .then(r => r.json())
      .then(d => { if (d.vault?.items) setEvidenceItems(d.vault.items); })
      .catch(() => {});

    fetch('/api/detection/rules', { headers })
      .then(r => r.json())
      .then(d => { if (d.rules) setDetectionRules(d.rules); })
      .catch(() => {});
  }, [isAuthenticated, userRole, session]);

  // Forensic Handlers
  const handlePreserveEvidenceFromPacket = async (pkt: Packet) => {
    try {
      const res = await fetch('/api/evidence/preserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': userRole },
        body: JSON.stringify({
          type: 'PACKET',
          source: `Frame #${pkt.no || pkt.id} (${pkt.protocol})`,
          rawContent: JSON.stringify(pkt, null, 2),
          metadata: { protocol: pkt.protocol, src: pkt.sourceIp, dst: pkt.destinationIp }
        })
      });
      const data = await res.json();
      if (data.evidence) {
        setEvidenceItems(prev => [data.evidence, ...prev]);
      }
    } catch (e) {
      console.error('Failed to preserve evidence:', e);
    }
  };

  const handleCreateIncidentFromPacket = (pkt: Packet) => {
    const newInc: Incident = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      title: `Investigate Anomaly on ${pkt.sourceIp} (${pkt.protocol})`,
      severity: pkt.threatSeverity || 'High',
      confidence: 85,
      status: 'NEW',
      firstSeen: pkt.timestamp,
      lastSeen: pkt.timestamp,
      sourceHost: pkt.sourceIp,
      destinationHosts: [pkt.destinationIp],
      protocols: [pkt.protocol],
      relatedAlertIds: pkt.alerts?.map(a => a.type) || ['MANUAL-PROMOTION'],
      relatedPacketIds: [pkt.no || pkt.id || 1],
      mitreTechniques: pkt.alerts?.map(a => a.mitre).filter(Boolean) as string[] || ['T1046'],
      assignedAnalyst: `${userRole} (Analyst)`,
      recommendedNextSteps: ['Review packet payload and check firewall logs for correlated traffic.'],
      analystNotes: [{
        id: `NOTE-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        author: `${userRole} (Analyst)`,
        note: `Manually promoted from frame #${pkt.no || pkt.id}`
      }],
      aiSummary: pkt.info
    };
    setIncidents(prev => [newInc, ...prev]);
    fetch('/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
        ...(session?.token ? { 'Authorization': `Bearer ${session.token}` } : {})
      },
      body: JSON.stringify(newInc)
    }).catch(e => console.error('Failed to save promoted incident to backend:', e));
    setActiveTab('incidents');
  };

  // AI Threat Modal Target
  const [aiModalTarget, setAiModalTarget] = useState<{ packet?: Packet; alert?: ThreatAlert } | null>(null);

  // References for rate calculation and stream management
  const eventSourceRef = useRef<EventSource | null>(null);
  const bytesInCurrentSecRef = useRef<number>(0);
  const packetsInCurrentSecRef = useRef<number>(0);
  const isCapturingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    isCapturingRef.current = isCapturing;
    isPausedRef.current = isPaused;
  }, [isCapturing, isPaused]);

  // Fetch system network interfaces, incidents, approvals, and audit trail once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const headers: Record<string, string> = {
      'x-user-role': userRole
    };
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
      headers['x-session-token'] = session.token;
    }

    fetch('/api/network/interfaces', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setInterfaces(data);
          setActiveInterface(data[0]);
        }
      })
      .catch(() => {
        // Use default fallback interfaces
      });

    // Fetch active incidents, approvals, and audit trail
    fetch('/api/incidents', { headers })
      .then(res => res.json())
      .then(d => {
        if (d.incidents && d.incidents.length > 0) setIncidents(d.incidents);
      })
      .catch(() => {});

    fetch('/api/approvals', { headers })
      .then(res => res.json())
      .then(d => {
        if (d.approvals && d.approvals.length > 0) setApprovals(d.approvals);
      })
      .catch(() => {});

    fetch('/api/automation/audit', { headers })
      .then(res => res.json())
      .then(d => {
        if (d.auditTrail && d.auditTrail.length > 0) setAuditTrail(d.auditTrail);
      })
      .catch(() => {});
  }, [isAuthenticated, userRole, session]);

  // Rolling Throughput Calculation Timer (Every 1000ms, strictly calculates actual bytes/sec received)
  useEffect(() => {
    const rateInterval = setInterval(() => {
      if (isCapturingRef.current && !isPausedRef.current) {
        const bytes = bytesInCurrentSecRef.current;
        const count = packetsInCurrentSecRef.current;

        bytesInCurrentSecRef.current = 0;
        packetsInCurrentSecRef.current = 0;

        const calculatedKbps = Math.round((bytes * 8) / 1024);
        setBandwidthKbps(calculatedKbps);
        setPacketsPerSec(count);

        const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        setTimelineData(prev => {
          const next = [...prev, { time: nowTime, bandwidth: calculatedKbps, packets: count }];
          return next.slice(-15);
        });
      } else if (!isCapturingRef.current) {
        // When stopped, freeze rates to 0
        setBandwidthKbps(0);
        setPacketsPerSec(0);
      }
    }, 1000);

    return () => clearInterval(rateInterval);
  }, []);

  // Handle incoming packet from SSE Stream
  const handleIncomingPacket = useCallback((pkt: Packet) => {
    if (isPausedRef.current) return;

    bytesInCurrentSecRef.current += pkt.length || 64;
    packetsInCurrentSecRef.current += 1;

    setPackets(prev => {
      const nextId = (prev[0]?.id || 0) + 1;
      const enriched: Packet = {
        ...pkt,
        id: pkt.id || nextId,
        no: pkt.no || nextId,
        hexDump: pkt.hexDump || pkt.payloadHex,
      };

      const updated = [enriched, ...prev];
      return updated.slice(0, maxBuffer);
    });

    // Check for alerts attached to packet
    if (pkt.alerts && pkt.alerts.length > 0) {
      pkt.alerts.forEach((alt, idx) => {
        const newAlert: ThreatAlert = {
          id: `ALT-${Date.now().toString().slice(-4)}-${idx}`,
          timestamp: pkt.timestamp,
          alertType: alt.type,
          sourceIp: pkt.sourceIp,
          destinationIp: pkt.destinationIp,
          destIp: pkt.destinationIp,
          description: alt.description,
          severity: (alt.severity as any) || 'High',
          status: 'New',
          packetNo: pkt.no || pkt.id,
          mitreTechnique: alt.mitre,
          recommendedAction: alt.action,
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 50)]);
      });
    } else if (pkt.isSuspicious && pkt.threatType) {
      const newAlert: ThreatAlert = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        timestamp: pkt.timestamp,
        alertType: pkt.threatType,
        sourceIp: pkt.sourceIp,
        destinationIp: pkt.destinationIp,
        destIp: pkt.destinationIp,
        description: `Automated Heuristic Anomaly: ${pkt.threatType} on port ${pkt.destinationPort}`,
        severity: pkt.threatSeverity || 'High',
        status: 'New',
        packetNo: pkt.no || pkt.id,
        mitreTechnique: 'Network Service Discovery (T1046)',
        recommendedAction: 'Inspect firewall boundary rules and quarantine remote source.',
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 50)]);
    }
  }, [maxBuffer]);

  // Connect / Disconnect SSE stream
  useEffect(() => {
    if (isCapturing) {
      const sse = new EventSource('/api/capture/stream');
      eventSourceRef.current = sse;

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PACKET' && data.packet) {
            handleIncomingPacket(data.packet);
          } else if (data.type === 'ALERT' && data.alert) {
            setAlerts(prev => [data.alert, ...prev.slice(0, 50)]);
          }
        } catch (e) {
          // Non-JSON SSE ping
        }
      };

      sse.onerror = () => {
        // SSE disconnected or reconnecting
      };

      return () => {
        sse.close();
        eventSourceRef.current = null;
      };
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }, [isCapturing, handleIncomingPacket]);

  // Start Live Capture
  const handleStartLive = async () => {
    try {
      await fetch('/api/capture/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'LIVE', iface: activeInterface.name || 'eth0' })
      });
      setCaptureMode('LIVE');
      setIsCapturing(true);
      setIsPaused(false);
    } catch (e) {
      console.error('Failed to start live capture', e);
    }
  };

  // Start Deterministic Demo Replay
  const handleStartDemo = async () => {
    try {
      await fetch('/api/capture/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'DEMO' })
      });
      setCaptureMode('DEMO');
      setIsCapturing(true);
      setIsPaused(false);
      // Pre-seed alerts if needed
      if (alerts.length === 0) {
        setAlerts(DEMO_INITIAL_ALERTS);
      }
    } catch (e) {
      console.error('Failed to start demo', e);
    }
  };

  // Load Fixed Demo Dataset Directly (Static Snapshot)
  const handleLoadDemoDataset = () => {
    setPackets(DETERMINISTIC_DEMO_PACKETS);
    setSelectedPacket(DETERMINISTIC_DEMO_PACKETS[0]);
    setAlerts(DEMO_INITIAL_ALERTS);
    setCaptureMode('DEMO');
    setIsCapturing(false);
    setIsPaused(false);
    // Create initial timeline
    setTimelineData([
      { time: '10:00:05', bandwidth: 240, packets: 5 },
      { time: '10:00:10', bandwidth: 680, packets: 8 },
      { time: '10:00:15', bandwidth: 320, packets: 2 },
    ]);

    // Seed correlated demo incident
    const demoIncident: Incident = {
      id: 'INC-DEMO-001',
      title: 'SYN Reconnaissance Sweep & Unauthorized Port Probing',
      severity: 'High',
      status: 'INVESTIGATING',
      firstSeen: '10:00:11',
      lastSeen: '10:00:14',
      sourceHost: '192.168.1.110',
      destinationHosts: ['192.168.1.10'],
      protocols: ['TCP'],
      relatedAlertIds: ['ALT-DEMO-001', 'ALT-DEMO-002'],
      relatedPacketIds: [11, 12, 13, 14],
      mitreTechniques: ['T1046 Network Service Discovery'],
      confidence: 0.94,
      assignedAnalyst: 'SOC-Analyst (You)',
      analystNotes: [
        { 
          id: 'n1', 
          timestamp: '10:01:15', 
          author: 'Threat Correlation Agent', 
          note: 'Correlated 4 sequential SYN attempts targeting high-value ports (21/FTP, 22/SSH, 80/HTTP, 445/SMB).' 
        }
      ],
      aiSummary: 'Source host 192.168.1.110 conducted rapid TCP SYN probing against target 192.168.1.10 across 4 distinct ports within a 3-second window. High probability of automated network reconnaissance.',
      recommendedNextSteps: [
        'Review edge perimeter logs for other external probes from 192.168.1.110.',
        'Verify if ports 21 and 22 are listening on target host 192.168.1.10.',
        'Request human approval to apply perimeter isolation rule for 192.168.1.110.'
      ]
    };
    setIncidents([demoIncident]);

    // Seed human-in-the-loop approval request
    const demoApproval: ApprovalRequest = {
      id: 'APP-DEMO-001',
      actionType: 'BLOCK_IP',
      requestedBy: 'Threat Correlation Agent',
      reason: 'Host 192.168.1.110 initiated multiple rapid port sweeps (T1046)',
      expectedImpact: 'Drop inbound traffic from 192.168.1.110 on perimeter ingress interface eth0',
      rollbackPlan: 'Remove iptables/firewall drop rule for 192.168.1.110',
      targetEntity: '192.168.1.110',
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    };
    setApprovals([demoApproval]);

    // Seed audit trail entry
    const initialAudit: AuditLogEntry = {
      id: `AUDIT-INIT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'System Boot',
      role: 'ADMIN',
      action: 'LOAD_DEMO_DATASET',
      target: 'DETERMINISTIC_DEMO_PACKETS',
      result: 'SUCCESS',
      metadata: { packetCount: DETERMINISTIC_DEMO_PACKETS.length }
    };
    setAuditTrail([initialAudit]);
  };

  // Human Approval Decision Handler
  const handleDecideApproval = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/approvals/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': userRole },
        body: JSON.stringify({ decision, analystName: `Analyst (${userRole})` })
      });
      const data = await res.json();
      if (data.request) {
        setApprovals(prev => prev.map(a => a.id === id ? data.request : a));
      }
    } catch {
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: decision } : a));
    }
  };

  // Investigate Alert -> Jump to Incident Workspace
  const handleInvestigateAlert = (alert: ThreatAlert) => {
    let existing = incidents.find(i => i.sourceHost === alert.sourceIp);
    if (!existing) {
      existing = {
        id: `INC-${Date.now().toString().slice(-4)}`,
        title: `${alert.alertType} Investigation (${alert.sourceIp})`,
        severity: (alert.severity as any) || 'High',
        status: 'INVESTIGATING',
        firstSeen: alert.timestamp,
        lastSeen: alert.timestamp,
        sourceHost: alert.sourceIp,
        destinationHosts: [alert.destinationIp || '192.168.1.10'],
        protocols: ['TCP'],
        relatedAlertIds: [alert.id],
        relatedPacketIds: alert.packetNo ? [alert.packetNo] : [],
        mitreTechniques: [alert.mitreTechnique || 'T1046 Network Service Discovery'],
        confidence: 0.88,
        assignedAnalyst: userRole,
        analystNotes: [
          { id: `note-${Date.now()}`, timestamp: new Date().toLocaleTimeString(), author: userRole, note: `Investigating alert ${alert.id}` }
        ],
        aiSummary: `Investigation initiated on ${alert.alertType} from ${alert.sourceIp}. Evidence isolated.`
      };
      setIncidents(prev => [existing!, ...prev]);
    }
    setActiveTab('incidents');
  };

  // Mark Alert as False Positive
  const handleMarkFalsePositive = (alert: ThreatAlert, reason: string) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'Resolved' } : a));
    const entry: AuditLogEntry = {
      id: `AUDIT-FP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Analyst',
      role: userRole,
      action: 'MARK_FALSE_POSITIVE',
      target: alert.id,
      result: 'SUCCESS',
      metadata: { reason }
    };
    setAuditTrail(prev => [entry, ...prev]);
  };

  // Pause Capture
  const handlePause = async () => {
    try {
      await fetch('/api/capture/pause', { method: 'POST' });
      setIsPaused(true);
    } catch (e) {
      console.error('Failed to pause', e);
    }
  };

  // Resume Capture
  const handleResume = async () => {
    try {
      await fetch('/api/capture/resume', { method: 'POST' });
      setIsPaused(false);
    } catch (e) {
      console.error('Failed to resume', e);
    }
  };

  // Stop Capture
  const handleStop = async () => {
    try {
      await fetch('/api/capture/stop', { method: 'POST' });
      setIsCapturing(false);
      setIsPaused(false);
    } catch (e) {
      console.error('Failed to stop', e);
    }
  };

  // Clear In-Memory Buffer
  const handleClear = () => {
    setPackets([]);
    setSelectedPacket(null);
    setTimelineData([]);
    bytesInCurrentSecRef.current = 0;
    packetsInCurrentSecRef.current = 0;
    setBandwidthKbps(0);
    setPacketsPerSec(0);
  };

  // Trigger Attack Vector Simulation
  const handleTriggerAttack = async (type: string) => {
    try {
      const res = await fetch('/api/threat/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.alert) {
        setAlerts(prev => [data.alert, ...prev]);
      }
    } catch (e) {
      // Fallback client simulation
      const newAlert: ThreatAlert = {
        id: `ALT-SIM-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        alertType: `${type} (Simulation)`,
        sourceIp: '192.168.1.110',
        destinationIp: activeInterface.ipAddress || '192.168.1.10',
        description: `[DEMO SIMULATION] Injected test vector: ${type}`,
        severity: 'High',
        status: 'New',
        mitreTechnique: 'T1046 Network Service Discovery',
        recommendedAction: 'Validate firewall perimeter rules.',
        isSimulation: true
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  // Export File Handler
  const handleExportPackets = async (format: 'csv' | 'json' | 'txt') => {
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          packets,
          sessionTitle: `sovereign_capture_${Date.now()}`
        }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sovereign_capture_export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('Export Error:', e);
    }
  };

  // Save Current Session
  const handleSaveSession = () => {
    const newSession: SavedSession = {
      id: `session-${Date.now()}`,
      name: `Capture Session #${savedSessions.length + 1} (${captureMode})`,
      fileName: `sovereign_session_${Date.now().toString().slice(-4)}.pcap`,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toLocaleTimeString(),
      duration: 'Session Archived',
      packetCount: packets.length,
      packetsCount: packets.length,
      fileSize: `${(packets.length * 0.35).toFixed(1)} KB`,
      interfaceName: activeInterface.name,
      packets: [...packets],
    };

    setSavedSessions(prev => [newSession, ...prev]);
    setActiveTab('reports');
  };

  // Load Saved Session
  const handleLoadSession = (session: SavedSession) => {
    setPackets(session.packets);
    setSelectedPacket(session.packets[0] || null);
    setCaptureMode('PCAP');
    setIsCapturing(false);
    setIsPaused(false);
    setActiveTab('capture');
  };

  // Delete Saved Session
  const handleDeleteSession = (id: string) => {
    setSavedSessions(prev => prev.filter(s => s.id !== id));
  };

  // Real PCAP File Import via Backend Parser
  const handleImportPcap = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('pcap', file);

      const res = await fetch('/api/capture/upload-pcap', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to parse PCAP file');
      }

      const data = await res.json();
      const parsedPackets: Packet[] = data.packets || [];
      const parsedAlerts: ThreatAlert[] = data.alerts || [];

      const newSession: SavedSession = {
        id: `imported-${Date.now()}`,
        name: file.name,
        fileName: file.name,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toLocaleTimeString(),
        duration: 'PCAP Decoded',
        packetCount: parsedPackets.length,
        packetsCount: parsedPackets.length,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        interfaceName: 'Imported PCAP',
        packets: parsedPackets,
      };

      setSavedSessions(prev => [newSession, ...prev]);
      setPackets(parsedPackets);
      if (parsedPackets.length > 0) {
        setSelectedPacket(parsedPackets[0]);
      }
      if (parsedAlerts.length > 0) {
        setAlerts(prev => [...parsedAlerts, ...prev]);
      }
      setCaptureMode('PCAP');
      setIsCapturing(false);
      setIsPaused(false);
      setActiveTab('capture');
    } catch (err) {
      console.error('PCAP import error:', err);
    }
  };

  // Aggregate Stats Derived Directly from Real Data
  const stats: CaptureStats = {
    totalPackets: packets.length,
    tcpCount: packets.filter(p => p.protocol === 'TCP').length,
    udpCount: packets.filter(p => p.protocol === 'UDP').length,
    icmpCount: packets.filter(p => p.protocol === 'ICMP').length,
    arpCount: packets.filter(p => p.protocol === 'ARP').length,
    dnsCount: packets.filter(p => p.protocol === 'DNS').length,
    httpCount: packets.filter(p => p.protocol === 'HTTP').length,
    httpsCount: packets.filter(p => p.protocol === 'HTTPS').length,
    otherCount: packets.filter(p => !['TCP', 'UDP', 'ICMP', 'ARP', 'DNS', 'HTTP', 'HTTPS'].includes(p.protocol)).length,
    bandwidthKbps: isCapturing && !isPaused ? bandwidthKbps : 0,
    packetsPerSec: isCapturing && !isPaused ? packetsPerSec : 0,
    packetsPerSecond: isCapturing && !isPaused ? packetsPerSec : 0,
    activeAlertsCount: alerts.filter(a => a.status === 'New').length,
    timelineData
  };

  return (
    <div className="relative min-h-screen w-full bg-transparent text-[#f4f4f2] font-ui select-none antialiased overflow-x-hidden">
      
      {/* Global Background Video Atmosphere - Running Continuously Across ALL Pages */}
      <video
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle Living Network Dark Overlay */}
      <div className="bg-overlay" />

      {/* VIEW CONDITIONAL RENDERING - Strictly gated behind authentication */}
      {activeTab === 'auth' || (!isAuthenticated && activeTab !== 'landing') ? (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onReturnHome={() => setActiveTab('landing')}
        />
      ) : activeTab === 'landing' ? (
        <HomePage
          onLaunchDashboard={() => handleSelectTab('dashboard')}
          onSelectTab={handleSelectTab}
          isAuthenticated={isAuthenticated}
          onOpenAuthModal={() => setActiveTab('auth')}
          onSignOut={handleSignOut}
        />
      ) : (
        <div className="relative min-h-screen flex flex-col z-10">
          
          {/* Top Header */}
          <Header
            isCapturing={isCapturing}
            isPaused={isPaused}
            captureMode={captureMode}
            onStart={isPaused ? handleResume : handleStartLive}
            onStartDemo={handleStartDemo}
            onPause={handlePause}
            onStop={handleStop}
            activeInterface={activeInterface}
            totalPackets={stats.totalPackets}
            packetsPerSec={packetsPerSec}
            bandwidthKbps={bandwidthKbps}
            alerts={alerts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenDocs={() => handleSelectTab('settings')}
            onSelectTab={handleSelectTab}
            userRole={userRole}
            setUserRole={setUserRole}
            pendingApprovalsCount={approvals.filter(a => a.status === 'PENDING').length}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onToggleEntityGraph={() => setIsEntityGraphOpen(prev => !prev)}
            currentTab={activeTab}
            onSignOut={handleSignOut}
            isAuthenticated={isAuthenticated}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          {/* Main Body Layout with Floating Glass Surfaces */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar Navigation - 8 Core Workstation Modules */}
            <Sidebar
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              alertCount={alerts.filter(a => a.status === 'New').length}
              incidentCount={incidents.filter(i => i.status === 'NEW' || i.status === 'INVESTIGATING').length}
              pendingApprovalsCount={approvals.filter(a => a.status === 'PENDING').length}
              onSignOut={handleSignOut}
            />

            {/* Dynamic Main View Tab Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              
              {/* PAGE 1: Overview & Telemetry Dashboard */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  packets={packets}
                  alerts={alerts}
                  isCapturing={isCapturing}
                  isPaused={isPaused}
                  captureMode={captureMode}
                  onStartLive={handleStartLive}
                  onStartDemo={handleStartDemo}
                  onLoadDemoDataset={handleLoadDemoDataset}
                  onPause={handlePause}
                  onStop={handleStop}
                  onSaveSession={handleSaveSession}
                  onSelectPacket={(p) => {
                    setSelectedPacket(p);
                    setActiveTab('analysis');
                  }}
                  onSelectTab={setActiveTab}
                />
              )}

              {/* PAGE 2: Live Packet Capture */}
              {activeTab === 'capture' && (
                <LiveCaptureView
                  packets={packets}
                  isCapturing={isCapturing}
                  isPaused={isPaused}
                  captureMode={captureMode}
                  onStart={isPaused ? handleResume : handleStartLive}
                  onStartDemo={handleStartDemo}
                  onLoadDemoDataset={handleLoadDemoDataset}
                  onPause={handlePause}
                  onStop={handleStop}
                  onClear={handleClear}
                  selectedPacket={selectedPacket}
                  onSelectPacket={setSelectedPacket}
                  protocolFilter={protocolFilter}
                  setProtocolFilter={setProtocolFilter}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onAnalyzeWithAI={(p) => setAiModalTarget({ packet: p })}
                  onExportPackets={handleExportPackets}
                />
              )}

              {/* PAGE 3: Packet Dissection & Hex Inspector */}
              {activeTab === 'analysis' && (
                <PacketAnalysisView
                  packet={selectedPacket}
                  packets={packets}
                  captureMode={captureMode}
                  onSelectPacket={setSelectedPacket}
                  onAnalyzeWithAI={(p) => setAiModalTarget({ packet: p })}
                  onStartLive={handleStartLive}
                  onLoadDemoDataset={handleLoadDemoDataset}
                  onSendToInvestigation={(p) => {
                    setSelectedPacket(p);
                    setActiveTab('incidents');
                  }}
                  onCreateIncidentFromPacket={handleCreateIncidentFromPacket}
                  onPreserveEvidence={handlePreserveEvidenceFromPacket}
                />
              )}

              {/* PAGE 4: Threat Alerts Radar */}
              {activeTab === 'alerts' && (
                <ThreatAlertsView
                  alerts={alerts}
                  captureMode={captureMode}
                  onTriggerAttack={handleTriggerAttack}
                  onAnalyzeAlertWithAI={(alt) => setAiModalTarget({ alert: alt })}
                  onResolveAlert={(id) => {
                    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
                  }}
                  onInvestigateAlert={handleInvestigateAlert}
                  onMarkFalsePositive={handleMarkFalsePositive}
                />
              )}

              {/* PAGE 5: Network Traffic Statistics */}
              {activeTab === 'statistics' && (
                <StatisticsView
                  stats={stats}
                  packets={packets}
                  captureMode={captureMode}
                  onExport={handleExportPackets}
                  onStartLive={handleStartLive}
                  onLoadDemoDataset={handleLoadDemoDataset}
                />
              )}

              {/* PAGE 6: Incidents & Agent Workstation */}
              {activeTab === 'incidents' && (
                <IncidentsAndAgentsView
                  incidents={incidents}
                  setIncidents={setIncidents}
                  alerts={alerts}
                  packets={packets}
                  approvals={approvals}
                  onDecideApproval={handleDecideApproval}
                  auditTrail={auditTrail}
                  userRole={userRole}
                  onSelectPacket={(pkt) => {
                    setSelectedPacket(pkt);
                    setActiveTab('analysis');
                  }}
                  onOpenCopilotWithContext={(ctx) => {
                    setCopilotContext(ctx);
                    setIsCopilotOpen(true);
                  }}
                  captureMode={captureMode}
                />
              )}

              {/* MODULE 06: Evidence Vault */}
              {activeTab === 'evidence' && (
                <EvidenceVaultView
                  evidenceItems={evidenceItems}
                  onRefreshEvidence={() => {
                    fetch('/api/evidence')
                      .then(r => r.json())
                      .then(d => { if (d.vault?.items) setEvidenceItems(d.vault.items); })
                      .catch(() => {});
                  }}
                  userRole={userRole}
                />
              )}

              {/* MODULE 07: Reports & PCAP Vault */}
              {activeTab === 'reports' && (
                <ReportsView
                  stats={stats}
                  packets={packets}
                  alerts={alerts}
                  captureMode={captureMode}
                  onExport={handleExportPackets}
                  sessions={savedSessions}
                  onLoadSession={handleLoadSession}
                  onDeleteSession={handleDeleteSession}
                  onImportPcap={handleImportPcap}
                />
              )}

              {/* PAGE 8: Settings & Security Configuration */}
              {activeTab === 'settings' && (
                <SettingsView
                  interfaces={interfaces}
                  activeInterface={activeInterface}
                  onSelectInterface={setActiveInterface}
                  maxBuffer={maxBuffer}
                  setMaxBuffer={setMaxBuffer}
                  promiscuousMode={promiscuousMode}
                  setPromiscuousMode={setPromiscuousMode}
                  captureMode={captureMode}
                />
              )}

            </main>

          </div>

          {/* Gemini AI Copilot Threat Analysis Modal */}
          {aiModalTarget && (
            <AIThreatModal
              packet={aiModalTarget.packet}
              alert={aiModalTarget.alert}
              onClose={() => setAiModalTarget(null)}
            />
          )}

          {/* Sovereign Security Copilot Modal */}
          {isCopilotOpen && (
            <SecurityCopilotModal
              isOpen={isCopilotOpen}
              onClose={() => setIsCopilotOpen(false)}
              selectedPacket={copilotContext.packet || selectedPacket}
              selectedAlert={copilotContext.alert || (alerts.length > 0 ? alerts[0] : null)}
              selectedIncident={copilotContext.incident || (incidents.length > 0 ? incidents[0] : null)}
              allPackets={packets}
              allAlerts={alerts}
            />
          )}

          {/* Command Palette Modal (Ctrl+K) */}
          <CommandPaletteModal
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onSelectTab={handleSelectTab}
            onStartLiveCapture={handleStartLive}
            onStopCapture={handleStop}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            onSelectPacket={(p) => {
              setSelectedPacket(p);
              handleSelectTab('analysis');
            }}
            packets={packets}
            alerts={alerts}
            incidents={incidents}
            evidence={evidenceItems}
            rules={detectionRules}
          />

          {/* Network Entity Graph Overlay Modal */}
          {isEntityGraphOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-black/85 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-6 relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">
                    Network Entity Topology & Relationship Matrix
                  </h2>
                  <button
                    onClick={() => setIsEntityGraphOpen(false)}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer"
                  >
                    Close (ESC)
                  </button>
                </div>
                <NetworkEntityGraphView
                  packets={packets}
                  alerts={alerts}
                  incidents={incidents}
                  onSelectEntity={(entityId) => {
                    setSearchQuery(entityId);
                    setIsEntityGraphOpen(false);
                    handleSelectTab('capture');
                  }}
                  onSelectPacket={(pkt) => {
                    setSelectedPacket(pkt);
                    setIsEntityGraphOpen(false);
                    handleSelectTab('analysis');
                  }}
                />
              </div>
            </div>
          )}

        </div>
      )}

      {/* Sovereign Authentication & Role Gate Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default App;
