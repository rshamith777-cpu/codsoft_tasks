import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { executeScan, InputFile } from '../server/scanner/engine.ts';

describe('CodeSentinel SAST Engine Tests', () => {
  test('handles empty file array gracefully with null score and zero findings', () => {
    const result = executeScan([]);
    assert.equal(result.filesScanned, 0);
    assert.equal(result.linesScanned, 0);
    assert.equal(result.findings.length, 0);
    assert.equal(result.securityScore, null);
    assert.equal(result.status, 'COMPLETED');
  });

  test('scans clean source file with 0 findings and perfect score of 100', () => {
    const files: InputFile[] = [
      {
        path: 'app/safe_service.py',
        content: `def calculate_total(a, b):
    # Pure clean logic
    return a + b

def main():
    print(calculate_total(10, 20))
`
      }
    ];

    const result = executeScan(files, { projectName: 'Clean Service' });
    assert.equal(result.filesScanned, 1);
    assert.equal(result.findings.length, 0);
    assert.equal(result.securityScore, 100);
    assert.equal(result.criticalCount, 0);
    assert.equal(result.highCount, 0);
    assert.equal(result.mediumCount, 0);
    assert.equal(result.lowCount, 0);
  });

  test('filters out excluded paths such as node_modules and .git', () => {
    const files: InputFile[] = [
      { path: 'src/index.ts', content: 'console.log("hello");' },
      { path: 'node_modules/vuln/index.js', content: 'eval("alert(1)");' },
      { path: '.git/hooks/pre-commit', content: 'rm -rf /' }
    ];

    const result = executeScan(files, { excludedPaths: ['node_modules', '.git'] });
    assert.equal(result.filesScanned, 1);
    assert.equal(result.files[0].path, 'src/index.ts');
  });

  test('handles files with syntax errors and empty strings without crashing', () => {
    const files: InputFile[] = [
      { path: 'broken.py', content: 'def broken(:::\n   ((( invalid syntax !!!' },
      { path: 'empty.js', content: '' }
    ];

    const result = executeScan(files);
    assert.equal(result.filesScanned, 2);
    assert.equal(result.status, 'COMPLETED');
  });

  test('correctly populates finding model attributes', () => {
    const files: InputFile[] = [
      {
        path: 'src/db.js',
        content: 'const res = await db.query(`SELECT * FROM users WHERE id = ${req.body.id}`);'
      }
    ];

    const result = executeScan(files);
    assert.equal(result.findings.length, 1);
    const f = result.findings[0];
    assert.ok(f.id.startsWith('FND-'));
    assert.equal(f.severity, 'CRITICAL');
    assert.equal(f.cwe, 'CWE-89');
    assert.equal(f.file, 'src/db.js');
    assert.equal(f.line, 1);
    assert.ok(f.evidence.includes('SELECT * FROM users'));
    assert.ok(f.remediation.length > 10);
    assert.equal(f.confidence, 'HIGH');
  });
});
