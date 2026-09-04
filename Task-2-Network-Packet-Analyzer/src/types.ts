export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'ARP' | 'DNS' | 'HTTP' | 'HTTPS' | 'DHCP' | 'IPv4' | 'IPv6' | string;

export type AlertSeverity = 'High' | 'Medium' | 'Low' | 'Critical';
export type AlertStatus = 'New' | 'Investigating' | 'Resolved';
export type CaptureMode = 'IDLE' | 'LIVE' | 'DEMO' | 'PCAP';

export interface Packet {
  id?: number;
  no?: number;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: ProtocolType;
  length: number;
  ttl?: number;
  flags?: string;
  macSource?: string;
  macDest?: string;
  hostnameSource?: string;
  hostnameDest?: string;
  info: string;
  payloadHex?: string;
  payloadAscii?: string;
  hexDump?: string;
  isSuspicious?: boolean;
  threatType?: string;
  threatSeverity?: AlertSeverity;
  threatLevel?: string;
  rawBytes?: string;
  captureSource?: 'LIVE_NETWORK' | 'DEMO_MODE' | 'PCAP_IMPORT';
  tcpFlags?: {
    syn?: boolean;
    ack?: boolean;
    psh?: boolean;
    fin?: boolean;
    rst?: boolean;
    urg?: boolean;
  };
  alerts?: Array<{
    type: string;
    severity: string;
    description: string;
    mitre?: string;
    action?: string;
  }>;
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  alertType: string;
  sourceIp: string;
  destinationIp?: string;
  destIp?: string;
  description: string;
  severity: AlertSeverity | string;
  status: AlertStatus | string;
  packetNo?: number;
  details?: string;
  mitreId?: string;
  mitreTechnique?: string;
  recommendedAction?: string;
  isSimulation?: boolean;
}

export interface CaptureStats {
  totalPackets: number;
  tcpCount: number;
  udpCount: number;
  icmpCount: number;
  arpCount: number;
  dnsCount: number;
  httpCount?: number;
  httpsCount?: number;
  otherCount?: number;
  bandwidthKbps: number;
  packetsPerSec?: number;
  packetsPerSecond?: number;
  activeAlertsCount?: number;
  timelineData?: Array<{
    time: string;
    bandwidth: number;
    packets: number;
  }>;
}

export interface SavedSession {
  id: string;
  fileName?: string;
  name?: string;
  date?: string;
  timestamp?: string;
  duration?: string;
  packetsCount?: number;
  packetCount?: number;
  fileSize?: string;
  packets: Packet[];
  interfaceName?: string;
  source?: string;
}

export interface NetworkInterface {
  id: string;
  name: string;
  ip?: string;
  ipAddress?: string;
  mac: string;
  type?: 'Wireless' | 'Ethernet' | 'Loopback' | 'Virtual';
  status?: string;
  description?: string;
  isPromiscuous?: boolean;
  speed?: string;
}

export interface DnsLookupResult {
  host?: string;
  domain?: string;
  addresses?: string[];
  records?: {
    A: string[];
    AAAA?: string[];
  };
  ttl?: number;
  family?: number;
  latencyMs: number;
  resolvedAt?: string;
  provider?: string;
}

export interface RealTimeHostStats {
  hostname: string;
  platform: string;
  uptimeSeconds: number;
  freeMemMB: number;
  totalMemMB: number;
  cpuModel: string;
  activeInterfaces: Array<{
    name: string;
    address: string;
    family: string;
    mac: string;
    internal: boolean;
  }>;
}

export interface AIThreatAnalysisResponse {
  summary: string;
  severity?: string;
  riskAssessment?: string;
  mitreMapping?: string;
  mitreTechnique?: string;
  mitreDescription?: string;
  recommendations?: string[];
  suggestedActions?: string[];
  rawPacketDetails?: string;
}

// ==========================================
// AGENTIC SECURITY WORKSTATION DATA MODELS
// ==========================================

export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export type IncidentStatus = 'NEW' | 'TRIAGED' | 'INVESTIGATING' | 'CONTAINMENT_PENDING' | 'MONITORING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface IncidentAnalystNote {
  id: string;
  timestamp: string;
  author: string;
  note: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  firstSeen: string;
  lastSeen: string;
  sourceHost: string;
  destinationHosts: string[];
  protocols: string[];
  relatedAlertIds: string[];
  relatedPacketIds: number[];
  mitreTechniques: string[];
  confidence: number;
  assignedAnalyst: string;
  analystNotes: IncidentAnalystNote[];
  aiSummary?: string;
  recommendedNextSteps?: string[];
  evidenceSummary?: string;
}

export type AgentType = 
  | 'PACKET_TRIAGE'
  | 'THREAT_CORRELATION'
  | 'PROTOCOL_ANALYST'
  | 'INCIDENT_INVESTIGATOR'
  | 'DETECTION_ENGINEERING'
  | 'NETWORK_BASELINE'
  | 'EVIDENCE_TIMELINE'
  | 'SECURITY_REPORT'
  | 'SECURITY_COPILOT'
  | 'IOC_HUNTER'
  | 'ATTACK_MAPPER'
  | 'ANOMALY_INVESTIGATOR'
  | 'FALSE_POSITIVE_ANALYST'
  | 'INCIDENT_SUMMARIZER'
  | 'EVIDENCE_VALIDATOR'
  | 'RESPONSE_PLANNER';

export interface AgentExecutionRecord {
  runId: string;
  agent: AgentType;
  startTime: string;
  endTime: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  confidence: number;
  facts: string[];
  inferences: string[];
  actionsRecommended: string[];
}

export type AgentTaskStatus = 'QUEUED' | 'RUNNING' | 'COMPLETE' | 'FAILED' | 'AWAITING_APPROVAL' | 'CANCELLED';

export interface AgentTask {
  id: string;
  agentType: AgentType;
  trigger: string;
  startedAt: string;
  completedAt?: string;
  status: AgentTaskStatus;
  sourceRef?: string;
  result?: any;
  requiresApproval?: boolean;
  approvalId?: string;
  error?: string;
}

export type ApprovalActionType = 
  | 'BLOCK_IP' 
  | 'ISOLATE_HOST'
  | 'DISABLE_RULE' 
  | 'MODIFY_THRESHOLD' 
  | 'EXPORT_SENSITIVE' 
  | 'DELETE_SESSION' 
  | 'PURGE_DATA'
  | 'PURGE_EVIDENCE'
  | 'REVOKE_SHARE'
  | 'CHANGE_INTERFACE';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string;
  actionType: ApprovalActionType;
  requestedBy: string;
  reason: string;
  expectedImpact: string;
  rollbackPlan: string;
  targetEntity: string;
  timestamp: string;
  status: ApprovalStatus;
  decidedBy?: string;
  decisionTimestamp?: string;
}

export type RuleState = 'ENABLED' | 'DISABLED' | 'TESTING';

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  mitreId: string;
  mitreTechnique: string;
  enabled: boolean;
  state?: RuleState;
  threshold: number;
  windowSeconds: number;
  category: string;
  observedCount?: number;
  lastObserved?: string;
  falsePositiveCount?: number;
}

export interface ProposedRule {
  id: string;
  proposedBy: string;
  rule: Partial<DetectionRule>;
  rationale: string;
  expectedMatches: string;
  potentialFalsePositives: string;
  testResults?: { passed: boolean; details: string; fixtureName: string };
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface NetworkBaseline {
  id: string;
  calculatedAt: string;
  sessionsAnalyzed: number;
  totalPackets: number;
  meanPacketRate: number;
  meanPacketSize?: number;
  rateRange: [number, number];
  protocolDist: Record<string, number>;
  topEndpoints: Array<{ ip: string; count: number; percentage: number }>;
  topPortPairs: Array<{ port: number; proto: string; count: number }>;
  dnsQueryRatePerMin: number;
}

export interface BaselineDeviation {
  metric: string;
  expected: string;
  actual: string;
  classification: 'EXPECTED' | 'UNUSUAL' | 'INVESTIGATE';
  details: string;
}

export interface ForensicTimelineItem {
  id: string;
  timestamp: string;
  title: string;
  type: 'DNS' | 'TCP' | 'ALERT' | 'INCIDENT' | 'SESSION' | 'ACTION' | 'AUDIT';
  source: string;
  destination: string;
  packetId?: number;
  alertId?: string;
  incidentId?: string;
  details: string;
}

export interface IOCItem {
  id: string;
  type: 'IP' | 'DOMAIN' | 'PORT' | 'HASH';
  value: string;
  source: string;
  addedAt: string;
  expiresAt?: string;
  notes: string;
  severity: AlertSeverity;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  target: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'PENDING';
  approvalId?: string;
  metadata?: Record<string, any>;
}

export type ReportType = 
  | 'CAPTURE_SUMMARY'
  | 'THREAT_INVESTIGATION'
  | 'INCIDENT_REPORT'
  | 'NETWORK_BASELINE'
  | 'FORENSIC_TIMELINE'
  | 'EXECUTIVE_REPORT';

export interface SecurityReport {
  id: string;
  title: string;
  type: ReportType;
  generatedAt: string;
  author: string;
  facts: string[];
  detectionResults: string[];
  aiInterpretation: string[];
  analystNotes: string[];
  recommendations: string[];
  referencedPackets: number[];
  referencedAlerts: string[];
  referencedIncidents: string[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  content: string;
  command?: string;
  citedIds?: {
    packetIds?: number[];
    alertIds?: string[];
    incidentIds?: string[];
  };
  untrustedPayloadWarning?: boolean;
}

// Cryptographic Evidence Vault
export type EvidenceType = 'PACKET' | 'SESSION' | 'ALERT' | 'INCIDENT' | 'EXPORT' | 'LOG';

export type CustodyAction = 'PRESERVED' | 'VIEWED' | 'EXPORTED' | 'VERIFIED' | 'ASSOCIATED' | 'REVOKED';

export interface CustodyRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: CustodyAction;
  target: string;
  hash: string;
  result: 'SUCCESS' | 'FAILURE';
  details?: string;
}

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  source: string;
  timestamp: string;
  contentHash: string; // SHA-256
  rawContent: string;
  metadata: Record<string, any>;
  retentionState: 'ACTIVE' | 'ARCHIVED' | 'LOCKED';
  createdAt: string;
  tampered?: boolean;
  sizeBytes?: number;
  relatedIncidentId?: string;
  relatedSessionId?: string;
  status?: 'VERIFIED' | 'TAMPERED' | 'MISSING' | 'PENDING';
  custodyLog?: CustodyRecord[];
}

export interface EvidenceVaultState {
  items: EvidenceItem[];
  lastVerificationTime?: string;
  tamperCount: number;
  healthy: boolean;
}

// System Diagnostics & Subsystem Health Observability
export type SubsystemHealth = 'HEALTHY' | 'DEGRADED' | 'OFFLINE';

export interface SystemDiagnosticsReport {
  timestamp: string;
  overallStatus: SubsystemHealth;
  subsystems: {
    captureEngine: { status: SubsystemHealth; details: string };
    detectionEngine: { status: SubsystemHealth; details: string; activeRules: number };
    correlationEngine: { status: SubsystemHealth; details: string };
    agentEngine: { status: SubsystemHealth; details: string; activeAgents: number };
    evidenceVault: { status: SubsystemHealth; details: string; itemsPreserved: number; tamperCount: number };
    auditStorage: { status: SubsystemHealth; details: string; logEntries: number };
    aiCopilot: { status: SubsystemHealth; details: string };
    storageBackend: { status: SubsystemHealth; details: string };
  };
}

// Network Entity Graph
export type EntityNodeType = 'IP' | 'HOST' | 'PORT' | 'PROTOCOL' | 'INCIDENT' | 'ALERT' | 'DOMAIN';

export interface EntityNode {
  id: string;
  label: string;
  type: EntityNodeType;
  severity?: AlertSeverity;
  packetCount?: number;
  connections?: number;
  isExternal?: boolean;
}

export interface EntityEdge {
  id: string;
  source: string;
  target: string;
  relation: 'COMMUNICATES_WITH' | 'TARGETS_PORT' | 'ASSOCIATED_WITH' | 'TRIGGERED_ALERT' | 'QUERIED_DNS';
  weight: number;
  protocol?: string;
}

export interface NetworkEntityGraphData {
  nodes: EntityNode[];
  edges: EntityEdge[];
  totalNodes: number;
  totalEdges: number;
}

// Security Posture Score
export interface SecurityPostureScore {
  score: number; // 0 - 100
  previousScore: number;
  delta: number;
  riskRating: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  factors: {
    criticalThreats: number;
    highThreats: number;
    mediumThreats: number;
    activeIncidents: number;
    unusualPorts: number;
  };
  highestImpactThreats: string[];
}

// Command Palette
export interface CommandPaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'AGENTS' | 'SEARCH' | 'COPILOT';
  shortcut?: string;
  action: () => void;
}


