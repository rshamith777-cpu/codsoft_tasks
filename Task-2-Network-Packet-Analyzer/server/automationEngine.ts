import crypto from 'crypto';
import { 
  Incident, 
  ThreatAlert, 
  Packet, 
  ApprovalRequest, 
  ApprovalActionType, 
  ApprovalStatus, 
  AuditLogEntry, 
  UserRole,
  ProposedRule,
  DetectionRule,
  IncidentStatus
} from '../src/types';

export interface AutomationRuleConfig {
  id: string;
  name: string;
  trigger: string;
  conditions: string;
  action: string;
  enabled: boolean;
  requiresApproval: boolean;
  lastRun?: string;
  runCount: number;
}

export class SecurityAutomationEngine {
  // In-memory persistent stores
  public incidents: Incident[] = [];
  public approvalRequests: ApprovalRequest[] = [];
  public auditTrail: AuditLogEntry[] = [];
  public proposedRules: ProposedRule[] = [];

  public automationRules: AutomationRuleConfig[] = [
    {
      id: 'AUTO-001',
      name: 'High-Severity Alert to Incident',
      trigger: 'ALERT_TRIGGERED',
      conditions: 'Severity in [High, Critical]',
      action: 'Automatically instantiate new Incident in queue',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-002',
      name: 'Incident Evidence Aggregation',
      trigger: 'INCIDENT_CREATED',
      conditions: 'Always',
      action: 'Harvest and index matching source/destination packets',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-003',
      name: 'Session Stop Summarizer',
      trigger: 'CAPTURE_STOPPED',
      conditions: 'Packets > 0',
      action: 'Generate structured capture summary',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-004',
      name: 'PCAP Ingestion Pipeline',
      trigger: 'PCAP_IMPORTED',
      conditions: 'File valid',
      action: 'Run threat heuristics and generate correlation summary',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-005',
      name: 'Source Alert Clustering',
      trigger: 'MULTIPLE_ALERTS_SAME_SRC',
      conditions: 'Alert count >= 2 for same IP within 60s',
      action: 'Consolidate into single investigation incident',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-006',
      name: 'Incident Resolution Report',
      trigger: 'INCIDENT_RESOLVED',
      conditions: 'Status changes to RESOLVED',
      action: 'Compile final incident report draft',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-007',
      name: 'Session Baseline Delta Assessment',
      trigger: 'CAPTURE_STARTED',
      conditions: 'Historical baseline exists',
      action: 'Compute baseline deviation indicators',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-008',
      name: 'MITRE ATT&CK Enrichment',
      trigger: 'THREAT_RULE_MATCH',
      conditions: 'Rule contains MITRE technique ID',
      action: 'Enrich alert with MITRE taxonomy and recommended action',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-009',
      name: 'Forensic Export Audit Record',
      trigger: 'DATA_EXPORT',
      conditions: 'Export requested',
      action: 'Record immutable forensic export audit entry',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-010',
      name: 'Automated Rule Testing on Proposal',
      trigger: 'RULE_PROPOSED',
      conditions: 'New rule drafted by Detection Agent',
      action: 'Execute against test PCAP fixture and await analyst approval',
      enabled: true,
      requiresApproval: true,
      runCount: 0
    },
    {
      id: 'AUTO-011',
      name: 'Repeated Alert Escalation',
      trigger: 'REPEATED_ALERT_THRESHOLD',
      conditions: 'Alert count > 5 for same host within 30s',
      action: 'Escalate incident severity to CRITICAL and flag for immediate containment',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-012',
      name: 'Evidence Integrity Failure Alarm',
      trigger: 'TAMPER_ALERT_RAISED',
      conditions: 'Hash mismatch during continuous or on-demand verification',
      action: 'Instantiate Critical Incident: Cryptographic Evidence Tampering',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-013',
      name: 'Known Malicious IOC Detection',
      trigger: 'IOC_MATCH_FOUND',
      conditions: 'Wire packet matches high-confidence IOC watchlist',
      action: 'Instantiate automated investigation workspace and bind IOC metadata',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-014',
      name: 'Statistical Baseline Deviation Trigger',
      trigger: 'BASELINE_DEVIATION',
      conditions: 'Bandwidth or packet rate deviation > 2.5 sigma from empirical baseline',
      action: 'Launch Anomaly Investigator Agent and alert SOC floor',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-015',
      name: 'Evidence Retention Threshold Review',
      trigger: 'RETENTION_STATUS_CHECK',
      conditions: 'Evidence artifacts older than 90 days in ACTIVE state',
      action: 'Transition retention state to ARCHIVED and queue analyst review',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-016',
      name: 'Repeated False Positive Rule Tuning',
      trigger: 'FALSE_POSITIVE_FLAGGED',
      conditions: 'Same rule marked false positive >= 3 times by analysts',
      action: 'Dispatch Detection Engineering Agent to propose threshold adjustment',
      enabled: true,
      requiresApproval: true,
      runCount: 0
    },
    {
      id: 'AUTO-017',
      name: 'Critical Incident Analyst Notification',
      trigger: 'CRITICAL_INCIDENT_OPENED',
      conditions: 'Severity is CRITICAL',
      action: 'Broadcast urgent SOC banner and dispatch Packet Forensics inspector',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-018',
      name: 'Agent Engine Execution Failure Guard',
      trigger: 'AGENT_TASK_FAILED',
      conditions: 'Agent execution throws runtime or parse exception',
      action: 'Log security failure audit record and degrade subsystem status',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-019',
      name: 'Security Dossier Generation Audit',
      trigger: 'DOSSIER_COMPILED',
      conditions: 'Executive or Forensic security report generated',
      action: 'Record immutable dossier publication audit log with content hash',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    },
    {
      id: 'AUTO-020',
      name: 'Unauthorized Role Violation Alert',
      trigger: 'RBAC_ACCESS_DENIED',
      conditions: 'User role lacks permission for privileged operation (HTTP 403)',
      action: 'Record privileged access violation audit event with source IP and role',
      enabled: true,
      requiresApproval: false,
      runCount: 0
    }
  ];

  constructor() {
    this.recordAudit({
      user: 'SYSTEM',
      role: 'ADMIN',
      action: 'AUTOMATION_ENGINE_INIT',
      target: 'SecurityAutomationEngine',
      result: 'SUCCESS',
      metadata: { rulesCount: this.automationRules.length }
    });
  }

  /**
   * Log an immutable audit entry
   * Zero Math.random - uses deterministic cryptographic hash digest
   */
  public recordAudit(entry: {
    user: string;
    role: UserRole;
    action: string;
    target: string;
    result: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'PENDING';
    approvalId?: string;
    metadata?: Record<string, any>;
  }): AuditLogEntry {
    const rawEntropy = `${entry.user}|${entry.action}|${entry.target}|${entry.result}|${Date.now()}`;
    const hash = crypto.createHash('sha256').update(rawEntropy).digest('hex').slice(0, 6).toUpperCase();

    const log: AuditLogEntry = {
      id: `AUDIT-${Date.now().toString(36).toUpperCase()}-${hash}`,
      timestamp: new Date().toISOString(),
      user: entry.user,
      role: entry.role,
      action: entry.action,
      target: entry.target,
      result: entry.result,
      approvalId: entry.approvalId,
      metadata: entry.metadata
    };
    this.auditTrail.unshift(log);
    // Keep bounded in memory
    if (this.auditTrail.length > 500) {
      this.auditTrail.pop();
    }
    return log;
  }

  /**
   * Safe status transition for Incident state machine
   */
  public transitionIncidentStatus(
    incidentId: string,
    targetStatus: IncidentStatus,
    user: string,
    role: UserRole,
    reason?: string
  ): { success: boolean; incident?: Incident; error?: string } {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (!incident) {
      return { success: false, error: `Incident ${incidentId} not found` };
    }

    const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
      'NEW': ['TRIAGED', 'INVESTIGATING', 'FALSE_POSITIVE'],
      'TRIAGED': ['INVESTIGATING', 'CONTAINMENT_PENDING', 'FALSE_POSITIVE'],
      'INVESTIGATING': ['CONTAINMENT_PENDING', 'CONTAINED', 'RESOLVED', 'FALSE_POSITIVE', 'MONITORING'],
      'CONTAINMENT_PENDING': ['CONTAINED', 'INVESTIGATING'],
      'CONTAINED': ['MONITORING', 'RESOLVED', 'INVESTIGATING'],
      'MONITORING': ['RESOLVED', 'INVESTIGATING'],
      'RESOLVED': ['INVESTIGATING'], // Can be reopened
      'FALSE_POSITIVE': [] // Terminal
    };

    const allowed = validTransitions[incident.status] || [];
    if (!allowed.includes(targetStatus)) {
      return { 
        success: false, 
        error: `Invalid transition from ${incident.status} to ${targetStatus}. Allowed: [${allowed.join(', ')}]` 
      };
    }

    const previousStatus = incident.status;
    incident.status = targetStatus;

    // Add analyst note
    if (!incident.analystNotes) incident.analystNotes = [];
    incident.analystNotes.push({
      id: `NOTE-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      author: user,
      note: `Status transitioned: ${previousStatus} -> ${targetStatus}. Reason: ${reason || 'Operational update'}`
    });

    this.recordAudit({
      user,
      role,
      action: 'INCIDENT_STATUS_TRANSITION',
      target: `${incident.id} (${previousStatus} -> ${targetStatus})`,
      result: 'SUCCESS',
      metadata: { previousStatus, targetStatus, reason }
    });

    return { success: true, incident };
  }

  /**
   * Safe Automation 1 & 5: Handle incoming alert, potentially creating or correlating into an incident
   */
  public handleAlertAutomation(alert: ThreatAlert, allPackets: Packet[]): Incident | null {
    const auto001 = this.automationRules.find(r => r.id === 'AUTO-001' && r.enabled);
    if (!auto001) return null;

    const isHighOrCritical = alert.severity === 'High' || alert.severity === 'Critical';
    if (!isHighOrCritical) return null;

    // Check if an existing open incident shares the same source IP (Automation 5)
    const existing = this.incidents.find(inc => 
      inc.sourceHost === alert.sourceIp && 
      inc.status !== 'RESOLVED' && 
      inc.status !== 'FALSE_POSITIVE'
    );

    if (existing) {
      // Correlate into existing incident
      if (!existing.relatedAlertIds.includes(alert.id)) {
        existing.relatedAlertIds.push(alert.id);
      }
      if (alert.packetNo && !existing.relatedPacketIds.includes(alert.packetNo)) {
        existing.relatedPacketIds.push(alert.packetNo);
      }
      if (alert.mitreTechnique && !existing.mitreTechniques.includes(alert.mitreTechnique)) {
        existing.mitreTechniques.push(alert.mitreTechnique);
      }
      existing.lastSeen = alert.timestamp;

      this.recordAudit({
        user: 'AGENT_AUTOMATION',
        role: 'ANALYST',
        action: 'CORRELATE_ALERT_TO_INCIDENT',
        target: existing.id,
        result: 'SUCCESS',
        metadata: { alertId: alert.id, sourceIp: alert.sourceIp }
      });
      return existing;
    }

    // Otherwise create new Incident (Automation 1)
    const relatedPackets = allPackets
      .filter(p => p.sourceIp === alert.sourceIp || p.destinationIp === alert.sourceIp)
      .map(p => p.no || p.id || 0)
      .filter(Boolean);

    const newIncident: Incident = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      title: `${alert.alertType} Investigation (${alert.sourceIp})`,
      severity: (alert.severity as any) || 'High',
      status: 'NEW',
      firstSeen: alert.timestamp,
      lastSeen: alert.timestamp,
      sourceHost: alert.sourceIp,
      destinationHosts: alert.destinationIp ? [alert.destinationIp] : ['192.168.1.1'],
      protocols: ['TCP'],
      relatedAlertIds: [alert.id],
      relatedPacketIds: relatedPackets.length > 0 ? relatedPackets.slice(0, 50) : (alert.packetNo ? [alert.packetNo] : []),
      mitreTechniques: alert.mitreTechnique ? [alert.mitreTechnique] : ['T1046 Network Service Discovery'],
      confidence: 0.88,
      assignedAnalyst: 'SOC-Automated',
      analystNotes: [
        {
          id: `NOTE-${Date.now()}`,
          timestamp: new Date().toISOString().substring(11, 19),
          author: 'Threat Correlation Agent',
          note: `Incident automatically created from detection alert ${alert.id} (${alert.alertType}). Initial evidence linked.`
        }
      ],
      aiSummary: `Automated correlation initiated for suspicious behavior from ${alert.sourceIp}. Evidence indicates ${alert.alertType}.`,
      recommendedNextSteps: [
        'Inspect related packet payload headers for probe pattern.',
        'Verify target host port accessibility.',
        'Review perimeter firewall rule set.'
      ],
      evidenceSummary: `1 alert triggered with ${relatedPackets.length} related packets gathered from traffic stream.`
    };

    this.incidents.unshift(newIncident);
    auto001.runCount++;
    auto001.lastRun = new Date().toISOString();

    this.recordAudit({
      user: 'AGENT_AUTOMATION',
      role: 'ANALYST',
      action: 'CREATE_INCIDENT',
      target: newIncident.id,
      result: 'SUCCESS',
      metadata: { alertId: alert.id, sourceIp: alert.sourceIp }
    });

    return newIncident;
  }

  /**
   * Request a Human-in-the-Loop Approval for potentially disruptive action
   */
  public requestApproval(params: {
    actionType: ApprovalActionType;
    requestedBy: string;
    reason: string;
    expectedImpact: string;
    rollbackPlan: string;
    targetEntity: string;
  }): ApprovalRequest {
    const req: ApprovalRequest = {
      id: `APP-${Date.now().toString().slice(-6)}`,
      actionType: params.actionType,
      requestedBy: params.requestedBy,
      reason: params.reason,
      expectedImpact: params.expectedImpact,
      rollbackPlan: params.rollbackPlan,
      targetEntity: params.targetEntity,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    };

    this.approvalRequests.unshift(req);

    this.recordAudit({
      user: params.requestedBy,
      role: 'ANALYST',
      action: 'REQUEST_APPROVAL',
      target: req.id,
      result: 'PENDING',
      metadata: { actionType: req.actionType, targetEntity: req.targetEntity }
    });

    return req;
  }

  /**
   * Human Analyst decides on an approval request (Approve or Reject)
   */
  public decideApproval(
    approvalId: string, 
    decision: 'APPROVED' | 'REJECTED', 
    analystName: string, 
    role: UserRole
  ): { success: boolean; request?: ApprovalRequest; message: string } {
    const req = this.approvalRequests.find(a => a.id === approvalId);
    if (!req) {
      return { success: false, message: `Approval request ${approvalId} not found` };
    }

    if (req.status !== 'PENDING') {
      return { success: false, message: `Approval request ${approvalId} is already ${req.status}` };
    }

    req.status = decision;
    req.decidedBy = analystName;
    req.decisionTimestamp = new Date().toISOString();

    this.recordAudit({
      user: analystName,
      role,
      action: `DECISION_${decision}`,
      target: req.id,
      result: decision === 'APPROVED' ? 'SUCCESS' : 'BLOCKED',
      approvalId: req.id,
      metadata: { actionType: req.actionType, targetEntity: req.targetEntity }
    });

    return { success: true, request: req, message: `Action ${req.actionType} was ${decision} by ${analystName}` };
  }
}

export const globalAutomationEngine = new SecurityAutomationEngine();
