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
      <div className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-2">
            <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
              04 // SOURCE EXPLORER
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              SOURCE CODE <span className="font-serif-italic font-normal">EXPLORER</span>
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
              Interactive source viewer linked directly to discovered vulnerability evidence.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm font-mono">
            <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">ACTIVE FILE</div>
              <div className="text-white/60 font-semibold mt-0.5">—</div>
            </div>
            <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">STATUS</div>
              <div className="text-white/60 font-semibold mt-0.5">NO FILES LOADED</div>
            </div>
          </div>
        </div>

        <div className="panel-surface p-12 sm:p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-12 border border-white/15 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#85D743]/10 border-2 border-[#85D743]/40 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(133,215,67,0.2)]">
            <FileCode className="w-8 h-8 text-[#85D743]" />
          </div>
          <div className="font-press-start text-xs text-[#85D743] mb-3 uppercase tracking-wider">
            STANDBY // NO CODE
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">NO CODE LOADED</h3>
          <p className="text-base text-white/70 max-w-lg mb-8 leading-relaxed">
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
    <div className="space-y-10">
      {/* Consistent Spacious Internal Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="text-[10px] sm:text-[11px] font-press-start tracking-widest text-[#85D743] uppercase">
            04 // SOURCE EXPLORER
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-4">
            SOURCE CODE <span className="font-serif-italic font-normal">EXPLORER</span>
            <span className="font-press-start text-[9px] px-3.5 py-1 rounded-lg uppercase bg-white/10 text-white/90 border border-white/15">
              {currentScan.files.length} FILES
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed">
            Line-by-line evidence inspection with contextual vulnerability annotations and synchronized finding markers.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono">
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">ACTIVE FILE</div>
            <div className="text-white/90 font-bold truncate max-w-[200px] mt-0.5">{activeFile.path}</div>
          </div>
          <div className="text-right hidden sm:block p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">LINE COUNT</div>
            <div className="text-white/90 font-bold mt-0.5">{fileLines.length} LOC</div>
          </div>
          <div className="text-right p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[#9a9a9a] text-[10px] uppercase font-bold tracking-wider">FILE WEAKNESSES</div>
            <div className={`font-bold mt-0.5 ${fileFindings.length > 0 ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}`}>
              {fileFindings.length} Detected
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Spacious IDE Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[720px]">
        {/* Left: File List (3 cols) */}
        <div className="lg:col-span-3 panel-surface p-5 space-y-4 h-full max-h-[800px] overflow-y-auto rounded-2xl border border-white/15 shadow-xl">
          <div className="font-press-start text-[9px] text-[#85D743] uppercase tracking-wider px-2 py-1 flex items-center justify-between border-b border-white/10 pb-3">
            <span>EXPLORER TREE</span>
            <span>{currentScan.files.length}</span>
          </div>

          <div className="space-y-1.5">
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
                  className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-mono flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white font-bold border border-white/30 shadow-md'
                      : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCode className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#85D743]' : 'text-white/50'}`} />
                    <span className="truncate">{file.path}</span>
                  </div>

                  {hasFindings && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-press-start bg-rose-500/20 text-rose-300 border border-rose-500/40 flex-shrink-0">
                      {file.findingsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Source Code Viewer (6 cols) */}
        <div className="lg:col-span-6 panel-surface overflow-hidden flex flex-col h-full max-h-[800px] rounded-2xl border border-white/15 shadow-2xl">
          {/* File Top Bar */}
          <div className="px-6 py-4 bg-black/60 border-b border-white/10 flex items-center justify-between text-xs sm:text-sm font-mono">
            <div className="flex items-center gap-3 text-white/90 font-bold truncate">
              <Code2 className="w-5 h-5 text-[#85D743] flex-shrink-0" />
              <span className="text-white truncate">{activeFile.path}</span>
              <span className="text-white/50 text-xs font-normal">({activeFile.lines} lines)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyFile}
                className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer shadow-sm"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'COPIED' : 'COPY FILE'}</span>
              </button>
            </div>
          </div>

          {/* Line Gutter & Code */}
          <div ref={codeContainerRef} className="flex-1 overflow-y-auto bg-black/85 p-6 font-mono text-sm leading-relaxed select-text">
            {fileLines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const findingOnLine = lineFindingMap.get(lineNum);
              const isSelectedLine = selectedLineNumber === lineNum;

              let lineBg = 'hover:bg-white/5';
              if (isSelectedLine) {
                lineBg = 'bg-white/20 border-l-4 border-white';
              } else if (findingOnLine) {
                lineBg = findingOnLine.severity === 'CRITICAL'
                  ? 'bg-rose-950/40 border-l-4 border-rose-500'
                  : 'bg-amber-950/40 border-l-4 border-amber-500';
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
                  className={`flex items-start py-1 px-3 rounded transition-colors group ${lineBg} ${
                    findingOnLine ? 'cursor-pointer' : ''
                  }`}
                >
                  <span className="w-12 flex-shrink-0 text-right pr-5 text-white/40 select-none group-hover:text-white/80 font-mono text-xs sm:text-sm">
                    {lineNum}
                  </span>

                  {findingOnLine ? (
                    <span 
                      className={`w-3 h-3 rounded-full mr-3 self-center flex-shrink-0 ${
                        findingOnLine.severity === 'CRITICAL' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500'
                      }`} 
                      title={`${findingOnLine.severity}: ${findingOnLine.title}`}
                    />
                  ) : (
                    <span className="w-3 mr-3 flex-shrink-0" />
                  )}

                  <span className={`whitespace-pre overflow-x-auto flex-1 ${
                    findingOnLine 
                      ? 'text-rose-300 font-bold' 
                      : 'text-white/90'
                  }`}>
                    {lineText || ' '}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Vulnerability Inspector Panel (3 cols) */}
        <div className="lg:col-span-3 panel-surface p-6 sm:p-7 space-y-6 h-full max-h-[800px] overflow-y-auto rounded-2xl border border-white/15 shadow-xl">
          <div className="font-press-start text-[9px] text-[#85D743] uppercase tracking-wider border-b border-white/10 pb-3 flex items-center justify-between">
            <span>INSPECTION PANEL</span>
            {activeFinding && (
              <span className={`px-2.5 py-0.5 rounded text-[8px] font-press-start ${
                activeFinding.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {activeFinding.severity}
              </span>
            )}
          </div>

          {activeFinding ? (
            <div className="space-y-5 text-sm">
              <div className="space-y-2">
                <div className="text-[#85D743] font-mono text-xs font-bold">{activeFinding.cwe} • RULE {activeFinding.ruleId}</div>
                <h4 className="font-bold text-white text-base sm:text-lg leading-snug">{activeFinding.title}</h4>
                <div className="text-white/60 font-mono text-xs">
                  {activeFinding.file}:{activeFinding.line}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[#9a9a9a] font-mono text-xs uppercase font-bold">EVIDENCE CODE</div>
                <pre className="p-3.5 rounded-xl bg-black/80 border border-white/15 font-mono text-xs sm:text-sm text-rose-300 whitespace-pre-wrap break-all shadow-inner">
                  {activeFinding.evidence}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="text-[#9a9a9a] font-mono text-xs uppercase font-bold">DESCRIPTION</div>
                <p className="text-white/70 font-sans text-xs sm:text-sm leading-relaxed">
                  {activeFinding.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-emerald-400 font-mono text-xs uppercase font-bold">REMEDIATION</div>
                <p className="text-white/70 font-sans text-xs sm:text-sm leading-relaxed">
                  {activeFinding.remediation}
                </p>
              </div>

              {/* Copilot trigger */}
              <button
                onClick={() => onOpenCopilotWithFinding(activeFinding)}
                className="btn-liquid-primary w-full py-3.5 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>COPILOT REMEDIATION</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-[#9a9a9a] font-mono text-sm space-y-3">
              <Check className="w-10 h-10 text-emerald-400/60 mx-auto" />
              <div>No vulnerabilities detected on this line or file.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
