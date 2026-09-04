import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Upload,
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
  Copy,
  Check,
  UserPlus,
  Clock,
  KeyRound,
  X,
} from 'lucide-react';
import { VaultFile, UserRole } from '../types';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { CryptoBadge, RoleBadge, IntegrityBadge } from './ui/Badges';
import { SearchInput, Input, Select } from './ui/Input';
import { Drawer } from './ui/Drawer';
import { useToast } from './ui/Toast';

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
  const [drawerFile, setDrawerFile] = useState<VaultFile | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'permissions' | 'share'>('overview');
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('VIEWER');
  const [shareExpiryHours, setShareExpiryHours] = useState(24);
  const [copiedLinkToken, setCopiedLinkToken] = useState<string | null>(null);
  const { showToast } = useToast();

  const getFileIcon = (mime: string, name: string) => {
    if (mime?.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="w-4 h-4 text-red-400 shrink-0" />;
    }
    if (
      mime?.includes('text') ||
      name.endsWith('.env') ||
      name.endsWith('.json') ||
      name.endsWith('.ts')
    ) {
      return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (mime?.includes('zip') || mime?.includes('tar') || mime?.includes('rar')) {
      return <FileArchive className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <FileIcon className="w-4 h-4 text-white/70 shrink-0" />;
  };

  const safeFiles = files ?? [];
  const safeEmail = (currentUserEmail || '').toLowerCase();

  const filteredFiles = safeFiles.filter((file) => {
    if (!file) return false;
    const origName = (file.originalName || '').toLowerCase();
    const owner = (file.ownerEmail || '').toLowerCase();
    const hash = (file.sha256Hash || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch = origName.includes(search) || owner.includes(search) || hash.includes(search);

    const isOwned = owner === safeEmail;
    if (roleFilter === 'OWNER') return matchesSearch && isOwned;
    if (roleFilter === 'SHARED') return matchesSearch && !isOwned;
    return matchesSearch;
  });

  const handleQuickDownload = async (file: VaultFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(file.id);
    try {
      const res = await api.downloadFile(file.id, file.originalName);
      showToast({
        type: res.integrityVerified ? 'success' : 'warning',
        title: res.integrityVerified ? 'INTEGRITY VERIFIED' : 'DOWNLOAD COMPLETED',
        message: `SHA-256 fingerprint verified: ${file.originalName}`,
      });
      onRefresh();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'DOWNLOAD FAILED',
        message: err.message,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenDrawer = (file: VaultFile) => {
    setDrawerFile(file);
    setDrawerTab('overview');
  };

  const handleCloseDrawer = () => {
    setDrawerFile(null);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to permanently erase this encrypted file from storage?')) {
      return;
    }
    try {
      await api.deleteFile(fileId);
      showToast({
        type: 'warning',
        title: 'FILE PURGED',
        message: 'Encrypted object deleted from vault repository.',
      });
      handleCloseDrawer();
      onRefresh();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'DELETION FAILED',
        message: err.message,
      });
    }
  };

  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerFile || !targetEmail.trim()) return;

    try {
      await api.addPermission(drawerFile.id, targetEmail.trim(), selectedRole);
      showToast({
        type: 'success',
        title: 'ACCESS GRANTED',
        message: `${targetEmail} assigned role ${selectedRole}.`,
      });
      setTargetEmail('');
      onRefresh();
      // Update local drawer state
      const updatedFiles = await api.getFiles();
      const updated = updatedFiles.find((f) => f.id === drawerFile.id);
      if (updated) setDrawerFile(updated);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'PERMISSION ERROR',
        message: err.message,
      });
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    if (!drawerFile) return;
    try {
      await api.revokePermission(permissionId);
      showToast({
        type: 'info',
        title: 'PERMISSION REVOKED',
        message: 'RBAC rule revoked from access matrix.',
      });
      onRefresh();
      const updatedFiles = await api.getFiles();
      const updated = updatedFiles.find((f) => f.id === drawerFile.id);
      if (updated) setDrawerFile(updated);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'REVOCATION FAILED',
        message: err.message,
      });
    }
  };

  const handleCreateShareLink = async () => {
    if (!drawerFile) return;
    try {
      const res = await api.createShareLink(drawerFile.id, 'VIEWER', shareExpiryHours);
      const url = `${window.location.origin}/?share=${res.shareLink.token}`;
      navigator.clipboard.writeText(url);
      setCopiedLinkToken(res.shareLink.token);
      showToast({
        type: 'success',
        title: 'SHARE LINK GENERATED',
        message: 'Time-bound cryptographic link copied to clipboard.',
      });
      onRefresh();
      const updatedFiles = await api.getFiles();
      const updated = updatedFiles.find((f) => f.id === drawerFile.id);
      if (updated) setDrawerFile(updated);
      setTimeout(() => setCopiedLinkToken(null), 3000);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'LINK GENERATION FAILED',
        message: err.message,
      });
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-start">
      <div className="w-full max-w-[1720px] mx-auto space-y-6 animate-hero-entrance">
        {/* Header and Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
              <Lock className="w-3.5 h-3.5 text-white/70" />
              <span>02 ENCRYPTED VAULT REPOSITORY</span>
            </div>
            <h1 className="font-sans-main text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Encrypted Objects
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {!isDemoActive && files.length === 0 && (
              <Button
                variant="outline"
                size="md"
                leftIcon={<Play className="w-4 h-4" />}
                onClick={onSeedDemo}
              >
                Load Security Demo
              </Button>
            )}

            {isDemoActive && (
              <Button
                variant="outline"
                size="md"
                leftIcon={<RotateCcw className="w-4 h-4 text-amber-400" />}
                onClick={onResetDemo}
              >
                Reset Demo
              </Button>
            )}

            <Button
              id="btn-open-upload-modal"
              variant="primary"
              size="md"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={onOpenFileUpload}
            >
              Upload &amp; Encrypt
            </Button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-8">
            <SearchInput
              id="vault-search-input"
              placeholder="Search by file name, owner, or SHA-256 fingerprint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>

          <div className="md:col-span-4 flex gap-1 p-1 glass-toolbar rounded-[3px]">
            <button
              type="button"
              onClick={() => setRoleFilter('ALL')}
              className={`flex-1 py-2 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] ${
                roleFilter === 'ALL'
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              ALL ({safeFiles.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('OWNER')}
              className={`flex-1 py-2 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] ${
                roleFilter === 'OWNER'
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              OWNED
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('SHARED')}
              className={`flex-1 py-2 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] ${
                roleFilter === 'SHARED'
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              SHARED
            </button>
          </div>
        </div>

        {/* Dense Workstation File Table (Click opens right drawer) */}
        <div className="glass-panel rounded-[3px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-tech text-xs sm:text-sm">
              <thead className="bg-white/[0.04] border-b border-white/10 text-xs tracking-[0.16em] uppercase text-white/50 select-none">
                <tr>
                  <th className="py-3.5 px-5">OBJECT NAME</th>
                  <th className="py-3.5 px-5">SIZE</th>
                  <th className="py-3.5 px-5">CIPHER</th>
                  <th className="py-3.5 px-5">INTEGRITY</th>
                  <th className="py-3.5 px-5">ROLE</th>
                  <th className="py-3.5 px-5">OWNER</th>
                  <th className="py-3.5 px-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-white/40 text-sm">
                      [ ZERO ENCRYPTED OBJECTS FOUND ]
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => {
                    const isOwned =
                      file.ownerEmail.toLowerCase() === currentUserEmail.toLowerCase();
                    const isDownloading = downloadingId === file.id;

                    return (
                      <tr
                        key={file.id}
                        onClick={() => handleOpenDrawer(file)}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5 flex items-center gap-3">
                          {getFileIcon(file.mimeType, file.originalName)}
                          <span className="font-sans-main text-sm text-white font-medium group-hover:text-white transition-colors truncate max-w-[320px]">
                            {file.originalName}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-white/60 whitespace-nowrap">
                          {(file.size / 1024).toFixed(1)} KB
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <CryptoBadge label="AES-256-GCM" />
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <IntegrityBadge status="VERIFIED" />
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <RoleBadge role={file.userRole || (isOwned ? 'OWNER' : 'VIEWER')} />
                        </td>
                        <td className="py-3.5 px-5 text-white/50 truncate max-w-[180px]">
                          {file.ownerEmail}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div
                            className="inline-flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => handleQuickDownload(file, e)}
                              disabled={isDownloading}
                              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-[2px] transition-colors border border-transparent hover:border-white/20"
                              title="Download & Verify SHA-256"
                            >
                              {isDownloading ? (
                                <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin block" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(file)}
                              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-[2px] transition-colors border border-transparent hover:border-white/20"
                              title="Inspect Object & Permissions"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contextual Right-Side Inspector Drawer */}
      <Drawer
        isOpen={!!drawerFile}
        onClose={handleCloseDrawer}
        title={drawerFile?.originalName || 'Encrypted Object'}
        eyebrow="CRYPTOGRAPHIC OBJECT INSPECTION"
        subtitle={`Object ID: ${drawerFile?.id}`}
        width="lg"
      >
        {drawerFile && (
          <div className="space-y-6">
            {/* Drawer Tab Switcher */}
            <div className="flex border-b border-white/10 gap-1 pb-1">
              <button
                onClick={() => setDrawerTab('overview')}
                className={`py-1.5 px-3 font-mono-tech text-[10.5px] uppercase tracking-wider rounded-[2px] ${
                  drawerTab === 'overview'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Envelope &amp; Digest
              </button>
              <button
                onClick={() => setDrawerTab('permissions')}
                className={`py-1.5 px-3 font-mono-tech text-[10.5px] uppercase tracking-wider rounded-[2px] ${
                  drawerTab === 'permissions'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Permissions ({drawerFile.permissions?.length || 0})
              </button>
              <button
                onClick={() => setDrawerTab('share')}
                className={`py-1.5 px-3 font-mono-tech text-[10.5px] uppercase tracking-wider rounded-[2px] ${
                  drawerTab === 'share'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Secure Links ({drawerFile.shareLinks?.length || 0})
              </button>
            </div>

            {/* Tab 1: Overview & Cryptographic Envelope */}
            {drawerTab === 'overview' && (
              <div className="space-y-4 font-mono-tech text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-0.5">
                    <div className="text-[9.5px] text-white/40 uppercase">ALGORITHM</div>
                    <div className="font-bold text-white">AES-256-GCM</div>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-0.5">
                    <div className="text-[9.5px] text-white/40 uppercase">ENCRYPTED SIZE</div>
                    <div className="font-bold text-white">
                      {(drawerFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
                  <div className="text-[9.5px] text-white/40 uppercase">
                    AUTHENTICATED SHA-256 DIGEST
                  </div>
                  <div className="text-[11px] text-emerald-300 break-all font-mono">
                    {drawerFile.sha256Hash}
                  </div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
                  <div className="text-[9.5px] text-white/40 uppercase">INITIALIZATION VECTOR (IV)</div>
                  <div className="text-[11px] text-sky-300 break-all font-mono">
                    {drawerFile.ivHex}
                  </div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
                  <div className="text-[9.5px] text-white/40 uppercase">
                    GCM 128-BIT AUTHENTICATION TAG
                  </div>
                  <div className="text-[11px] text-amber-300 break-all font-mono">
                    {drawerFile.authTagHex}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={(e) => handleQuickDownload(drawerFile, e)}
                  >
                    Download &amp; Verify
                  </Button>

                  {(drawerFile.ownerEmail.toLowerCase() === currentUserEmail.toLowerCase() ||
                    drawerFile.userRole === 'OWNER') && (
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => handleDeleteFile(drawerFile.id)}
                    >
                      Delete Object
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: RBAC Permissions */}
            {drawerTab === 'permissions' && (
              <div className="space-y-4">
                <form onSubmit={handleAddPermission} className="space-y-3 p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px]">
                  <div className="font-mono-tech text-[10px] text-white/50 uppercase tracking-wider">
                    Grant Direct RBAC Access
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-8">
                      <Input
                        placeholder="user@organization.internal"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                        options={[
                          { value: 'VIEWER', label: 'VIEWER' },
                          { value: 'EDITOR', label: 'EDITOR' },
                          { value: 'OWNER', label: 'OWNER' },
                        ]}
                      />
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" type="submit" leftIcon={<UserPlus className="w-3 h-3" />}>
                    Add Permission Rule
                  </Button>
                </form>

                <div className="divide-y divide-white/5 font-mono-tech text-xs">
                  {drawerFile.permissions?.map((perm) => (
                    <div key={perm.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-medium">{perm.userEmail}</div>
                        <div className="text-white/40 text-[10px]">
                          Granted: {new Date(perm.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RoleBadge role={perm.role} />
                        <button
                          onClick={() => handleRevokePermission(perm.id)}
                          className="text-white/40 hover:text-red-400 p-1"
                          title="Revoke Permission"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Secure Share Links */}
            {drawerTab === 'share' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-3">
                  <div className="font-mono-tech text-[10px] text-white/50 uppercase tracking-wider">
                    Create Cryptographic Share Token
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select
                        label="EXPIRATION BOUND"
                        value={shareExpiryHours}
                        onChange={(e) => setShareExpiryHours(Number(e.target.value))}
                        options={[
                          { value: '1', label: '1 Hour' },
                          { value: '12', label: '12 Hours' },
                          { value: '24', label: '24 Hours (Standard)' },
                          { value: '72', label: '3 Days' },
                          { value: '168', label: '7 Days' },
                        ]}
                      />
                    </div>
                    <div className="pt-5">
                      <Button variant="primary" size="sm" leftIcon={<Share2 className="w-3 h-3" />} onClick={handleCreateShareLink}>
                        Generate &amp; Copy Link
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-white/5 font-mono-tech text-xs">
                  {drawerFile.shareLinks?.map((share) => (
                    <div key={share.id} className="py-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 font-mono text-[11px]">
                          Token: {share.token.substring(0, 12)}...
                        </span>
                        {share.revoked ? (
                          <span className="text-red-400 text-[10px]">[REVOKED]</span>
                        ) : (
                          <span className="text-emerald-400 text-[10px]">[ACTIVE]</span>
                        )}
                      </div>
                      <div className="text-white/40 text-[10px] flex items-center justify-between">
                        <span>Access count: {share.accessCount}</span>
                        <span>Expires: {share.expiresAt ? new Date(share.expiresAt).toLocaleString() : 'Never'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
