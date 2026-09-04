import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { SECURITY_RULES } from './server/scanner/rules.ts';
import { DEMO_FILES, DEMO_PROJECT_NAME } from './server/scanner/demo_project.ts';
import { executeScan, InputFile } from './server/scanner/engine.ts';
import { storage } from './server/storage.ts';
import { 
  analyzeFindingWithAI, 
  askSecurityCopilot, 
  isCopilotConfigured, 
  setRuntimeServerApiKey 
} from './server/gemini.ts';
import { 
  validateInputFiles, 
  formatSafeError 
} from './server/securityMiddleware.ts';

dotenv.config();

export async function createApp() {
  const app = express();

  // Middlewares: JSON parsing with 25MB max boundary to prevent DoS
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // API Routes

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      engine: 'CodeSentinel Static Analysis & Vulnerability Intelligence Platform',
      rulesActive: SECURITY_RULES.length,
      copilotConfigured: isCopilotConfigured(),
      timestamp: new Date().toISOString()
    });
  });

  // 2. Security Rules Catalog
  app.get('/api/rules', (req, res) => {
    const sanitizedRules = SECURITY_RULES.map(r => ({
      id: r.id,
      name: r.name,
      cwe: r.cwe,
      cweTitle: r.cweTitle,
      owasp: r.owasp,
      severity: r.severity,
      language: r.language,
      description: r.description,
      detectionMethod: r.detectionMethod,
      impact: r.impact,
      remediation: r.remediation,
      exampleVulnerable: r.exampleVulnerable,
      exampleSecure: r.exampleSecure
    }));
    res.json({ rules: sanitizedRules, total: sanitizedRules.length });
  });

  // 3. Demo Project Source Code
  app.get('/api/demo-project', (req, res) => {
    res.json({
      name: DEMO_PROJECT_NAME,
      files: DEMO_FILES,
      description: 'Multi-service vulnerable banking backend and web portal with authentic known vulnerabilities for security assessment benchmarking.'
    });
  });

  // 4. Run Security Assessment Scan (Hardened against Zip Slip & Traversal)
  app.post('/api/scan', (req, res) => {
    try {
      const { files, projectName, sourceType, isDemo, scanProfile, excludedPaths } = req.body;

      let rawFiles = files;
      if (isDemo && (!rawFiles || !Array.isArray(rawFiles) || rawFiles.length === 0)) {
        rawFiles = DEMO_FILES;
      }

      // Validate and sanitize files
      const validation = validateInputFiles(rawFiles);
      if (!validation.valid || !validation.files) {
        storage.recordAuditEvent({
          eventType: 'SCAN_FAILED',
          description: `Assessment rejected during validation: ${validation.error}`,
          severity: 'WARNING',
          metadata: { projectName, error: validation.error }
        });
        return res.status(400).json({ error: validation.error });
      }

      storage.recordAuditEvent({
        eventType: 'SCAN_STARTED',
        description: `Assessment initiated for "${projectName || 'Uploaded Source'}" (${validation.files.length} files, profile: ${scanProfile || 'STANDARD'}).`,
        severity: 'INFO',
        metadata: { projectName, fileCount: validation.files.length, profile: scanProfile }
      });

      const inputFiles: InputFile[] = validation.files.map(f => ({
        path: f.path,
        content: f.content
      }));

      const scanResult = executeScan(inputFiles, {
        projectName: projectName || (isDemo ? DEMO_PROJECT_NAME : 'Uploaded Project'),
        sourceType: sourceType || (isDemo ? 'DEMO' : 'UPLOAD'),
        isDemo: !!isDemo,
        scanProfile: scanProfile || 'STANDARD',
        excludedPaths: excludedPaths || []
      });

      // Persist to scan history & records audit log
      storage.saveScan(scanResult);

      return res.json(scanResult);
    } catch (err: any) {
      const safeErr = formatSafeError(err, 'Failed to complete code assessment scan');
      storage.recordAuditEvent({
        eventType: 'SCAN_FAILED',
        description: `Assessment execution crashed: ${safeErr.error}`,
        severity: 'CRITICAL',
        metadata: { error: safeErr.error }
      });
      return res.status(500).json(safeErr);
    }
  });

  // 5. Historical Scans List
  app.get('/api/scans', (req, res) => {
    const allScans = storage.getAllScans();
    const summaries = allScans.map(s => ({
      id: s.id,
      projectName: s.projectName,
      sourceType: s.sourceType,
      isDemo: s.isDemo,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      status: s.status,
      filesScanned: s.filesScanned,
      linesScanned: s.linesScanned,
      criticalCount: s.criticalCount,
      highCount: s.highCount,
      mediumCount: s.mediumCount,
      lowCount: s.lowCount,
      securityScore: s.securityScore,
      findingsCount: s.findings.length
    }));
    res.json({ scans: summaries });
  });

  // 6. Retrieve Specific Scan
  app.get('/api/scans/:id', (req, res) => {
    const scan = storage.getScan(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found' });
    }
    res.json(scan);
  });

  // 7. Delete Scan
  app.delete('/api/scans/:id', (req, res) => {
    const success = storage.deleteScan(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Scan record not found' });
    }
    res.json({ success: true, message: 'Scan deleted successfully' });
  });

  // 8. Scan Comparison Endpoint
  app.post('/api/scans/compare', (req, res) => {
    try {
      const { baseScanId, compareScanId } = req.body;
      if (!baseScanId || !compareScanId) {
        return res.status(400).json({ error: 'baseScanId and compareScanId are both required for comparison.' });
      }

      const diff = storage.compareScans(baseScanId, compareScanId);
      if (!diff) {
        return res.status(404).json({ error: 'One or both scan records could not be found for comparison.' });
      }

      storage.recordAuditEvent({
        eventType: 'REPORT_GENERATED',
        description: `Scan comparison executed between ${baseScanId} and ${compareScanId} (${diff.totalDiffCount} differences).`,
        severity: 'INFO',
        metadata: { baseScanId, compareScanId, scoreDelta: diff.scoreDelta }
      });

      res.json(diff);
    } catch (err: any) {
      const safeErr = formatSafeError(err, 'Failed to compare scans');
      res.status(500).json(safeErr);
    }
  });

  // 9. Security Audit Log Endpoints
  app.get('/api/audit-log', (req, res) => {
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit as string) || 100));
    const logs = storage.getAuditLog(limit);
    res.json({ auditLog: logs, total: logs.length });
  });

  app.post('/api/audit-log', (req, res) => {
    try {
      const { eventType, description, severity, metadata } = req.body;
      if (!eventType || !description) {
        return res.status(400).json({ error: 'eventType and description required' });
      }

      const entry = storage.recordAuditEvent({
        eventType,
        description: String(description).slice(0, 300),
        severity: severity || 'INFO',
        metadata: typeof metadata === 'object' ? metadata : undefined
      });

      res.json(entry);
    } catch (err: any) {
      res.status(500).json(formatSafeError(err, 'Failed to record audit event'));
    }
  });

  // 10. AI Copilot: Status & Session Key Configuration
  app.get('/api/copilot/status', (req, res) => {
    res.json({
      configured: isCopilotConfigured(),
      modelHierarchy: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.7-flash']
    });
  });

  app.post('/api/copilot/config', (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
        return res.status(400).json({ error: 'Valid Gemini API key required' });
      }

      setRuntimeServerApiKey(apiKey);
      storage.recordAuditEvent({
        eventType: 'CONFIG_CHANGED',
        description: 'AI Security Copilot API configuration updated for active server session.',
        severity: 'SECURITY'
      });

      res.json({ success: true, message: 'Copilot API configuration updated securely' });
    } catch (err: any) {
      res.status(500).json(formatSafeError(err, 'Failed to update Copilot configuration'));
    }
  });

  // 11. AI Copilot: Deep Analyze Finding
  app.post('/api/ai/analyze-finding', async (req, res) => {
    try {
      const { finding } = req.body;
      if (!finding) {
        return res.status(400).json({ error: 'Finding payload required' });
      }

      storage.recordAuditEvent({
        eventType: 'AI_REQUEST',
        description: `Copilot deep analysis requested for finding ${finding.id} (${finding.cwe}).`,
        severity: 'INFO',
        metadata: { findingId: finding.id, cwe: finding.cwe }
      });

      const analysis = await analyzeFindingWithAI(finding);
      res.json(analysis);
    } catch (err: any) {
      const safeErr = formatSafeError(err, 'AI analysis temporarily unavailable');
      res.status(500).json(safeErr);
    }
  });

  // 12. AI Copilot: Interactive Chat / Q&A
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { question, contextFinding } = req.body;
      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Question string required' });
      }

      storage.recordAuditEvent({
        eventType: 'AI_REQUEST',
        description: `Copilot interactive consultation requested: "${question.slice(0, 80)}..."`,
        severity: 'INFO',
        metadata: { findingId: contextFinding?.id }
      });

      const answer = await askSecurityCopilot(question, contextFinding);
      res.json({ answer });
    } catch (err: any) {
      const safeErr = formatSafeError(err, 'AI request failed');
      res.status(500).json(safeErr);
    }
  });

  return app;
}

async function startServer() {
  const app = await createApp();
  const PORT = process.env.PORT || 3000;

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeSentinel Security Engine running on http://0.0.0.0:${PORT}`);
  });
}

// Start if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  startServer();
}
