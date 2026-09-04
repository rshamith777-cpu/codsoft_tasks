import React, { useState, useEffect } from 'react';
import {
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { ShareLink, VaultFile } from '../types';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { RoleBadge } from './ui/Badges';
import { SearchInput } from './ui/Input';
import { useToast } from './ui/Toast';

interface SecureSharesViewProps {
  files?: VaultFile[];
  onRefresh: () => void;
  currentUserEmail?: string;
}

export const SecureSharesView: React.FC<SecureSharesViewProps> = ({
  files = [],
  onRefresh,
}) => {
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShare, setSelectedShare] = useState<ShareLink | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchShares = async () => {
    setLoading(true);
    try {
      const data = await api.getAllShares();
      const safeData = data ?? [];
      setShares(safeData);
      if (safeData.length > 0 && !selectedShare) {
        setSelectedShare(safeData[0]);
      }
    } catch (err: any) {
      console.error('Failed to load shares:', err);
      setShares([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/?share=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showToast({
      type: 'success',
      title: 'SHARE LINK COPIED',
      message: 'Cryptographically bound link copied to clipboard.',
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to revoke this secure share link? Access will be terminated immediately.')) {
      return;
    }
    try {
      await api.revokeShareLink(shareId);
      showToast({
        type: 'warning',
        title: 'SHARE REVOKED',
        message: 'Share token has been invalidated in immutable audit records.',
      });
      fetchShares();
      onRefresh();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'REVOCATION FAILED',
        message: err.message,
      });
    }
  };

  const now = Date.now();
  const safeShares = shares ?? [];

  const filteredShares = safeShares.filter((share) => {
    if (!share) return false;
    const isExpired = share.expiresAt && new Date(share.expiresAt).getTime() <= now;
    const isRevoked = share.revoked;
    const isActive = !isRevoked && !isExpired;

    if (filterState === 'ACTIVE' && !isActive) return false;
    if (filterState === 'EXPIRED' && (!isExpired || isRevoked)) return false;
    if (filterState === 'REVOKED' && !isRevoked) return false;

    const sTerm = (searchTerm || '').toLowerCase();
    const fName = (share.fileName || '').toLowerCase();
    const token = (share.token || '').toLowerCase();
    const owner = (share.ownerEmail || '').toLowerCase();

    return fName.includes(sTerm) || token.includes(sTerm) || owner.includes(sTerm);
  });

  return (
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-start">
      <div className="w-full max-w-[1720px] mx-auto space-y-6 animate-hero-entrance">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
              <Share2 className="w-3.5 h-3.5 text-white/70" />
              <span>04 SECURE SHARES &amp; TOKEN BOUNDS</span>
            </div>
            <h1 className="font-sans-main text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Active &amp; Expired Share Links
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3 h-3" />}
              onClick={() => {
                fetchShares();
                onRefresh();
              }}
            >
              Sync Shares
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7">
            <SearchInput
              placeholder="Search by file name, owner, or token prefix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>

          <div className="md:col-span-5 flex gap-1 p-1 glass-toolbar rounded-[3px]">
            {(['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'] as const).map((filter) => {
              const count = safeShares.filter((s) => {
                if (!s) return false;
                const exp = s.expiresAt && new Date(s.expiresAt).getTime() <= now;
                if (filter === 'ACTIVE') return !s.revoked && !exp;
                if (filter === 'EXPIRED') return exp && !s.revoked;
                if (filter === 'REVOKED') return s.revoked;
                return true;
              }).length;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setFilterState(filter)}
                  className={`flex-1 py-2 font-mono-tech text-xs uppercase tracking-wider transition-colors rounded-[2px] ${
                    filterState === filter
                      ? 'bg-white text-black font-semibold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Asymmetric View: Shares List & Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
          {/* Column 1: Shares List */}
          <div className="glass-panel rounded-[3px] divide-y divide-white/5 max-h-[580px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center font-mono-tech text-xs text-white/40">
                [ LOADING SHARE TOKENS... ]
              </div>
            ) : filteredShares.length === 0 ? (
              <div className="p-8 text-center font-mono-tech text-xs text-white/40">
                [ ZERO SHARES FOUND FOR FILTER ]
              </div>
            ) : (
              filteredShares.map((share) => {
                const isExpired = share.expiresAt && new Date(share.expiresAt).getTime() <= now;
                const isSelected = selectedShare?.id === share.id;

                return (
                  <button
                    key={share.id}
                    type="button"
                    onClick={() => setSelectedShare(share)}
                    className={`w-full text-left p-4 flex flex-col gap-2.5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-white/[0.08] border-l-2 border-white' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-sans-main text-sm sm:text-base text-white font-medium truncate">
                        {share.fileName || 'Protected Object'}
                      </span>
                      <RoleBadge role={share.role || 'VIEWER'} />
                    </div>

                    <div className="flex items-center justify-between font-mono-tech text-xs text-white/50">
                      <span>Token: {(share.token || '').substring(0, 12)}...</span>
                      <span>
                        Access: {share.accessCount ?? 0}
                        {share.maxAccessCount ? `/${share.maxAccessCount}` : ' (unlimited)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono-tech text-xs">
                      {share.revoked ? (
                        <span className="text-red-400 flex items-center gap-1 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> REVOKED
                        </span>
                      ) : isExpired ? (
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" /> EXPIRED
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                        </span>
                      )}

                      <span className="text-white/50">
                        {share.expiresAt
                          ? `Expires: ${new Date(share.expiresAt).toLocaleDateString()}`
                          : 'No expiry'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Column 2: Selected Share Detail Inspector */}
          {selectedShare ? (
            <div className="glass-panel rounded-[3px] p-6 space-y-6 text-white font-mono-tech">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">
                    SELECTED SHARE DETAILS
                  </div>
                  <h2 className="font-sans-main text-xl font-medium text-white mt-1">
                    {selectedShare.fileName || 'Protected Object'}
                  </h2>
                </div>

                <RoleBadge role={selectedShare.role || 'VIEWER'} />
              </div>

              {/* Status and Expiry Block */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] space-y-1.5">
                  <div className="text-xs text-white/50 uppercase">STATUS</div>
                  <div className="text-base font-semibold">
                    {selectedShare.revoked ? (
                      <span className="text-red-400">REVOKED</span>
                    ) : selectedShare.expiresAt && new Date(selectedShare.expiresAt).getTime() <= now ? (
                      <span className="text-amber-400">EXPIRED</span>
                    ) : (
                      <span className="text-emerald-400">ACTIVE &amp; ACCESSIBLE</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[3px] space-y-1.5">
                  <div className="text-xs text-white/50 uppercase">ACCESS COUNT</div>
                  <div className="text-base font-semibold">
                    {selectedShare.accessCount ?? 0}
                    {selectedShare.maxAccessCount ? ` of ${selectedShare.maxAccessCount} max` : ' (no limit)'}
                  </div>
                </div>
              </div>

              {/* Share URL Section */}
              <div className="space-y-2 pt-2">
                <div className="text-xs text-white/60 uppercase tracking-wider font-medium">
                  CRYPTOGRAPHIC SHARE URL
                </div>
                <div className="flex items-center gap-2 p-3 bg-black/60 border border-white/10 rounded-[3px]">
                  <span className="text-white/80 text-xs sm:text-sm truncate flex-1 font-mono">
                    {window.location.origin}/?share={selectedShare.token}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedShare.token)}
                    className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.18] text-white rounded-[2px] text-xs tracking-wider uppercase transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    {copiedToken === selectedShare.token ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken === selectedShare.token ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* Security Boundary Notes */}
              <div className="p-4 border border-white/10 bg-white/[0.02] rounded-[3px] text-xs sm:text-sm text-white/70 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Enforced Share Security Policy:</span>
                </div>
                <div className="leading-relaxed">
                  Recipient accesses the file via deterministic zero-trust token check. Server validates expiry and revocation state prior to performing authenticated AES-256-GCM decryption.
                </div>
              </div>

              {/* Revocation Action */}
              {!selectedShare.revoked && (
                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <Button
                    variant="danger"
                    size="md"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => handleRevokeShare(selectedShare.id)}
                  >
                    Revoke Share Immediately
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center glass-panel rounded-[2px] font-mono-tech text-white/40">
              [ SELECT A SHARE LINK TO INSPECT ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
