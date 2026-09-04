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
  | 'DEMO_RESET';

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
}

export interface ThreatModelItem {
  id: string;
  threat: string;
  impact: string;
  mitigation: string;
  status: 'IMPLEMENTED' | 'ACTIVE_ENFORCEMENT' | 'MONITORED';
  category: string;
}
