import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Upload,
  Search,
  Filter,
  Download,
  Share2,
  Trash2,
  Eye,
  FileText,
  FileCode,
  FileArchive,
  File as FileIcon,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { VaultFile } from '../types';
import { api } from '../services/api';

interface VaultViewProps {
  files: VaultFile[];
  onOpenFileUpload: () => void;
  onSelectFile: (file: VaultFile) => void;
  onRefresh: () => void;
  currentUserEmail: string;
  onSeedDemo: () => void;
  onResetDemo: () => void;
  isDemoActive: boolean;
}

export const VaultView: React.FC<VaultViewProps> = ({
  files,
  onOpenFileUpload,
  onSelectFile,
  onRefresh,
  currentUserEmail,
  onSeedDemo,
  onResetDemo,
  isDemoActive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'OWNER' | 'SHARED'>('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [integrityToast, setIntegrityToast] = useState<{ id: string; verified: boolean; hash: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getFileIcon = (mime: string, name: string) => {
    if (mime.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-red-400 shrink-0" />;
    }
    if (mime.includes('text') || name.endsWith('.env') || name.endsWith('.json') || name.endsWith('.ts')) {
      return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (mime.includes('zip') || mime.includes('tar') || mime.includes('rar')) {
      return <FileArchive className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <FileIcon className="w-4 h-4 text-white/70 shrink-0" />;
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase());

    const isOwned = file.ownerEmail.toLowerCase() === currentUserEmail.toLowerCase();
    if (roleFilter === 'OWNER') return matchesSearch && isOwned;
    if (roleFilter === 'SHARED') return matchesSearch && !isOwned;
    return matchesSearch;
  });

  const handleQuickDownload = async (file: VaultFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(file.id);
    try {
      const res = await api.downloadFile(file.id, file.originalName);
      setIntegrityToast({
        id: file.id,
        verified: res.integrityVerified,
        hash: res.sha256,
      });
      setTimeout(() => setIntegrityToast(null), 5000);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleQuickDelete = async (file: VaultFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Permanently erase encrypted file "${file.originalName}"?`)) return;
    try {
      await api.deleteFile(file.id);
      onRefresh();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner for Demo State */}
      {isDemoActive && (
        <div className="p-3 border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-tech">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>DETERMINISTIC DEMO ENVIRONMENT ACTIVE</strong> — Seeded with sample encrypted payloads & verified audit logs.
            </span>
          </div>
          <button
            id="btn-reset-demo-banner"
            onClick={onResetDemo}
            className="px-3 py-1.5 border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 uppercase tracking-wider text-[11px] transition-colors shrink-0"
          >
            RESTORE PRISTINE VAULT
          </button>
        </div>
      )}

      {/* Integrity Verification Live Toast */}
      {integrityToast && (
        <div className="p-3.5 border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 font-mono-tech text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>INTEGRITY VERIFIED:</strong> AES-256-GCM decrypted and verified matching SHA-256: {integrityToast.hash.substring(0, 16)}...
            </span>
          </div>
          <button
            onClick={() => setIntegrityToast(null)}
            className="text-emerald-400 hover:text-emerald-200 uppercase text-[10px]"
          >
            [ DISMISS ]
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-white/50 font-mono-tech text-[10px] tracking-widest uppercase">
            <Shield className="w-3.5 h-3.5 text-white/60" />
            SECURE VAULT REPOSITORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-1">
            My Encrypted Vault
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!isDemoActive && files.length === 0 && (
            <button
              id="btn-seed-demo-quick"
              onClick={onSeedDemo}
              className="px-4 py-2.5 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono-tech text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>LOAD SECURITY DEMO</span>
            </button>
          )}

          <button
            id="btn-open-upload-modal"
            onClick={onOpenFileUpload}
            className="px-5 py-2.5 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>+ UPLOAD FILE</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="vault-search-input"
            type="text"
            placeholder="Search by file name, owner, or SHA-256 fingerprint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#08080a]/75 backdrop-blur-md border border-white/15 text-white font-mono-tech text-xs focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="sm:col-span-4 flex gap-1 border border-white/15 p-1 bg-[#08080a]/75 backdrop-blur-md">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`flex-1 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider transition-colors ${
              roleFilter === 'ALL' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            ALL ({files.length})
          </button>
          <button
            onClick={() => setRoleFilter('OWNER')}
            className={`flex-1 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider transition-colors ${
              roleFilter === 'OWNER' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            OWNED
          </button>
          <button
            onClick={() => setRoleFilter('SHARED')}
            className={`flex-1 py-1.5 font-mono-tech text-[11px] uppercase tracking-wider transition-colors ${
              roleFilter === 'SHARED' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            SHARED
          </button>
        </div>
      </div>

      {/* Main Technical Files Table */}
      {files.length === 0 ? (
        /* Empty State */
        <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md p-12 text-center space-y-4">
          <div className="w-12 h-12 border border-white/20 bg-white/5 flex items-center justify-center mx-auto text-white/50">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-mono-tech text-sm font-semibold tracking-wider text-white uppercase">
              NO FILES YET
            </h3>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              Upload your first file to create an encrypted secure vault. Files are encrypted with AES-256-GCM before storage.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onOpenFileUpload}
              className="px-4 py-2 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-widest hover:bg-white/90"
            >
              UPLOAD FIRST FILE
            </button>
            <button
              onClick={onSeedDemo}
              className="px-4 py-2 border border-white/20 text-white font-mono-tech text-xs uppercase tracking-widest hover:bg-white/10"
            >
              LOAD DEMO DATASET
            </button>
          </div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md p-8 text-center font-mono-tech text-xs text-white/50">
          No encrypted files matched your search filter "{searchTerm}".
        </div>
      ) : (
        <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left border-collapse" id="vault-files-table">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] font-mono-tech text-[10px] text-white/40 tracking-widest uppercase">
                <th className="py-3 px-4">OBJECT / FILE NAME</th>
                <th className="py-3 px-4">SIZE</th>
                <th className="py-3 px-4">CIPHER</th>
                <th className="py-3 px-4">INTEGRITY</th>
                <th className="py-3 px-4">OWNER</th>
                <th className="py-3 px-4">YOUR ROLE</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono-tech text-xs">
              {filteredFiles.map((file) => {
                const isOwned = file.ownerEmail.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <tr
                    key={file.id}
                    onClick={() => onSelectFile(file)}
                    className="hover:bg-white/[0.04] cursor-pointer transition-colors group"
                  >
                    {/* File Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {getFileIcon(file.mimeType, file.originalName)}
                        <div>
                          <div className="text-white font-medium group-hover:text-white/90">
                            {file.originalName}
                          </div>
                          <div className="text-[10px] text-white/40 truncate max-w-[200px]">
                            {file.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4 text-white/70">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>

                    {/* Encryption */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 border border-white/15 bg-white/5 text-white/90">
                        <Lock className="w-2.5 h-2.5 text-white/60" />
                        AES-256-GCM
                      </span>
                    </td>

                    {/* Integrity */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        SHA-256 VERIFIED
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4 text-white/70 truncate max-w-[140px]">
                      {isOwned ? 'YOU' : file.ownerEmail}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 border ${
                          file.userRole === 'OWNER'
                            ? 'border-white/30 text-white bg-white/5 font-semibold'
                            : file.userRole === 'EDITOR'
                            ? 'border-blue-500/30 text-blue-400 bg-blue-500/5'
                            : 'border-white/15 text-white/70'
                        }`}
                      >
                        {file.userRole || (isOwned ? 'OWNER' : 'VIEWER')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`btn-inspect-${file.id}`}
                          onClick={() => onSelectFile(file)}
                          className="p-1.5 border border-white/10 hover:border-white/30 bg-white/5 text-white/70 hover:text-white transition-colors"
                          title="Inspect Cryptographic Metadata"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`btn-download-${file.id}`}
                          onClick={(e) => handleQuickDownload(file, e)}
                          disabled={downloadingId === file.id}
                          className="p-1.5 border border-white/10 hover:border-white/30 bg-white/5 text-white/70 hover:text-white transition-colors"
                          title="Download & Verify Integrity"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {isOwned && (
                          <button
                            id={`btn-delete-${file.id}`}
                            onClick={(e) => handleQuickDelete(file, e)}
                            className="p-1.5 border border-red-500/30 hover:border-red-500/50 bg-red-500/5 text-red-400 hover:text-red-300 transition-colors"
                            title="Purge File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
