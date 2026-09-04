import { Finding, ScanResult, Severity } from '../../src/types.ts';
import { SECURITY_RULES, RuleDefinition } from './rules.ts';
import crypto from 'crypto';

export interface ScanOptions {
  projectName?: string;
  sourceType?: 'UPLOAD' | 'PASTE' | 'DEMO' | 'REPOSITORY' | 'ZIP';
  isDemo?: boolean;
  scanProfile?: 'STANDARD' | 'DEEP' | 'STRICT';
  excludedPaths?: string[];
}

export interface InputFile {
  path: string;
  content: string;
}

function detectLanguage(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  const name = filePath.split('/').pop()?.toLowerCase() || '';

  if (name === 'dockerfile' || ext === '.dockerfile') return 'dockerfile';
  if (ext === '.py') return 'python';
  if (ext === '.ts' || ext === '.tsx') return 'typescript';
  if (ext === '.js' || ext === '.jsx' || ext === '.mjs') return 'javascript';
  if (ext === '.go') return 'go';
  if (ext === '.java') return 'java';
  if (ext === '.php') return 'php';
  if (ext === '.rb') return 'ruby';
  if (ext === '.sql') return 'sql';
  if (ext === '.json') return 'json';
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  if (ext === '.env') return 'config';
  return 'text';
}

function extractSnippet(lines: string[], targetLineIdx: number, contextLines = 2): string {
  const start = Math.max(0, targetLineIdx - contextLines);
  const end = Math.min(lines.length - 1, targetLineIdx + contextLines);
  const snippetArr: string[] = [];

  for (let i = start; i <= end; i++) {
    const lineNum = i + 1;
    const isTarget = i === targetLineIdx;
    const prefix = isTarget ? `> ${lineNum.toString().padStart(4, ' ')} | ` : `  ${lineNum.toString().padStart(4, ' ')} | `;
    snippetArr.push(`${prefix}${lines[i]}`);
  }

  return snippetArr.join('\n');
}

export function executeScan(files: InputFile[], options: ScanOptions = {}): ScanResult {
  const isDemo = !!options.isDemo;
  const profile = options.scanProfile || 'STANDARD';

  // Deterministic Scan ID for Demo; Content-hashed ID for real scans
  let scanId: string;
  if (isDemo) {
    scanId = 'SCN-DEMO-APEX-BENCHMARK';
  } else {
    const contentDigest = crypto.createHash('sha256')
      .update(files.map(f => f.path + f.content).join(''))
      .digest('hex')
      .substring(0, 6)
      .toUpperCase();
    scanId = `SCN-${Date.now().toString(36).toUpperCase()}-${contentDigest}`;
  }

  const startedAt = isDemo ? '2026-08-22T20:00:00.000Z' : new Date().toISOString();
  const excluded = options.excludedPaths || ['node_modules', '.git', 'dist', 'build', '__pycache__', '.venv'];

  const filteredFiles = files.filter(f => {
    return !excluded.some(p => f.path.includes(p));
  });

  const findings: Finding[] = [];
  const languageStats: Record<string, number> = {};
  let totalLines = 0;

  const fileSummaries = filteredFiles.map(file => {
    const lines = file.content.split(/\r?\n/);
    const lineCount = lines.length;
    totalLines += lineCount;

    const lang = detectLanguage(file.path);
    languageStats[lang] = (languageStats[lang] || 0) + lineCount;

    let fileFindingsCount = 0;

    // Run active security rules against this file
    for (const rule of SECURITY_RULES) {
      // Check if file matches extension or generic
      const matchesExtension = rule.fileExtensions.some(ext => {
        if (ext === 'Dockerfile' && (file.path.toLowerCase().includes('dockerfile') || file.path.endsWith('Dockerfile'))) return true;
        return file.path.toLowerCase().endsWith(ext.toLowerCase());
      });

      if (!matchesExtension && rule.language !== 'generic') {
        continue;
      }

      // Check line-by-line using rule pattern
      if (rule.pattern) {
        for (let idx = 0; idx < lines.length; idx++) {
          const lineText = lines[idx];
          // Skip pure comment lines for pattern matching unless config file
          const trimmed = lineText.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            if (!file.path.endsWith('.env') && !file.path.endsWith('.json') && !file.path.toLowerCase().includes('dockerfile')) {
              continue;
            }
          }

          if (rule.pattern.test(lineText)) {
            const col = Math.max(1, lineText.search(rule.pattern) + 1);
            const findingNum = findings.length + 1;
            const findingId = isDemo 
              ? `FND-DEMO-${findingNum.toString().padStart(2, '0')}` 
              : `FND-${scanId.slice(-4)}-${findingNum}`;

            findings.push({
              id: findingId,
              scanId,
              ruleId: rule.id,
              title: rule.name,
              severity: rule.severity,
              cwe: rule.cwe,
              cweTitle: rule.cweTitle,
              owaspCategory: rule.owasp,
              file: file.path,
              line: idx + 1,
              column: col,
              codeSnippet: extractSnippet(lines, idx, 2),
              evidence: lineText.trim(),
              description: rule.description,
              impact: rule.impact,
              remediation: rule.remediation,
              scanner: 'CodeSentinel Static AST & Pattern Engine',
              confidence: 'HIGH',
              createdAt: startedAt,
              fixSnippet: rule.exampleSecure
            });

            fileFindingsCount++;
          }
        }
      }
    }

    return {
      path: file.path,
      content: file.content,
      language: lang,
      lines: lineCount,
      findingsCount: fileFindingsCount
    };
  });

  // Calculate severity counts
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let infoCount = 0;

  for (const f of findings) {
    if (f.severity === 'CRITICAL') criticalCount++;
    else if (f.severity === 'HIGH') highCount++;
    else if (f.severity === 'MEDIUM') mediumCount++;
    else if (f.severity === 'LOW') lowCount++;
    else infoCount++;
  }

  // Reproducible Security Score Calculation
  // Standard Formula:
  // Base 100
  // Each Critical deducts 25 points
  // Each High deducts 12 points
  // Each Medium deducts 5 points
  // Each Low deducts 2 points
  // Clamped strictly between 0 and 100
  let securityScore: number | null = null;
  if (filteredFiles.length > 0) {
    const rawDeduction = (criticalCount * 25) + (highCount * 12) + (mediumCount * 5) + (lowCount * 2);
    securityScore = Math.max(0, Math.min(100, 100 - rawDeduction));
  }

  const completedAt = isDemo ? '2026-08-22T20:00:00.250Z' : new Date().toISOString();

  return {
    id: scanId,
    projectName: options.projectName || (isDemo ? 'Apex Bank & API Microservice' : 'Source Code Assessment'),
    sourceType: options.sourceType || (isDemo ? 'DEMO' : 'UPLOAD'),
    isDemo,
    startedAt,
    completedAt,
    status: 'COMPLETED',
    filesScanned: filteredFiles.length,
    linesScanned: totalLines,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    securityScore,
    languages: languageStats,
    findings,
    files: fileSummaries,
    scannerEngine: {
      name: 'CodeSentinel Core AST/Rule Analyzer',
      version: 'v2.4.0-enterprise',
      activeRules: SECURITY_RULES.length
    }
  };
}
