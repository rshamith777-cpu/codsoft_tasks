import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileCode, 
  Terminal, 
  Settings2, 
  AlertCircle, 
  FolderArchive,
  ArrowRight,
  Sparkles,
  GitBranch
} from 'lucide-react';
import JSZip from 'jszip';
import { ScanResult } from '../types.ts';

interface ScannerViewProps {
  onScanCompleted: (result: ScanResult) => void;
  onLoadDemo: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScanCompleted,
  onLoadDemo
}) => {
  const [activeMode, setActiveMode] = useState<'ZIP' | 'FILES' | 'PASTE' | 'DEMO' | 'REPO'>('DEMO');
  
  // Paste Code State
  const [pastedCode, setPastedCode] = useState(`import sqlite3
import os

def query_user(username):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    # SQL Injection flaw
    cursor.execute(f"SELECT * FROM accounts WHERE user = '{username}'")
    return cursor.fetchall()
`);
  const [pastedFilename, setPastedFilename] = useState('database_query.py');
  const [pastedLang, setPastedLang] = useState('python');

  // Multi-file / Zip state
  const [stagedFiles, setStagedFiles] = useState<Array<{ path: string; content: string }>>([]);
  const [projectName, setProjectName] = useState('Custom Source Assessment');
  const [scanProfile, setScanProfile] = useState<'STANDARD' | 'DEEP' | 'STRICT'>('STANDARD');
  const [excludedPaths, setExcludedPaths] = useState('node_modules, .git, dist, build');

  // Loading & Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Multi-file selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setErrorMessage(null);

    const files: File[] = Array.from(e.target.files);
    const loadedFiles: Array<{ path: string; content: string }> = [];

    for (const file of files) {
      try {
        const text = await file.text();
        loadedFiles.push({
          path: file.name,
          content: text
        });
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }

    setStagedFiles(loadedFiles);
    setProjectName(files.length === 1 ? files[0].name : `Package (${files.length} files)`);
  };

  // Handle ZIP unpacking
  // Handle ZIP unpacking with Zip Slip / Traversal Defense
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setErrorMessage(null);
    const file = e.target.files[0];

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('Archive size exceeds 25MB maximum limit.');
      return;
    }

    setProjectName(file.name.replace(/\.zip$/i, ''));

    try {
      setScanStage('Unpacking archive & validating security boundaries...');
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const extracted: Array<{ path: string; content: string }> = [];

      let totalSize = 0;
      const entries = Object.entries(zipContent.files);

      if (entries.length > 500) {
        setErrorMessage('Archive contains more than 500 files, exceeding security processing threshold.');
        setScanStage('');
        return;
      }

      for (const [relativePath, zipEntry] of entries) {
        // Zip Slip Protection: strictly reject path traversal sequences
        const normalized = relativePath.replace(/\\/g, '/');
        if (
          normalized.includes('..') || 
          normalized.startsWith('/') || 
          /^[a-zA-Z]:/.test(normalized) ||
          /[\x00-\x1f\x7f]/.test(normalized)
        ) {
          console.warn('Zip Slip attempt prevented:', relativePath);
          setErrorMessage(`Security Warning: Archive contains illegal path traversal entry "${relativePath}". Extraction aborted.`);
          setScanStage('');
          return;
        }

        if (!zipEntry.dir && !normalized.includes('__MACOSX') && !normalized.includes('.DS_Store')) {
          try {
            const content = await zipEntry.async('text');
            const contentBytes = new Blob([content]).size;
            
            if (contentBytes > 2 * 1024 * 1024) {
              console.warn('Skipping oversized file in archive:', relativePath);
              continue;
            }

            totalSize += contentBytes;
            if (totalSize > 25 * 1024 * 1024) {
              setErrorMessage('Extracted source size exceeds 25MB limit.');
              setScanStage('');
              return;
            }

            extracted.push({
              path: normalized.replace(/^\/+/, ''),
              content
            });
          } catch (err) {
            console.warn('Skipping binary or unreadable file in zip:', relativePath);
          }
        }
      }

      if (extracted.length === 0) {
        setErrorMessage('No valid text or source code files found in archive.');
        setScanStage('');
        return;
      }

      setStagedFiles(extracted);
      setScanStage('');
    } catch (err: any) {
      console.error('Zip extraction error:', err);
      setErrorMessage(`Failed to extract ZIP archive: ${err?.message || 'Invalid format'}`);
      setScanStage('');
    }
  };

  // Trigger Execution
  const handleExecuteScan = async () => {
    setErrorMessage(null);
    let filesToScan: Array<{ path: string; content: string }> = [];
    let isDemo = false;
    let name = projectName;

    if (activeMode === 'DEMO') {
      onLoadDemo();
      return;
    } else if (activeMode === 'REPO') {
      setErrorMessage('GitHub repository cloning is coming soon. Please upload a ZIP archive or single files for instant local AST assessment.');
      return;
    } else if (activeMode === 'PASTE') {
      if (!pastedCode.trim()) {
        setErrorMessage('Please provide source code to scan.');
        return;
      }
      filesToScan = [{ path: pastedFilename || 'snippet.py', content: pastedCode }];
      name = pastedFilename || 'Pasted Code Snippet';
    } else {
      if (stagedFiles.length === 0) {
        setErrorMessage('Please upload files or an archive before scanning.');
        return;
      }
      filesToScan = stagedFiles;
    }

    try {
      setIsScanning(true);
      setScanStage('ANALYZING SOURCE...');

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToScan,
          projectName: name,
          sourceType: activeMode === 'PASTE' ? 'PASTE' : activeMode === 'ZIP' ? 'ZIP' : 'UPLOAD',
          isDemo,
          scanProfile,
          excludedPaths: excludedPaths.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Scan request failed');
      }

      const result: ScanResult = await response.json();

      setTimeout(() => {
        setIsScanning(false);
        setScanStage('');
        onScanCompleted(result);
      }, 400);

    } catch (err: any) {
      console.error('Scan failed:', err);
      setIsScanning(false);
      setScanStage('');
      setErrorMessage(err?.message || 'An error occurred while executing the security scan.');
    }
  };

  return (
    <div className="space-y-10">
      {/* Consistent Spacious Internal Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            02 // ASSESSMENT ENGINE
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            ASSESSMENT <span className="font-serif-italic font-normal">ENGINE</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Submit repositories, source archives, or code snippets for AST security vulnerability analysis and CWE mapping.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono">
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">SCANNER STATE</div>
            <div className="text-emerald-400 flex items-center justify-end gap-2 font-bold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isScanning ? 'SCANNING' : 'READY'}</span>
            </div>
          </div>
          <div className="text-right hidden sm:block p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">PROFILE</div>
            <div className="text-white/90 font-bold mt-0.5">{scanProfile}</div>
          </div>
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">ACTIVE RULES</div>
            <div className="text-white/90 font-bold mt-0.5">18 Signatures</div>
          </div>
        </div>
      </div>

      {/* Spacious Input Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 border-b border-white/10 pb-6">
        <button
          onClick={() => { setActiveMode('DEMO'); setErrorMessage(null); }}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMode === 'DEMO'
              ? 'bg-white/10 border-white/30 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/8'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-mono font-bold">BENCHMARK DEMO</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Apex Bank microservice
          </p>
        </button>

        <button
          onClick={() => { setActiveMode('ZIP'); setErrorMessage(null); }}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMode === 'ZIP'
              ? 'bg-white/10 border-white/30 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/8'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <FolderArchive className="w-5 h-5 text-blue-400" />
            <span className="text-xs sm:text-sm font-mono font-bold">UPLOAD PROJECT</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            ZIP archive extraction
          </p>
        </button>

        <button
          onClick={() => { setActiveMode('FILES'); setErrorMessage(null); }}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMode === 'FILES'
              ? 'bg-white/10 border-white/30 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/8'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <span className="text-xs sm:text-sm font-mono font-bold">UPLOAD FILE</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Multi-file selection
          </p>
        </button>

        <button
          onClick={() => { setActiveMode('PASTE'); setErrorMessage(null); }}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMode === 'PASTE'
              ? 'bg-white/10 border-white/30 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/8'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <FileCode className="w-5 h-5 text-purple-400" />
            <span className="text-xs sm:text-sm font-mono font-bold">PASTE CODE</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Direct snippet evaluation
          </p>
        </button>

        <button
          onClick={() => { setActiveMode('REPO'); setErrorMessage(null); }}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMode === 'REPO'
              ? 'bg-white/10 border-white/30 text-white shadow-md'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/8'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <GitBranch className="w-5 h-5 text-white/40" />
            <span className="text-xs sm:text-sm font-mono font-bold text-white/70">REPOSITORY</span>
          </div>
          <p className="text-[10px] text-amber-400/90 uppercase font-mono font-bold">
            COMING SOON
          </p>
        </button>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Main (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* DEMO MODE */}
          {activeMode === 'DEMO' && (
            <div className="panel-surface p-6 space-y-4 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-300">BENCHMARK DEMONSTRATION SUITE</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                  7 FILES • 5 LANGUAGES
                </span>
              </div>

              <p className="text-xs text-[#9a9a9a] leading-relaxed">
                Evaluates the authentic <span className="text-white font-medium">Apex Bank & API Microservice</span> codebase featuring reproducible security flaws across Python, TypeScript, Go, PHP, and Dockerfile.
              </p>

              <div className="p-3.5 rounded-lg bg-black/50 border border-white/10 space-y-2 text-xs font-mono">
                <div className="text-[#9a9a9a] text-[11px]">BENCHMARK TARGETS:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-white/80">
                  <div><span className="text-amber-400">•</span> backend/auth.py (SQLi, Weak PBKDF2)</div>
                  <div><span className="text-amber-400">•</span> backend/database.py (SQLi, Command Injection)</div>
                  <div><span className="text-amber-400">•</span> backend/routes/payment.ts (Eval, SQLi)</div>
                  <div><span className="text-amber-400">•</span> backend/crypto_helper.go (MD5, Insecure Rand)</div>
                  <div><span className="text-amber-400">•</span> backend/file_handler.php (Path Trav, Unserialize)</div>
                  <div><span className="text-amber-400">•</span> Dockerfile (Root execution)</div>
                </div>
              </div>
            </div>
          )}

          {/* ZIP ARCHIVE */}
          {activeMode === 'ZIP' && (
            <div className="panel-surface p-6 space-y-4 text-center">
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={handleZipUpload}
                className="hidden"
              />
              <div 
                onClick={() => zipInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-8 cursor-pointer transition-all bg-white/5 hover:bg-white/8 flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <FolderArchive className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Select or Drag & Drop Repository ZIP</div>
                  <p className="text-xs text-[#9a9a9a] mt-1">Accepts .zip archives containing project source code</p>
                </div>
              </div>

              {stagedFiles.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>Extracted {stagedFiles.length} source files ready for assessment</span>
                  <span className="text-white/60">{projectName}</span>
                </div>
              )}
            </div>
          )}

          {/* MULTI FILES */}
          {activeMode === 'FILES' && (
            <div className="panel-surface p-6 space-y-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-8 cursor-pointer transition-all bg-white/5 hover:bg-white/8 flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Select Individual Source Files</div>
                  <p className="text-xs text-[#9a9a9a] mt-1">.py, .ts, .js, .go, .java, .php, .sql, Dockerfile</p>
                </div>
              </div>

              {stagedFiles.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>{stagedFiles.length} files queued for assessment</span>
                  <span className="text-white/60">{projectName}</span>
                </div>
              )}
            </div>
          )}

          {/* PASTE CODE */}
          {activeMode === 'PASTE' && (
            <div className="panel-surface p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pastedFilename}
                    onChange={(e) => setPastedFilename(e.target.value)}
                    placeholder="filename.py"
                    className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
                  />
                  <select
                    value={pastedLang}
                    onChange={(e) => setPastedLang(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="python">Python</option>
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="go">Go</option>
                    <option value="php">PHP</option>
                    <option value="sql">SQL</option>
                    <option value="dockerfile">Dockerfile</option>
                  </select>
                </div>

                <span className="text-[11px] font-mono text-[#9a9a9a]">
                  {pastedCode.split('\n').length} lines
                </span>
              </div>

              <textarea
                value={pastedCode}
                onChange={(e) => setPastedCode(e.target.value)}
                placeholder="Paste vulnerable or target source code here..."
                rows={12}
                className="w-full p-4 rounded-lg bg-black/70 border border-white/15 text-xs font-mono text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/40 resize-y"
                spellCheck={false}
              />
            </div>
          )}

          {/* REPOSITORY */}
          {activeMode === 'REPO' && (
            <div className="panel-surface p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                <GitBranch className="w-4 h-4 text-amber-400" />
                <span className="font-bold">GIT REPOSITORY CONNECTOR</span>
              </div>
              <p className="text-xs text-[#9a9a9a]">
                Direct repository integration is currently scheduled for engine v2.5. To assess a Git repository today, please clone it locally and upload as a ZIP archive or directory package.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveMode('ZIP')}
                  className="btn-liquid-primary px-4 py-2 rounded-lg text-xs font-mono font-medium"
                >
                  SWITCH TO ZIP UPLOAD
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Controls (1 col) */}
        <div className="space-y-6">
          <div className="panel-surface p-7 sm:p-8 rounded-2xl space-y-6 border border-white/15 shadow-xl">
            <h3 className="font-press-start text-[10px] text-[#85D743] uppercase tracking-wider flex items-center gap-2.5">
              <Settings2 className="w-4 h-4 text-[#85D743]" />
              SCANNER CONTROLS
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-mono text-xs text-white/70 font-semibold mb-1.5 uppercase">PROJECT NAME</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#85D743]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-white/70 font-semibold mb-1.5 uppercase">SCAN PROFILE</label>
                <select
                  value={scanProfile}
                  onChange={(e) => setScanProfile(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#85D743]/50 transition-colors"
                >
                  <option value="STANDARD">Standard AST & Regex Engine</option>
                  <option value="DEEP">Deep Full-Spectrum Analysis</option>
                  <option value="STRICT">Strict Zero-Tolerance Policy</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-white/70 font-semibold mb-1.5 uppercase">EXCLUDED PATHS</label>
                <input
                  type="text"
                  value={excludedPaths}
                  onChange={(e) => setExcludedPaths(e.target.value)}
                  placeholder="node_modules, .git, tests"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#85D743]/50 transition-colors"
                />
              </div>
            </div>

            {/* Scan Execution Button */}
            <div className="pt-3">
              <button
                id="execute-scan-btn"
                onClick={handleExecuteScan}
                disabled={isScanning}
                className="btn-liquid-primary w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-xl"
              >
                {isScanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span className="font-press-start text-[10px]">ANALYZING SOURCE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-black" />
                    <span>RUN SECURITY ASSESSMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {isScanning && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/15 space-y-1.5 text-xs sm:text-sm font-mono text-white/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">{scanStage}</span>
                </div>
                <div className="text-xs text-[#9a9a9a]">Executing syntax tree validation on server</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
