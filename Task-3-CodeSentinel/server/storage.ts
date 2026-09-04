import { ScanResult, AuditLogEntry, AuditEventType, ScanComparisonResult, Finding } from '../src/types.ts';
import fs from 'fs';
import path from 'path';

class StorageManager {
  private scans: Map<string, ScanResult> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private storageFile: string;
  private auditFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.error('Could not create data dir:', err);
      }
    }
    this.storageFile = path.join(dataDir, 'scans.json');
    this.auditFile = path.join(dataDir, 'audit_log.json');
    this.loadFromDisk();
  }

  private loadFromDisk() {
    // 1. Load historical scans
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            for (const scan of list) {
              if (scan && scan.id) {
                this.scans.set(scan.id, scan);
              }
            }
          }
        } catch {
          console.warn('Storage: Corrupt scans.json detected. Backing up and initializing empty storage.');
          fs.renameSync(this.storageFile, `${this.storageFile}.bak-${Date.now()}`);
        }
      }
    } catch (err) {
      console.warn('Failed to load historical scans from disk:', err);
    }

    // 2. Load audit logs
    try {
      if (fs.existsSync(this.auditFile)) {
        const raw = fs.readFileSync(this.auditFile, 'utf-8');
        try {
          const logs = JSON.parse(raw);
          if (Array.isArray(logs)) {
            this.auditLogs = logs;
          }
        } catch {
          console.warn('Storage: Corrupt audit_log.json detected. Backing up and initializing empty audit log.');
          fs.renameSync(this.auditFile, `${this.auditFile}.bak-${Date.now()}`);
          this.auditLogs = [];
        }
      }
    } catch (err) {
      console.warn('Failed to load audit logs from disk:', err);
    }
  }

  private persistScansToDisk() {
    try {
      const list = Array.from(this.scans.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save scans to disk:', err);
    }
  }

  private persistAuditToDisk() {
    try {
      // Keep last 1000 audit records to avoid unbounded growth
      const trimmed = this.auditLogs.slice(-1000);
      fs.writeFileSync(this.auditFile, JSON.stringify(trimmed, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save audit logs to disk:', err);
    }
  }

  public saveScan(scan: ScanResult): ScanResult {
    this.scans.set(scan.id, scan);
    this.persistScansToDisk();

    this.recordAuditEvent({
      eventType: 'SCAN_COMPLETED',
      description: `Assessment "${scan.projectName}" (${scan.id}) completed with ${scan.findings.length} findings.`,
      severity: scan.criticalCount > 0 ? 'CRITICAL' : scan.highCount > 0 ? 'WARNING' : 'INFO',
      metadata: {
        scanId: scan.id,
        projectName: scan.projectName,
        findingsCount: scan.findings.length,
        securityScore: scan.securityScore,
        critical: scan.criticalCount,
        high: scan.highCount
      }
    });

    return scan;
  }

  public getScan(id: string): ScanResult | undefined {
    return this.scans.get(id);
  }

  public getAllScans(): ScanResult[] {
    return Array.from(this.scans.values()).sort((a, b) => {
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });
  }

  public deleteScan(id: string): boolean {
    const target = this.scans.get(id);
    const deleted = this.scans.delete(id);
    if (deleted) {
      this.persistScansToDisk();
      this.recordAuditEvent({
        eventType: 'SCAN_DELETED',
        description: `Assessment scan record ${id}${target ? ` ("${target.projectName}")` : ''} was permanently deleted.`,
        severity: 'WARNING',
        metadata: { scanId: id, projectName: target?.projectName }
      });
    }
    return deleted;
  }

  public clearAll(): void {
    this.scans.clear();
    this.persistScansToDisk();
  }

  // Audit Log Management
  public recordAuditEvent(event: {
    eventType: AuditEventType;
    description: string;
    severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';
    metadata?: Record<string, any>;
  }): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      eventType: event.eventType,
      description: event.description,
      severity: event.severity || 'INFO',
      metadata: event.metadata
    };

    this.auditLogs.unshift(entry);
    this.persistAuditToDisk();
    return entry;
  }

  public getAuditLog(limit = 100): AuditLogEntry[] {
    return this.auditLogs.slice(0, limit);
  }

  // Deterministic Scan Comparison Engine
  public compareScans(baseScanId: string, compareScanId: string): ScanComparisonResult | null {
    const base = this.scans.get(baseScanId);
    const compare = this.scans.get(compareScanId);

    if (!base || !compare) {
      return null;
    }

    const findingFingerprint = (f: Finding) => `${f.ruleId}::${f.file}::${f.evidence.trim()}`;

    const baseMap = new Map<string, Finding>();
    for (const f of base.findings) {
      baseMap.set(findingFingerprint(f), f);
    }

    const compareMap = new Map<string, Finding>();
    for (const f of compare.findings) {
      compareMap.set(findingFingerprint(f), f);
    }

    const newFindings: Finding[] = [];
    const unchangedFindings: Finding[] = [];
    const regressedFindings: Finding[] = [];
    const resolvedFindings: Finding[] = [];

    // Compare compareScan findings against baseScan
    for (const [fp, finding] of compareMap.entries()) {
      if (!baseMap.has(fp)) {
        newFindings.push(finding);
      } else {
        const baseFinding = baseMap.get(fp)!;
        // Check if severity regressed/escalated
        const severityRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 };
        if (severityRank[finding.severity] > severityRank[baseFinding.severity]) {
          regressedFindings.push(finding);
        } else {
          unchangedFindings.push(finding);
        }
      }
    }

    // Check which base findings were resolved
    for (const [fp, baseFinding] of baseMap.entries()) {
      if (!compareMap.has(fp)) {
        resolvedFindings.push(baseFinding);
      }
    }

    const baseScore = base.securityScore ?? 0;
    const compareScore = compare.securityScore ?? 0;

    return {
      baseScanId: base.id,
      compareScanId: compare.id,
      baseProjectName: base.projectName,
      compareProjectName: compare.projectName,
      baseScore: base.securityScore,
      compareScore: compare.securityScore,
      scoreDelta: compareScore - baseScore,
      newFindings,
      resolvedFindings,
      unchangedFindings,
      regressedFindings,
      totalDiffCount: newFindings.length + resolvedFindings.length + regressedFindings.length
    };
  }
}

export const storage = new StorageManager();
