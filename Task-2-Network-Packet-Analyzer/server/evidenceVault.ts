import crypto from 'crypto';
import { EvidenceItem, EvidenceType, EvidenceVaultState, AuditLogEntry, CustodyRecord, CustodyAction, UserRole } from '../src/types';
import { globalAutomationEngine } from './automationEngine';

export class EvidenceVault {
  private items: Map<string, EvidenceItem> = new Map();
  private lastVerification: string | null = null;
  private tamperCount: number = 0;

  constructor() {
    this.seedInitialEvidence();
  }

  private calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Preserve an evidence artifact into the cryptographic vault.
   * Zero Math.random - uses deterministic cryptographic hash digest.
   */
  public preserveEvidence(
    type: EvidenceType,
    source: string,
    rawContent: string,
    metadata: Record<string, any> = {},
    user: string = 'SOC-Analyst',
    role: any = 'ANALYST'
  ): EvidenceItem {
    const hash = this.calculateHash(rawContent);
    const idDigest = crypto.createHash('sha256').update(`${rawContent}|${source}|${type}|${Date.now()}`).digest('hex').slice(0, 8);
    const id = `EVID-${Date.now().toString(36).toUpperCase()}-${idDigest.toUpperCase()}`;
    const nowIso = new Date().toISOString();

    const initialCustody: CustodyRecord = {
      id: `CUST-${Date.now().toString(36).toUpperCase()}-${idDigest.slice(0, 4).toUpperCase()}`,
      timestamp: nowIso,
      actor: user,
      role: (role as UserRole) || 'ANALYST',
      action: 'PRESERVED',
      target: id,
      hash,
      result: 'SUCCESS',
      details: `Preserved evidence artifact from ${source}`
    };

    const evidence: EvidenceItem = {
      id,
      type,
      source,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      contentHash: hash,
      rawContent,
      metadata,
      retentionState: 'LOCKED',
      createdAt: nowIso,
      tampered: false,
      sizeBytes: Buffer.byteLength(rawContent, 'utf8'),
      status: 'VERIFIED',
      custodyLog: [initialCustody]
    };

    this.items.set(id, evidence);

    // Append to immutable audit trail
    globalAutomationEngine.recordAudit({
      user,
      role: (role as UserRole) || 'ANALYST',
      action: 'PRESERVE_EVIDENCE',
      target: `${id} (${type} - ${source})`,
      result: 'SUCCESS',
      metadata: { hash, contentLength: rawContent.length }
    });

    return evidence;
  }

  /**
   * Record a chain of custody action (VIEWED, EXPORTED, VERIFIED, etc.)
   */
  public recordCustody(
    evidenceId: string,
    action: CustodyAction,
    actor: string,
    role: UserRole = 'ANALYST',
    details?: string
  ): CustodyRecord | null {
    const item = this.items.get(evidenceId);
    if (!item) return null;

    const custodyId = `CUST-${Date.now().toString(36).toUpperCase()}-${crypto.createHash('sha256').update(evidenceId + action + Date.now()).digest('hex').slice(0, 4).toUpperCase()}`;
    const record: CustodyRecord = {
      id: custodyId,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      target: evidenceId,
      hash: item.contentHash,
      result: 'SUCCESS',
      details
    };

    if (!item.custodyLog) item.custodyLog = [];
    item.custodyLog.unshift(record);

    globalAutomationEngine.recordAudit({
      user: actor,
      role,
      action: `EVIDENCE_${action}`,
      target: `${evidenceId} (${item.source})`,
      result: 'SUCCESS',
      metadata: { action, details }
    });

    return record;
  }

  /**
   * Cryptographically verify all preserved evidence artifacts.
   * If hash mismatch is discovered, mark as tampered and raise audit alarm.
   */
  public verifyIntegrity(): {
    totalChecked: number;
    tamperedItems: EvidenceItem[];
    healthy: boolean;
    verificationTimestamp: string;
  } {
    const now = new Date().toISOString();
    this.lastVerification = now;
    const tampered: EvidenceItem[] = [];

    for (const [id, item] of this.items.entries()) {
      const computed = this.calculateHash(item.rawContent);
      if (computed !== item.contentHash) {
        item.tampered = true;
        item.status = 'TAMPERED';
        tampered.push(item);
        this.tamperCount++;

        // Log custody violation
        this.recordCustody(id, 'VERIFIED', 'Integrity Monitor', 'ADMIN', 'CRITICAL INTEGRITY FAILURE: HASH MISMATCH');

        // Raise Critical Audit Log
        globalAutomationEngine.recordAudit({
          user: 'Integrity Monitor',
          role: 'ADMIN',
          action: 'CRITICAL_INTEGRITY_ALERT',
          target: `${id} (${item.source})`,
          result: 'BLOCKED',
          metadata: {
            expectedHash: item.contentHash,
            actualHash: computed,
            alert: 'CRYPTOGRAPHIC EVIDENCE TAMPER DETECTED'
          }
        });
      } else {
        item.tampered = false;
        item.status = 'VERIFIED';
      }
    }

    return {
      totalChecked: this.items.size,
      tamperedItems: tampered,
      healthy: tampered.length === 0,
      verificationTimestamp: now
    };
  }

  public verifyAll() {
    return this.verifyIntegrity();
  }

  public getEvidenceCustody(id: string): CustodyRecord[] {
    const item = this.items.get(id);
    return item?.custodyLog || [];
  }

  /**
   * Intentionally tamper an item's raw content to test the tamper detection alert.
   */
  public tamperItemForTesting(id: string, alteredContent: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    item.rawContent = alteredContent;
    return true;
  }

  public getAllEvidence(): EvidenceItem[] {
    return Array.from(this.items.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getEvidenceById(id: string): EvidenceItem | undefined {
    return this.items.get(id);
  }

  public getVaultState(): EvidenceVaultState {
    const all = this.getAllEvidence();
    const tampered = all.filter(i => i.tampered).length;
    return {
      items: all,
      lastVerificationTime: this.lastVerification || undefined,
      tamperCount: tampered,
      healthy: tampered === 0
    };
  }

  /**
   * Pre-seed deterministic initial evidence items.
   */
  private seedInitialEvidence() {
    const seedPacket = JSON.stringify({
      no: 14,
      sourceIp: '192.168.1.110',
      destinationIp: '192.168.1.10',
      protocol: 'TCP',
      flags: 'SYN',
      dstPort: 445,
      info: '445 > SMB Probing'
    });

    this.preserveEvidence(
      'PACKET',
      'Frame #14 SYN Probe',
      seedPacket,
      { packetNo: 14, mitre: 'T1046' },
      'System Boot',
      'SYSTEM'
    );
  }
}

export const globalEvidenceVault = new EvidenceVault();
