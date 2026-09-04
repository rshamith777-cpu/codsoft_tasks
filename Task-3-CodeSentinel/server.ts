import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { SECURITY_RULES } from './server/scanner/rules.ts';
import { DEMO_FILES, DEMO_PROJECT_NAME } from './server/scanner/demo_project.ts';
import { executeScan, InputFile } from './server/scanner/engine.ts';
import { storage } from './server/storage.ts';
import { analyzeFindingWithAI, askSecurityCopilot } from './server/gemini.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      engine: 'CodeSentinel Static Analysis Engine',
      rulesActive: SECURITY_RULES.length,
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

  // 4. Run Security Assessment Scan
  app.post('/api/scan', (req, res) => {
    try {
      const { files, projectName, sourceType, isDemo, scanProfile, excludedPaths } = req.body;

      let rawFiles = files;
      if (isDemo && (!rawFiles || !Array.isArray(rawFiles) || rawFiles.length === 0)) {
        rawFiles = DEMO_FILES;
      }

      if (!rawFiles || !Array.isArray(rawFiles) || rawFiles.length === 0) {
        return res.status(400).json({ error: 'No files provided for assessment.' });
      }

      const inputFiles: InputFile[] = rawFiles.map((f: any) => ({
        path: f.path || 'unnamed_file.txt',
        content: typeof f.content === 'string' ? f.content : ''
      }));

      const scanResult = executeScan(inputFiles, {
        projectName: projectName || (isDemo ? DEMO_PROJECT_NAME : 'Uploaded Project'),
        sourceType: sourceType || (isDemo ? 'DEMO' : 'UPLOAD'),
        isDemo: !!isDemo,
        scanProfile: scanProfile || 'STANDARD',
        excludedPaths: excludedPaths || []
      });

      // Persist to scan history
      storage.saveScan(scanResult);

      return res.json(scanResult);
    } catch (err: any) {
      console.error('Scan execution failure:', err);
      return res.status(500).json({ error: 'Failed to complete code assessment scan', details: err?.message });
    }
  });

  // 5. Historical Scans List
  app.get('/api/scans', (req, res) => {
    const allScans = storage.getAllScans();
    // Return summaries for fast listing
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
      return res.status(404).json({ error: 'Scan not found' });
    }
    res.json(scan);
  });

  // 7. Delete Scan
  app.delete('/api/scans/:id', (req, res) => {
    const success = storage.deleteScan(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    res.json({ success: true, message: 'Scan deleted successfully' });
  });

  // 8. AI Copilot: Deep Analyze Finding
  app.post('/api/ai/analyze-finding', async (req, res) => {
    try {
      const { finding } = req.body;
      if (!finding) {
        return res.status(400).json({ error: 'Finding payload required' });
      }

      const analysis = await analyzeFindingWithAI(finding);
      res.json(analysis);
    } catch (err: any) {
      console.error('AI finding analysis failed:', err);
      res.status(500).json({ error: 'AI analysis failed', details: err?.message });
    }
  });

  // 9. AI Copilot: Interactive Chat / Q&A
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { question, contextFinding } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Question required' });
      }

      const answer = await askSecurityCopilot(question, contextFinding);
      res.json({ answer });
    } catch (err: any) {
      console.error('AI chat failed:', err);
      res.status(500).json({ error: 'AI request failed', details: err?.message });
    }
  });

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

startServer();
