export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Finding {
  id: string;
  scanId: string;
  ruleId: string;
  title: string;
  severity: Severity;
  cwe: string;
  cweTitle?: string;
  owaspCategory?: string;
  file: string;
  line: number;
  column?: number;
  codeSnippet: string;
  evidence: string;
  description: string;
  impact: string;
  remediation: string;
  scanner: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  fixSnippet?: string;
}

export interface ScanResult {
  id: string;
  projectName: string;
  sourceType: 'UPLOAD' | 'PASTE' | 'DEMO' | 'REPOSITORY' | 'ZIP';
  isDemo: boolean;
  startedAt: string;
  completedAt: string;
  status: 'COMPLETED' | 'FAILED' | 'SCANNING';
  filesScanned: number;
  linesScanned: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  securityScore: number | null; // 0 - 100, or null if no scan
  languages: Record<string, number>;
  findings: Finding[];
  files: Array<{
    path: string;
    content: string;
    language: string;
    lines: number;
    findingsCount: number;
  }>;
  scannerEngine: {
    name: string;
    version: string;
    activeRules: number;
  };
}

export interface SecurityRule {
  id: string;
  name: string;
  cwe: string;
  cweTitle: string;
  owasp: string;
  severity: Severity;
  language: string;
  description: string;
  detectionMethod: string;
  impact: string;
  remediation: string;
  exampleVulnerable: string;
  exampleSecure: string;
}

export interface AIAnalysisResponse {
  findingId: string;
  exploitMechanics: string;
  attackVector: string;
  potentialImpact: string;
  remediationGuidance: string;
  secureCodePatch: string;
  cveReferences?: string[];
  mitigationPriority: 'IMMEDIATE' | 'HIGH' | 'SCHEDULED';
}

export type AuditEventType = 
  | 'SCAN_STARTED'
  | 'SCAN_COMPLETED'
  | 'SCAN_FAILED'
  | 'FINDING_VIEWED'
  | 'REPORT_GENERATED'
  | 'REPORT_EXPORTED'
  | 'CONFIG_CHANGED'
  | 'AI_REQUEST'
  | 'SOURCE_UPLOADED'
  | 'SCAN_DELETED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  description: string;
  metadata?: Record<string, any>;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';
}

export type DiffStatus = 'NEW' | 'RESOLVED' | 'UNCHANGED' | 'REGRESSED';

export interface ComparedFinding {
  finding: Finding;
  status: DiffStatus;
  notes?: string;
}

export interface ScanComparisonResult {
  baseScanId: string;
  compareScanId: string;
  baseProjectName: string;
  compareProjectName: string;
  baseScore: number | null;
  compareScore: number | null;
  scoreDelta: number;
  newFindings: Finding[];
  resolvedFindings: Finding[];
  unchangedFindings: Finding[];
  regressedFindings: Finding[];
  totalDiffCount: number;
}
