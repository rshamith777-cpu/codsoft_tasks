export type UserRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt: string;
}

export interface FilePermission {
  id: string;
  fileId: string;
  userEmail: string;
  role: UserRole;
  grantedBy: string;
  createdAt: string;
}

export interface ShareLink {
  id: string;
  fileId: string;
  token: string;
  role: UserRole;
  expiresAt: string | null;
  revoked: boolean;
  accessCount: number;
  maxAccessCount: number | null;
  createdAt: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  ownerEmail?: string;
}

export interface VaultFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageId: string;
  encryptionAlgo: string; // 'AES-256-GCM'
  ivHex: string;
  authTagHex: string;
  sha256Hash: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  permissions: FilePermission[];
  shareLinks: ShareLink[];
  isDemo?: boolean;
  userRole?: UserRole; // current user's role on this file
}

export type AuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'UPLOAD'
  | 'ENCRYPT'
  | 'DOWNLOAD'
  | 'SHARE'
  | 'REVOKE'
  | 'DELETE'
  | 'FAILED_ACCESS'
  | 'INTEGRITY_FAILURE'
  | 'INTEGRITY_VERIFIED'
  | 'SETTING_CHANGE'
  | 'DEMO_SEED'
  | 'DEMO_RESET'
  | 'AGENT_ANALYSIS'
  | 'AUTOMATION_RUN'
  | 'REMEDIATION_ACTION';

export type AuditStatus = 'SUCCESS' | 'DENIED' | 'FAILED' | 'WARNING';
export type SeverityLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userEmail: string;
  resourceName: string;
  details: string;
  status: AuditStatus;
  severity: SeverityLevel;
  ipAddress?: string;
  fileId?: string;
}

export interface SecurityPosture {
  vaultStatus: 'SECURE' | 'WARNING' | 'COMPROMISED';
  totalFiles: number;
  encryptedFiles: number;
  activeShares: number;
  securityEventsCount: number;
  failedAccessCount: number;
  criticalEventsCount: number;
  integrityRate: number; // e.g. 100
  lastAuditTimestamp: string;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  defaultShareExpiryHours: number;
  enforceDownloadVerification: boolean;
  auditLoggingEnabled: boolean;
  rateLimitingEnabled: boolean;
  geminiApiKey?: string;
}

export interface ThreatModelItem {
  id: string;
  threat: string;
  impact: string;
  mitigation: string;
  status: 'IMPLEMENTED' | 'ACTIVE_ENFORCEMENT' | 'MONITORED';
  category: string;
}

// Security Agent Definitions
export type AgentState = 'READY' | 'ANALYZING' | 'WAITING APPROVAL' | 'COMPLETE' | 'FAILED';

export interface AgentAction {
  id: string;
  label: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: 'REVOKE_SHARE' | 'VERIFY_ALL' | 'UPDATE_POLICY' | 'DELETE_FILE' | 'PURGE_DEMO';
  targetId?: string;
  payload?: any;
}

export interface AgentReport {
  agentId: string;
  agentName: string;
  purpose: string;
  state: AgentState;
  lastRunTimestamp: string;
  factsObserved: string[];
  derivedAssessment: string;
  severity: SeverityLevel;
  recommendedActions: AgentAction[];
}

// Automation Definitions
export type AutomationState =
  | 'ACTIVE'
  | 'IDLE'
  | 'RUNNING'
  | 'AWAITING APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'DISABLED';

export interface AutomationItem {
  id: string; // e.g. 'AUTO-001'
  name: string;
  trigger: string;
  actionSummary: string;
  state: AutomationState;
  lastRun: string;
  outcome: string;
  evidence: string;
  approvalRequired: boolean;
  severity: SeverityLevel;
}

export interface CopilotResponse {
  available: boolean;
  source: 'GEMINI_AI' | 'LOCAL SECURITY ANALYSIS' | 'UNAVAILABLE';
  text?: string;
  error?: string;
  fallbackLabel?: string;
  localAnalysis?: string;
}
