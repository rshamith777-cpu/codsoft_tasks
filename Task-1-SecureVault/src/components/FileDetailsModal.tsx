import React, { useState } from 'react';
import {
  X,
  Shield,
  Lock,
  Download,
  Share2,
  Trash2,
  Copy,
  Check,
  Clock,
  UserPlus,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Link as LinkIcon,
} from 'lucide-react';
import { VaultFile, UserRole } from '../types';
import { api } from '../services/api';

interface FileDetailsModalProps {
  file: VaultFile | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  currentUserEmail: string;
}

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  file,
  isOpen,
  onClose,
  onRefresh,
  currentUserEmail,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'permissions' | 'share-links'>('details');
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('VIEWER');
  const [expiryHours, setExpiryHours] = useState(24);
  const [downloading, setDownloading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [copiedLinkToken, setCopiedLinkToken] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const isOwner = file.userRole === 'OWNER' || file.ownerEmail.toLowerCase() === currentUserEmail.toLowerCase();
  const canShare = isOwner || file.userRole === 'EDITOR';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setErrorMsg(null);
    setVerificationResult(null);

    try {
      const res = await api.downloadFile(file.id, file.originalName);
      if (res.integrityVerified) {
        setVerificationResult(`INTEGRITY VERIFIED: Recalculated SHA-256 matches registered fingerprint.`);
      } else {
        setErrorMsg('Integrity verification status could not be confirmed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete and erase "${file.originalName}" from the secure vault?`)) {
      return;
    }
    try {
      await api.deleteFile(file.id);
      onRefresh();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete file');
    }
  };

  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;
    setErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      await api.addPermission(file.id, targetEmail.trim(), selectedRole);
      setTargetEmail('');
      setActionSuccessMsg(`Permission granted: ${targetEmail} as ${selectedRole}.`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to grant permission');
    }
  };

  const handleRevokePermission = async (permId: string) => {
    try {
      await api.revokePermission(permId);
      setActionSuccessMsg('Permission revoked.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to revoke permission');
    }
  };

  const handleCreateShareLink = async () => {
    setErrorMsg(null);
    setActionSuccessMsg(null);
    try {
      const res = await api.createShareLink(file.id, selectedRole, expiryHours);
      setActionSuccessMsg(`Secure share link generated (Expires in ${expiryHours}h).`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate share link');
    }
  };

  const handleRevokeShareLink = async (shareId: string) => {
    try {
      await api.revokeShareLink(shareId);
      setActionSuccessMsg('Share link revoked.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to revoke link');
    }
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/?share=${token}`;
  };

  return (
    <div
      id="file-details-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-details-title"
    >
      <div
        id="file-details-dialog"
        className="w-full max-w-2xl bg-[#0a0a0c] border border-white/20 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: '8px' }}
      >
        {/* Close Button */}
        <button
          id="btn-close-file-details"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-colors"
          aria-label="Close details modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-white/70" />
            <span className="font-mono-tech text-[10px] text-white/40 tracking-widest uppercase">
              CRYPTOGRAPHIC OBJECT INSPECTOR
            </span>
          </div>
          <h2 id="file-details-title" className="text-xl font-medium tracking-tight text-white truncate max-w-[500px]">
            {file.originalName}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 border border-white/20 bg-white/5 font-mono-tech text-[10px] text-white">
              AES-256-GCM
            </span>
            <span className="px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 font-mono-tech text-[10px] text-emerald-400">
              SHA-256 VERIFIED
            </span>
            <span className="px-2 py-0.5 border border-blue-500/30 bg-blue-500/10 font-mono-tech text-[10px] text-blue-400">
              ROLE: {file.userRole || 'VIEWER'}
            </span>
          </div>
        </div>

        {/* Notifications */}
        {verificationResult && (
          <div className="mb-4 p-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono-tech text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{verificationResult}</span>
          </div>
        )}
        {actionSuccessMsg && (
          <div className="mb-4 p-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono-tech text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 border border-red-500/40 bg-red-500/10 text-red-300 font-mono-tech text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 border border-white/10 p-1 bg-white/5 mb-6">
          <button
            id="tab-details"
            onClick={() => setActiveTab('details')}
            className={`py-2 font-mono-tech text-xs tracking-wider uppercase transition-colors ${
              activeTab === 'details' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            METADATA & CIPHER
          </button>
          <button
            id="tab-permissions"
            onClick={() => setActiveTab('permissions')}
            className={`py-2 font-mono-tech text-xs tracking-wider uppercase transition-colors ${
              activeTab === 'permissions' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            RBAC PERMISSIONS ({file.permissions?.length || 0})
          </button>
          <button
            id="tab-shares"
            onClick={() => setActiveTab('share-links')}
            className={`py-2 font-mono-tech text-xs tracking-wider uppercase transition-colors ${
              activeTab === 'share-links' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            SECURE LINKS ({file.shareLinks?.filter((s) => !s.revoked).length || 0})
          </button>
        </div>

        {/* Tab: Details & Cryptographic Specs */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* File info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border border-white/15 bg-white/5 text-xs font-mono-tech">
              <div>
                <div className="text-white/40 text-[10px] uppercase">SIZE</div>
                <div className="text-white mt-0.5">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <div>
                <div className="text-white/40 text-[10px] uppercase">MIME TYPE</div>
                <div className="text-white mt-0.5 truncate">{file.mimeType}</div>
              </div>
              <div>
                <div className="text-white/40 text-[10px] uppercase">OWNER</div>
                <div className="text-white mt-0.5 truncate">{file.ownerEmail}</div>
              </div>
              <div>
                <div className="text-white/40 text-[10px] uppercase">MODIFIED</div>
                <div className="text-white mt-0.5">{new Date(file.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* SHA-256 Box */}
            <div className="p-4 border border-white/15 bg-black/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-[10px] text-white/50 uppercase tracking-widest">
                  SHA-256 INTEGRITY FINGERPRINT
                </span>
                <button
                  id="btn-copy-sha256"
                  onClick={() => copyToClipboard(file.sha256Hash)}
                  className="flex items-center gap-1 font-mono-tech text-[11px] text-white/80 hover:text-white"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'COPIED' : 'COPY HASH'}</span>
                </button>
              </div>
              <div className="font-mono-tech text-xs text-emerald-400 break-all p-2.5 bg-black border border-white/10">
                {file.sha256Hash}
              </div>
            </div>

            {/* AES-256-GCM Technical Details */}
            <div className="p-4 border border-white/10 bg-white/5 space-y-2 text-xs font-mono-tech">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                AUTHENTICATED CIPHER PARAMETERS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-white/40">ALGORITHM:</span> <span className="text-white">AES-256-GCM</span>
                </div>
                <div>
                  <span className="text-white/40">NONCE / IV (96-BIT):</span>{' '}
                  <span className="text-white truncate">{file.ivHex || 'Configured via Cipher'}</span>
                </div>
                <div>
                  <span className="text-white/40">AUTH TAG (128-BIT):</span>{' '}
                  <span className="text-white truncate">{file.authTagHex || 'Configured via Cipher'}</span>
                </div>
                <div>
                  <span className="text-white/40">STORAGE STATUS:</span>{' '}
                  <span className="text-emerald-400">ENCRYPTED AT REST</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-download-file-modal"
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-3 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'DECRYPTING & VERIFYING...' : 'DOWNLOAD & VERIFY INTEGRITY'}</span>
              </button>

              {isOwner && (
                <button
                  id="btn-delete-file-modal"
                  onClick={handleDelete}
                  className="py-3 px-4 border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 font-mono-tech text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>PURGE</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab: RBAC Permissions */}
        {activeTab === 'permissions' && (
          <div className="space-y-5">
            {canShare ? (
              <form onSubmit={handleAddPermission} className="p-4 border border-white/15 bg-white/5 space-y-3">
                <div className="text-[10px] font-mono-tech text-white/40 uppercase tracking-widest">
                  GRANT USER PERMISSION (RBAC)
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="colleague@example.com"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white"
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="px-3 py-2 bg-black border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white"
                  >
                    <option value="VIEWER">VIEWER (Read/Verify)</option>
                    <option value="EDITOR">EDITOR (Download/Share)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black hover:bg-white/90 font-mono-tech font-semibold text-xs tracking-wider uppercase"
                  >
                    GRANT
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono-tech text-xs">
                Only OWNER or EDITOR can modify access permissions.
              </div>
            )}

            {/* List of granted permissions */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono-tech text-white/40 uppercase tracking-widest">
                ACTIVE ACCESS GRANTS
              </div>
              <div className="p-3 border border-white/10 bg-white/5 flex items-center justify-between text-xs font-mono-tech">
                <div>
                  <span className="text-white font-medium">{file.ownerEmail}</span>
                  <span className="ml-2 text-white/40 text-[10px]">[OWNER / CREATOR]</span>
                </div>
                <span className="px-2 py-0.5 border border-white/20 bg-white/10 text-white text-[10px]">
                  FULL CONTROL
                </span>
              </div>

              {file.permissions && file.permissions.length > 0 ? (
                file.permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="p-3 border border-white/10 bg-white/5 flex items-center justify-between text-xs font-mono-tech"
                  >
                    <div>
                      <span className="text-white">{perm.userEmail}</span>
                      <span className="ml-2 px-1.5 py-0.5 border border-blue-500/30 text-blue-400 text-[10px]">
                        {perm.role}
                      </span>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRevokePermission(perm.id)}
                        className="text-red-400 hover:text-red-300 text-[11px] uppercase tracking-wider"
                      >
                        REVOKE
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 border border-dashed border-white/10 text-center font-mono-tech text-xs text-white/40">
                  No additional users granted direct access.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Secure Share Links */}
        {activeTab === 'share-links' && (
          <div className="space-y-5">
            {canShare ? (
              <div className="p-4 border border-white/15 bg-white/5 space-y-3">
                <div className="text-[10px] font-mono-tech text-white/40 uppercase tracking-widest">
                  GENERATE EXPIRING SECURE LINK
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono-tech text-white/40 uppercase mb-1">ROLE</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-black border border-white/20 text-white font-mono-tech text-xs"
                    >
                      <option value="VIEWER">VIEWER</option>
                      <option value="EDITOR">EDITOR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-tech text-white/40 uppercase mb-1">EXPIRATION</label>
                    <select
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-black border border-white/20 text-white font-mono-tech text-xs"
                    >
                      <option value={1}>1 HOUR</option>
                      <option value={24}>24 HOURS</option>
                      <option value={168}>7 DAYS</option>
                      <option value={0}>NO EXPIRY (MANUAL REVOKE)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreateShareLink}
                      className="w-full py-2 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase"
                    >
                      CREATE LINK
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono-tech text-xs">
                Only file OWNER can generate external share links.
              </div>
            )}

            {/* List of active share links */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono-tech text-white/40 uppercase tracking-widest">
                ACTIVE SECURE TOKENS
              </div>
              {file.shareLinks && file.shareLinks.filter((s) => !s.revoked).length > 0 ? (
                file.shareLinks
                  .filter((s) => !s.revoked)
                  .map((share) => {
                    const isExpired = share.expiresAt && new Date(share.expiresAt).getTime() < Date.now();
                    const shareUrl = getShareUrl(share.token);
                    return (
                      <div
                        key={share.id}
                        className={`p-3 border ${
                          isExpired ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'
                        } space-y-2 font-mono-tech text-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-3.5 h-3.5 text-white/60" />
                            <span className="text-white font-medium">{share.token.substring(0, 12)}...</span>
                            <span className="text-[10px] px-1.5 py-0.5 border border-white/20 text-white/80">
                              ROLE: {share.role}
                            </span>
                            {isExpired && (
                              <span className="text-[10px] px-1.5 py-0.5 border border-red-500/40 text-red-400">
                                EXPIRED
                              </span>
                            )}
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handleRevokeShareLink(share.id)}
                              className="text-red-400 hover:text-red-300 text-[11px] uppercase tracking-wider"
                            >
                              REVOKE
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5">
                          <span>
                            {share.expiresAt
                              ? `Expires: ${new Date(share.expiresAt).toLocaleString()}`
                              : 'No automatic expiration'}
                          </span>
                          <span>Accessed: {share.accessCount} times</span>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="flex-1 px-2 py-1 bg-black border border-white/15 text-white/70 text-[10px]"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(shareUrl);
                              setCopiedLinkToken(share.id);
                              setTimeout(() => setCopiedLinkToken(null), 2000);
                            }}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] tracking-wider uppercase"
                          >
                            {copiedLinkToken === share.id ? 'COPIED' : 'COPY'}
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="p-4 border border-dashed border-white/10 text-center font-mono-tech text-xs text-white/40">
                  No active share links.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
