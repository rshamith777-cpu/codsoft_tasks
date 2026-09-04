import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Copy, 
  Code2
} from 'lucide-react';
import { ScanResult, Finding } from '../types.ts';

interface CodeExplorerViewProps {
  currentScan: ScanResult | null;
  targetFile?: string | null;
  targetLine?: number | null;
  onOpenCopilotWithFinding: (finding: Finding) => void;
}

export const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({
  currentScan,
  targetFile,
  targetLine,
  onOpenCopilotWithFinding
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [selectedLineNumber, setSelectedLineNumber] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement | null>(null);

  // Set initial file if currentScan changes or targetFile is passed
  useEffect(() => {
    if (currentScan && currentScan.files && currentScan.files.length > 0) {
      if (targetFile && currentScan.files.some(f => f.path === targetFile)) {
        setSelectedFilePath(targetFile);
      } else if (!selectedFilePath || !currentScan.files.some(f => f.path === selectedFilePath)) {
        const fileWithFinding = currentScan.files.find(f => f.findingsCount > 0);
        setSelectedFilePath(fileWithFinding ? fileWithFinding.path : currentScan.files[0].path);
      }
    }
  }, [currentScan, targetFile]);

  useEffect(() => {
    if (targetLine) {
      setSelectedLineNumber(targetLine);
      setTimeout(() => {
        const el = document.getElementById(`code-line-${targetLine}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [targetLine, selectedFilePath]);

  if (!currentScan || !currentScan.files || currentScan.files.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">04 / SOURCE EXPLORER</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              CODE <span className="font-serif-italic font-normal">ASSESSMENT</span>
            </h1>
            <p className="text-sm text-[#9a9a9a]">
              Interactive source viewer linked directly to discovered vulnerability evidence.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <div className="text-[#9a9a9a] text-[10px]">ACTIVE FILE</div>
              <div className="text-white/60">—</div>
            </div>
            <div className="text-right">
              <div className="text-[#9a9a9a] text-[10px]">STATUS</div>
              <div className="text-white/60">NO FILES LOADED</div>
            </div>
          </div>
        </div>

        <div className="panel-surface p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 border border-white/10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <FileCode className="w-6 h-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">NO CODE LOADED</h3>
          <p className="text-sm text-[#9a9a9a] leading-relaxed">
            Run a security assessment or load the demo project to inspect vulnerable source files.
          </p>
        </div>
      </div>
    );
  }

  const activeFile = currentScan.files.find(f => f.path === selectedFilePath) || currentScan.files[0];
  const fileLines = activeFile ? activeFile.content.split(/\r?\n/) : [];
  const fileFindings = currentScan.findings.filter(f => f.file === activeFile.path);

  const lineFindingMap = new Map<number, Finding>();
  for (const f of fileFindings) {
    lineFindingMap.set(f.line, f);
  }

  const activeFinding = selectedLineNumber 
    ? lineFindingMap.get(selectedLineNumber) || fileFindings[0]
    : fileFindings[0];

  const handleCopyFile = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Consistent Internal Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">04 / SOURCE EXPLORER</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            CODE <span className="font-serif-italic font-normal">ASSESSMENT</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
              {currentScan.files.length} FILES
            </span>
          </h1>
          <p className="text-sm text-[#9a9a9a]">
            Line-by-line evidence inspection with contextual vulnerability annotations.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="text-right">
            <div className="text-[#9a9a9a] text-[10px]">ACTIVE FILE</div>
            <div className="text-white/90 truncate max-w-[160px]">{activeFile.path}</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[#9a9a9a] text-[10px]">LINE COUNT</div>
            <div className="text-white/90">{fileLines.length} LOC</div>
          </div>
          <div className="text-right">
            <div className="text-[#9a9a9a] text-[10px]">FILE WEAKNESSES</div>
            <div className={fileFindings.length > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {fileFindings.length} Detected
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column IDE Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[620px]">
        {/* Left: File List (3 cols) */}
        <div className="lg:col-span-3 panel-surface p-3 space-y-3 h-full max-h-[680px] overflow-y-auto">
          <div className="text-[11px] font-mono text-[#9a9a9a] uppercase tracking-wider px-2 py-1 flex items-center justify-between border-b border-white/5 pb-2">
            <span>EXPLORER TREE</span>
            <span>{currentScan.files.length}</span>
          </div>

          <div className="space-y-1">
            {currentScan.files.map((file) => {
              const isSelected = file.path === activeFile.path;
              const hasFindings = file.findingsCount > 0;

              return (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedFilePath(file.path);
                    setSelectedLineNumber(null);
                  }}
                  className={`w-full p-2 rounded-lg text-left text-xs font-mono flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white font-medium border border-white/20'
                      : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-white/50" />
                    <span className="truncate">{file.path}</span>
                  </div>

                  {hasFindings && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex-shrink-0">
                      {file.findingsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Source Code Viewer (6 cols) */}
        <div className="lg:col-span-6 panel-surface overflow-hidden flex flex-col h-full max-h-[680px]">
          {/* File Top Bar */}
          <div className="px-4 py-2.5 bg-black/60 border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-white/80 font-medium truncate">
              <Code2 className="w-4 h-4 text-white/50 flex-shrink-0" />
              <span className="text-white truncate">{activeFile.path}</span>
              <span className="text-[#9a9a9a] text-[11px]">({activeFile.lines} lines)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFile}
                className="text-[11px] font-mono text-white/50 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Line Gutter & Code */}
          <div ref={codeContainerRef} className="flex-1 overflow-y-auto bg-black/80 p-3 font-mono text-xs select-text">
            {fileLines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const findingOnLine = lineFindingMap.get(lineNum);
              const isSelectedLine = selectedLineNumber === lineNum;

              let lineBg = 'hover:bg-white/5';
              if (isSelectedLine) {
                lineBg = 'bg-white/15 border-l-2 border-white';
              } else if (findingOnLine) {
                lineBg = findingOnLine.severity === 'CRITICAL'
                  ? 'bg-rose-950/30 border-l-2 border-rose-500'
                  : 'bg-amber-950/30 border-l-2 border-amber-500';
              }

              return (
                <div
                  key={lineNum}
                  id={`code-line-${lineNum}`}
                  onClick={() => {
                    if (findingOnLine) {
                      setSelectedLineNumber(lineNum);
                    }
                  }}
                  className={`flex items-start py-0.5 px-2 rounded transition-colors group ${lineBg} ${
                    findingOnLine ? 'cursor-pointer' : ''
                  }`}
                >
                  <span className="w-10 flex-shrink-0 text-right pr-4 text-white/30 select-none group-hover:text-white/60">
                    {lineNum}
                  </span>

                  {findingOnLine ? (
                    <span 
                      className={`w-2.5 h-2.5 rounded-full mr-2 self-center flex-shrink-0 ${
                        findingOnLine.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                      }`} 
                      title={`${findingOnLine.severity}: ${findingOnLine.title}`}
                    />
                  ) : (
                    <span className="w-2.5 mr-2 flex-shrink-0" />
                  )}

                  <span className={`whitespace-pre overflow-x-auto flex-1 ${
                    findingOnLine 
                      ? 'text-rose-300 font-semibold' 
                      : 'text-white/80'
                  }`}>
                    {lineText || ' '}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Vulnerability Inspector Panel (3 cols) */}
        <div className="lg:col-span-3 panel-surface p-4 space-y-4 h-full max-h-[680px] overflow-y-auto">
          <div className="text-[11px] font-mono text-[#9a9a9a] uppercase tracking-wider border-b border-white/5 pb-2 flex items-center justify-between">
            <span>INSPECTION PANEL</span>
            {activeFinding && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeFinding.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {activeFinding.severity}
              </span>
            )}
          </div>

          {activeFinding ? (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="text-[#9a9a9a] font-mono text-[10px]">{activeFinding.cwe} • RULE {activeFinding.ruleId}</div>
                <h4 className="font-semibold text-white text-sm leading-snug">{activeFinding.title}</h4>
                <div className="text-white/60 font-mono text-[11px]">
                  {activeFinding.file}:{activeFinding.line}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[#9a9a9a] font-mono text-[10px] uppercase">EVIDENCE</div>
                <pre className="p-2.5 rounded bg-black/60 border border-white/10 font-mono text-xs text-rose-300 whitespace-pre-wrap break-all">
                  {activeFinding.evidence}
                </pre>
              </div>

              <div className="space-y-1">
                <div className="text-[#9a9a9a] font-mono text-[10px] uppercase">DESCRIPTION</div>
                <p className="text-[#9a9a9a] font-sans text-xs leading-relaxed">
                  {activeFinding.description}
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-emerald-400 font-mono text-[10px] uppercase">REMEDIATION</div>
                <p className="text-[#9a9a9a] font-sans text-xs leading-relaxed">
                  {activeFinding.remediation}
                </p>
              </div>

              {/* Copilot trigger */}
              <button
                onClick={() => onOpenCopilotWithFinding(activeFinding)}
                className="btn-liquid-primary w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>COPILOT REMEDIATION</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-[#9a9a9a] font-mono text-xs space-y-2">
              <Check className="w-8 h-8 text-emerald-400/50 mx-auto" />
              <div>No vulnerabilities detected in this file.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
