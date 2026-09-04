import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFilePath, validateInputFiles, SECURITY_LIMITS } from '../server/securityMiddleware.ts';

describe('Upload Security & Traversal Defense Verification', () => {
  test('rejects path traversal attempts with ../ in filenames', () => {
    assert.equal(sanitizeFilePath('../etc/passwd'), null);
    assert.equal(sanitizeFilePath('foo/../../bar.py'), null);
    assert.equal(sanitizeFilePath('..\\..\\windows\\system32\\cmd.exe'), null);
  });

  test('rejects paths containing null bytes or control characters', () => {
    assert.equal(sanitizeFilePath('safe.py\x00.exe'), null);
    assert.equal(sanitizeFilePath('test\x1f/file.js'), null);
  });

  test('normalizes leading slashes and drive letters safely', () => {
    const clean1 = sanitizeFilePath('/var/www/index.py');
    assert.equal(clean1, 'var/www/index.py');

    const clean2 = sanitizeFilePath('C:\\project\\app.ts');
    assert.equal(clean2, 'project/app.ts');
  });

  test('validateInputFiles rejects empty or non-array payloads', () => {
    const res1 = validateInputFiles([]);
    assert.equal(res1.valid, false);

    const res2 = validateInputFiles(null as any);
    assert.equal(res2.valid, false);
  });

  test('validateInputFiles rejects files exceeding single-file threshold', () => {
    const oversizedContent = 'A'.repeat(SECURITY_LIMITS.MAX_FILE_SIZE_BYTES + 100);
    const res = validateInputFiles([
      { path: 'huge.py', content: oversizedContent }
    ]);
    assert.equal(res.valid, false);
    assert.ok(res.error?.includes('exceeds the maximum single-file size'));
  });

  test('validateInputFiles rejects malicious file paths in payload array', () => {
    const res = validateInputFiles([
      { path: 'valid.py', content: 'print(1)' },
      { path: '../../malicious.sh', content: 'rm -rf /' }
    ]);
    assert.equal(res.valid, false);
    assert.ok(res.error?.includes('Insecure or invalid file path detected'));
  });
});
