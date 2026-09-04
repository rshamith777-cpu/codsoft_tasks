import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { executeScan, InputFile } from '../server/scanner/engine.ts';

describe('Deterministic Scoring Formula Verification', () => {
  test('returns 100 on clean codebase with zero vulnerabilities', () => {
    const files: InputFile[] = [{ path: 'safe.py', content: 'x = 1\ny = 2' }];
    const res = executeScan(files);
    assert.equal(res.securityScore, 100);
  });

  test('deducts 25 points for each Critical finding', () => {
    // 1 Critical SQL Injection
    const files: InputFile[] = [
      { path: 'sqli.py', content: 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")' }
    ];
    const res = executeScan(files);
    assert.equal(res.criticalCount, 1);
    assert.equal(res.securityScore, 100 - 25);
  });

  test('deducts 12 points for High and 25 for Critical combined', () => {
    // 1 Critical (SQLi) + 1 High (Secret)
    const files: InputFile[] = [
      { 
        path: 'app.py', 
        content: `
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
api_key = "a1b2c3d4e5f6g7h8i9j0k1l2m3"
` 
      }
    ];
    const res = executeScan(files);
    assert.equal(res.criticalCount, 1);
    assert.equal(res.highCount, 1);
    // 100 - 25 - 12 = 63
    assert.equal(res.securityScore, 63);
  });

  test('clamps score strictly at 0 when penalties exceed 100', () => {
    // 5 Critical findings = 5 * 25 = 125 deduction -> clamped to 0
    const files: InputFile[] = [
      {
        path: 'disaster.py',
        content: `
cursor.execute(f"SELECT 1 WHERE a = {x}")
cursor.execute(f"SELECT 2 WHERE b = {y}")
cursor.execute(f"SELECT 3 WHERE c = {z}")
cursor.execute(f"SELECT 4 WHERE d = {w}")
cursor.execute(f"SELECT 5 WHERE e = {v}")
`
      }
    ];
    const res = executeScan(files);
    assert.ok(res.criticalCount >= 5);
    assert.equal(res.securityScore, 0);
  });

  test('returns null when no files are scanned', () => {
    const res = executeScan([]);
    assert.equal(res.securityScore, null);
  });
});
