import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../server/storage.ts';
import { ScanResult } from '../src/types.ts';

describe('Storage Persistence & Audit Trail Tests', () => {
  const mockScanA: ScanResult = {
    id: 'SCN-TEST-001',
    projectName: 'Test App Version 1',
    sourceType: 'UPLOAD',
    isDemo: false,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3590000).toISOString(),
    status: 'COMPLETED',
    filesScanned: 2,
    linesScanned: 50,
    criticalCount: 1,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    infoCount: 0,
    securityScore: 75,
    languages: { python: 50 },
    findings: [
      {
        id: 'FND-001',
        scanId: 'SCN-TEST-001',
        ruleId: 'SEC-PY-SQLI-01',
        title: 'Unparameterized SQL Query Construction',
        severity: 'CRITICAL',
        cwe: 'CWE-89',
        file: 'query.py',
        line: 10,
        codeSnippet: 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
        evidence: 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
        description: 'SQL Injection flaw',
        impact: 'Database compromise',
        remediation: 'Use parameters',
        scanner: 'CodeSentinel Static Engine',
        confidence: 'HIGH',
        createdAt: new Date().toISOString()
      }
    ],
    files: [],
    scannerEngine: { name: 'Engine', version: '2.4', activeRules: 18 }
  };

  const mockScanB: ScanResult = {
    ...mockScanA,
    id: 'SCN-TEST-002',
    projectName: 'Test App Version 2',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    criticalCount: 0,
    highCount: 1,
    securityScore: 88,
    findings: [
      // FND-001 resolved, but new secret finding introduced
      {
        id: 'FND-002',
        scanId: 'SCN-TEST-002',
        ruleId: 'SEC-GEN-SECRET-01',
        title: 'Hardcoded Cryptographic Key',
        severity: 'HIGH',
        cwe: 'CWE-798',
        file: 'auth.py',
        line: 5,
        codeSnippet: 'api_key = "secret_token_1234567890123456"',
        evidence: 'api_key = "secret_token_1234567890123456"',
        description: 'Hardcoded Secret',
        impact: 'Credential leak',
        remediation: 'Use env',
        scanner: 'CodeSentinel Static Engine',
        confidence: 'HIGH',
        createdAt: new Date().toISOString()
      }
    ]
  };

  test('saves and retrieves scan by ID', () => {
    storage.saveScan(mockScanA);
    const retrieved = storage.getScan('SCN-TEST-001');
    assert.ok(retrieved);
    assert.equal(retrieved.id, 'SCN-TEST-001');
    assert.equal(retrieved.securityScore, 75);
  });

  test('records audit event when scan is saved', () => {
    const logs = storage.getAuditLog(10);
    const saveEvent = logs.find(l => l.eventType === 'SCAN_COMPLETED' && l.metadata?.scanId === 'SCN-TEST-001');
    assert.ok(saveEvent, 'Must record SCAN_COMPLETED in audit trail');
    assert.equal(saveEvent.severity, 'CRITICAL');
  });

  test('compares two scans deterministically identifying NEW and RESOLVED findings', () => {
    storage.saveScan(mockScanB);

    const diff = storage.compareScans('SCN-TEST-001', 'SCN-TEST-002');
    assert.ok(diff);
    assert.equal(diff.baseScanId, 'SCN-TEST-001');
    assert.equal(diff.compareScanId, 'SCN-TEST-002');
    assert.equal(diff.newFindings.length, 1);
    assert.equal(diff.newFindings[0].ruleId, 'SEC-GEN-SECRET-01');
    assert.equal(diff.resolvedFindings.length, 1);
    assert.equal(diff.resolvedFindings[0].ruleId, 'SEC-PY-SQLI-01');
    assert.equal(diff.scoreDelta, 88 - 75); // +13 points
  });

  test('deletes scan and records SCAN_DELETED audit log entry', () => {
    const deleted = storage.deleteScan('SCN-TEST-001');
    assert.equal(deleted, true);
    assert.equal(storage.getScan('SCN-TEST-001'), undefined);

    const logs = storage.getAuditLog(5);
    const deleteEvent = logs.find(l => l.eventType === 'SCAN_DELETED');
    assert.ok(deleteEvent, 'Must record SCAN_DELETED audit event');
  });
});
