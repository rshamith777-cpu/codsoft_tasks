import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('Repository Security & Secret Leakage Auditing', () => {
  const rootDir = process.cwd();

  test('ensures no live Gemini API keys or credentials exist in source code', () => {
    // Scan all src/ and server/ files for live API key patterns
    const scanDirectoryForSecrets = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
          scanDirectoryForSecrets(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          // Check for real Google API key pattern (AIzaSy...)
          const match = content.match(/AIzaSy[A-Za-z0-9_\-]{33}/);
          assert.equal(
            match, 
            null, 
            `Found hardcoded Google API Key in ${fullPath}: ${match?.[0]}`
          );
        }
      }
    };

    scanDirectoryForSecrets(path.join(rootDir, 'src'));
    scanDirectoryForSecrets(path.join(rootDir, 'server'));
  });

  test('ensures production dist bundle does not contain GEMINI_API_KEY environment leakage', () => {
    const distPath = path.join(rootDir, 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath, { recursive: true }) as string[];
      for (const f of files) {
        if (typeof f === 'string' && f.endsWith('.js') && !f.includes('server')) {
          const content = fs.readFileSync(path.join(distPath, f), 'utf-8');
          assert.equal(content.includes('process.env.GEMINI_API_KEY'), false);
        }
      }
    }
  });

  test('verifies .env is excluded by .gitignore', () => {
    const gitignorePath = path.join(rootDir, '.gitignore');
    assert.ok(fs.existsSync(gitignorePath));
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    assert.ok(content.includes('.env'), '.gitignore must ignore .env files');
  });
});
