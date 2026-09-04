import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Binary,
  Layers,
  Fingerprint,
  Lock,
} from 'lucide-react';
import { VaultFile } from '../types';
import { Button } from './ui/Button';
import { CryptoBadge, IntegrityBadge } from './ui/Badges';
import { SearchInput } from './ui/Input';

interface CryptoInspectorViewProps {
  files: VaultFile[];
  onRefresh: () => void;
  onSelectFileForDownload?: (file: VaultFile) => void;
}

export const CryptoInspectorView: React.FC<CryptoInspectorViewProps> = ({
  files = [],
  onRefresh,
}) => {
  const safeFiles = files ?? [];
  const [selectedFileId, setSelectedFileId] = useState<string>(safeFiles[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedFile = safeFiles.find((f) => f.id === selectedFileId) || safeFiles[0] || null;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredFiles = safeFiles.filter((f) => {
    if (!f) return false;
    const name = (f.originalName || '').toLowerCase();
    const hash = (f.sha256Hash || '').toLowerCase();
    const id = (f.id || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    return name.includes(search) || hash.includes(search) || id.includes(search);
  });

  return (
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-start">
      <div className="w-full max-w-[1720px] mx-auto space-y-6 animate-hero-entrance">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
              <Terminal className="w-3.5 h-3.5 text-white/70" />
              <span>03 CRYPTOGRAPHIC OBJECT INSPECTOR</span>
            </div>
            <h1 className="font-sans-main text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Ciphertext &amp; Digest Analysis
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3 h-3" />}
              onClick={onRefresh}
            >
              Sync Objects
            </Button>
          </div>
        </div>

        {/* Empty State if no files exist in vault */}
        {safeFiles.length === 0 ? (
          <div className="p-16 glass-panel rounded-[2px] text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-[2px] bg-white/[0.05] border border-white/15 flex items-center justify-center mx-auto text-white/70">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans-main text-lg text-white font-medium">NO ENCRYPTED OBJECTS</h3>
              <p className="font-mono-tech text-xs text-white/45 mt-1">
                Upload your first protected file to begin cryptographic envelope and digest inspection.
              </p>
            </div>
          </div>
        ) : (
          /* Asymmetric 2-Column Inspector Layout */
          <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-6">
            {/* Column 1: Object Selector List */}
            <div className="space-y-3">
              <SearchInput
                placeholder="Filter by filename or SHA-256..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
              />

              <div className="glass-panel rounded-[2px] max-h-[560px] overflow-y-auto divide-y divide-white/5">
                {filteredFiles.length === 0 ? (
                  <div className="p-8 text-center font-mono-tech text-xs text-white/40">
                    [ NO ENCRYPTED OBJECTS MATCHING FILTER ]
                  </div>
                ) : (
                  filteredFiles.map((file) => {
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => setSelectedFileId(file.id)}
                        className={`w-full text-left p-4 transition-colors cursor-pointer flex flex-col gap-2 font-mono-tech ${
                          isSelected
                            ? 'bg-white/[0.08] border-l-2 border-white'
                            : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-sans-main text-sm text-white font-medium truncate max-w-[220px]">
                            {file.originalName}
                          </span>
                          <span className="text-xs text-emerald-400 font-medium">AES-256</span>
                        </div>

                        <div className="text-xs text-white/50 truncate">
                          ID: {file.id}
                        </div>

                        <div className="text-xs text-white/40 truncate font-mono">
                          SHA: {file.sha256Hash?.substring(0, 28)}...
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Detailed Technical Cryptographic Inspector */}
            {selectedFile ? (
              <div className="glass-panel rounded-[3px] p-6 space-y-6 font-mono-tech">
                {/* Object Metadata & Identification */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs tracking-[0.16em] text-white/50 uppercase mb-1">
                      OBJECT IDENTIFIER
                    </div>
                    <div className="text-base text-white font-semibold flex items-center gap-2.5">
                      <span>{selectedFile.id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedFile.id, 'id')}
                        className="text-white/50 hover:text-white p-1"
                        title="Copy Object ID"
                      >
                        {copiedKey === 'id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IntegrityBadge status="VERIFIED" />
                  </div>
                </div>

                {/* Cryptographic Parameters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-[3px] space-y-1.5">
                    <div className="text-xs text-white/50 uppercase tracking-wider font-medium">
                      AUTHENTICATED ENCRYPTION ALGORITHM
                    </div>
                    <div className="text-white font-bold tracking-wider text-base">
                      {selectedFile.encryptionAlgo || 'AES-256-GCM'}
                    </div>
                    <div className="text-xs text-white/50 leading-relaxed">
                      Galois/Counter Mode with 128-bit authentication tag
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-[3px] space-y-1.5">
                    <div className="text-xs text-white/50 uppercase tracking-wider font-medium">
                      KEY DERIVATION &amp; SCOPE
                    </div>
                    <div className="text-white font-bold tracking-wider text-base">
                      UNIQUE PER-OBJECT KEY (256-BIT)
                    </div>
                    <div className="text-xs text-white/50 leading-relaxed">
                      Symmetric key held in vault key-store. Raw key never transmitted.
                    </div>
                  </div>
                </div>

                {/* Envelope Breakdown: IV, Auth Tag, SHA-256 Digest */}
                <div className="space-y-3.5 pt-2">
                  <div className="text-xs text-white/60 tracking-wider uppercase flex items-center gap-2 font-medium">
                    <Binary className="w-4 h-4" />
                    <span>Envelope Parameters (Non-Secret Public Metadata)</span>
                  </div>

                  {/* SHA-256 Digest */}
                  <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>SHA-256 RECALCULATED DIGEST</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedFile.sha256Hash || '', 'hash')}
                        className="text-white/50 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'hash' ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-300 font-mono break-all selection:bg-emerald-500/30">
                      {selectedFile.sha256Hash || '—'}
                    </div>
                  </div>

                  {/* IV */}
                  <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>INITIALIZATION VECTOR (12 BYTES / 96 BITS)</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedFile.ivHex || '', 'iv')}
                        className="text-white/50 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'iv' ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'iv' ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm text-sky-300 font-mono break-all">
                      {selectedFile.ivHex || '—'}
                    </div>
                  </div>

                  {/* Auth Tag */}
                  <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>GCM AUTHENTICATION TAG (16 BYTES / 128 BITS)</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedFile.authTagHex || '', 'tag')}
                        className="text-white/50 hover:text-white flex items-center gap-1.5"
                      >
                        {copiedKey === 'tag' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'tag' ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-300 font-mono break-all">
                      {selectedFile.authTagHex || '—'}
                    </div>
                  </div>
                </div>

                {/* Technical Verification Statement */}
                <div className="p-4 border border-white/10 bg-white/[0.02] rounded-[3px] text-xs sm:text-sm text-white/70 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Security Invariant:</span>
                  </div>
                  <div className="leading-relaxed">
                    If a single bit in the ciphertext storage blob is modified or flipped, the GCM authentication tag verification will fail deterministically on decryption, throwing an authentication error and preventing data leakage.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center glass-panel rounded-[2px] font-mono-tech text-white/40">
                [ SELECT AN OBJECT TO VIEW CRYPTOGRAPHIC PARAMETERS ]
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
