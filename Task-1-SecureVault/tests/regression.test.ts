import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('SECUREVAULT COMPREHENSIVE AUTOMATED REGRESSION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Unauthenticated Security Posture (Real Data)
  await test('GET /api/security/posture returns valid real security posture', async () => {
    const res = await fetch(`${BASE_URL}/api/security/posture`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.vaultStatus, 'vaultStatus must exist');
    assert.ok(typeof data.totalFiles === 'number', 'totalFiles must be number');
    assert.ok(typeof data.integrityRate === 'number', 'integrityRate must be number');
  });

  // 2. Unauthenticated Access Protection (RBAC 401 Enforcement)
  await test('GET /api/vault/files without token returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/vault/files`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.ok(data.error, 'Must return error message');
  });

  // 3. User Authentication Flow (Register / Login)
  let authToken = '';
  const testEmail = `officer_${Date.now()}@securevault.internal`;

  await test('POST /api/auth/register creates user and returns JWT token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Officer',
        email: testEmail,
        password: 'CyberSecurity2026!',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.token, 'Token must be issued');
    assert.strictEqual(data.user.email, testEmail);
    authToken = data.token;
  });

  await test('GET /api/auth/me returns authenticated user identity', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, testEmail);
  });

  // 4. File Upload, Authenticated AES-256-GCM Encryption, & SHA-256 Digest
  let uploadedFileId = '';
  const testContent = 'CONFIDENTIAL TEST PAYLOAD - DETERMINISTIC VAULT CIPHER 2026';

  await test('POST /api/vault/upload encrypts file with AES-256-GCM', async () => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="audit_test.txt"\r\n` +
      `Content-Type: text/plain\r\n\r\n` +
      `${testContent}\r\n` +
      `--${boundary}--\r\n`;

    const res = await fetch(`${BASE_URL}/api/vault/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.file, 'Must return uploaded file object');
    assert.strictEqual(data.file.encryptionAlgo, 'AES-256-GCM');
    assert.ok(data.file.ivHex, 'Must contain 96-bit IV hex');
    assert.ok(data.file.authTagHex, 'Must contain 128-bit GCM auth tag hex');
    assert.ok(data.file.sha256Hash, 'Must contain SHA-256 pre-encryption digest');
    uploadedFileId = data.file.id;
  });

  // 5. Download & SHA-256 Integrity Verification
  await test('GET /api/vault/download/:id verifies authenticated decryption & SHA-256 match', async () => {
    const res = await fetch(`${BASE_URL}/api/vault/download/${uploadedFileId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('x-integrity-status'), 'VERIFIED');
    const downloadedText = (await res.text()).trim();
    assert.strictEqual(downloadedText, testContent);
  });

  // 6. Zero-Trust Share Generation, Token Access, & Expiration/Revocation
  let shareToken = '';
  let shareId = '';

  await test('POST /api/vault/share-links creates time-bound zero-trust share link', async () => {
    const res = await fetch(`${BASE_URL}/api/vault/share-links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId: uploadedFileId,
        role: 'VIEWER',
        expiryHours: 1,
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.shareLink, 'Must return shareLink object');
    assert.ok(data.shareLink.token, 'Must contain cryptographic token');
    shareToken = data.shareLink.token;
    shareId = data.shareLink.id;
  });

  await test('GET /api/vault/shared/:token accesses object via share token', async () => {
    const res = await fetch(`${BASE_URL}/api/vault/shared/${shareToken}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.share.file.originalName, 'audit_test.txt');
  });

  await test('DELETE /api/vault/share-links/:id revokes share token immediately', async () => {
    const res = await fetch(`${BASE_URL}/api/vault/share-links/${shareId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);

    // Attempt to access revoked share token must now fail with 403 or 404
    const testAccess = await fetch(`${BASE_URL}/api/vault/shared/${shareToken}`);
    assert.ok(testAccess.status === 404 || testAccess.status === 403, 'Revoked share must be blocked');
  });

  // 7. Security Automations (AUTO-001 through AUTO-010)
  await test('GET /api/security/automations lists deterministic defense pipelines', async () => {
    const res = await fetch(`${BASE_URL}/api/security/automations`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.automations), 'Must return automations array');
    assert.strictEqual(data.automations.length, 10, 'Must contain 10 automations');
  });

  await test('POST /api/security/run-automation evaluates AUTO-008 integrity audit', async () => {
    const res = await fetch(`${BASE_URL}/api/security/run-automation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ automationId: 'AUTO-008' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  // 8. AI Security Copilot Chat & Status
  await test('GET /api/ai/status reports model and fallback capabilities', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/status`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.model, 'gemini-2.5-flash');
    assert.strictEqual(data.localFallbackAvailable, true);
  });

  await test('POST /api/ai/chat supports deterministic LOCAL SECURITY ANALYSIS mode', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'Check integrity status', mode: 'local' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.available, true);
    assert.strictEqual(data.source, 'LOCAL SECURITY ANALYSIS');
    assert.ok(data.text.includes('LOCAL SECURITY ANALYSIS'));
  });

  await test('POST /api/ai/chat without configured key returns 503 with clean unavailable state', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'Evaluate anomalies', mode: 'ai' }),
    });
    assert.strictEqual(res.status, 503);
    const data = await res.json();
    assert.strictEqual(data.available, false);
    assert.ok(data.error.includes('AI SERVICE UNAVAILABLE'));
    assert.strictEqual(data.fallbackLabel, 'LOCAL SECURITY ANALYSIS');
  });

  // 9. Append-Only Audit Trail Immutability
  await test('GET /api/security/audit-logs records all operations in chronological sequence', async () => {
    const res = await fetch(`${BASE_URL}/api/security/audit-logs`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.auditLogs), 'Must be array of audit logs');
    assert.ok(data.auditLogs.length > 0, 'Must have recorded events');
    const eventTypes = data.auditLogs.map((l: any) => l.eventType);
    assert.ok(eventTypes.includes('UPLOAD'), 'Must record UPLOAD');
    assert.ok(eventTypes.includes('DOWNLOAD'), 'Must record DOWNLOAD');
    assert.ok(eventTypes.includes('SHARE'), 'Must record SHARE');
  });

  // 10. Clean Cleanup of test file
  await test('DELETE /api/vault/files/:id removes test file from vault', async () => {
    const res = await fetch(`${BASE_URL}/api/vault/files/${uploadedFileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  console.log('\n====================================================');
  console.log(`REGRESSION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
