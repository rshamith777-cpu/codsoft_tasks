import React, { useState, useEffect } from 'react';
import { Shield, Lock, Download, CheckCircle2, AlertTriangle, FileText, ArrowLeft, Terminal } from 'lucide-react';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { CryptoBadge, IntegrityBadge, RoleBadge } from './ui/Badges';

interface SharedFileViewProps {
  token: string;
  onReturnToHome: () => void;
}

export const SharedFileView: React.FC<SharedFileViewProps> = ({ token, onReturnToHome }) => {
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadShareInfo();
  }, [token]);

  const loadShareInfo = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getSharedFileInfo(token);
      setShareData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to access shared object');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!shareData?.file) return;
    setDownloading(true);
    setErrorMsg(null);
    setVerificationSuccess(null);

    try {
      const res = await api.downloadSharedFile(token, shareData.file.originalName);
      if (res.integrityVerified) {
        setVerificationSuccess(`AUTHENTICATED & VERIFIED: Recalculated SHA-256 matches registered fingerprint.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Download & decryption failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-12 flex flex-col justify-center">
      <div className="w-full max-w-[1720px] mx-auto grid grid-cols-1 lg:grid-cols-[48%_52%] items-center gap-8">
        {/* Left: Atmospheric Negative Space */}
        <div className="hidden lg:flex flex-col justify-between h-full min-h-[380px] pointer-events-none select-none pr-8">
          <div>
            <div className="font-mono-tech text-[10px] tracking-[0.22em] text-white/40 uppercase">
              [ CRYPTOGRAPHIC LINK VERIFICATION ]
            </div>
            <div className="font-mono-tech text-[11px] text-white/25 mt-1">
              TOKEN: {token.substring(0, 16)}...
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono-tech text-[11px] tracking-[0.16em] text-white/80 uppercase">
                ZERO PLAINTEXT EXPOSURE
              </span>
            </div>
            <p className="font-mono-tech text-[11px] text-white/40 max-w-[340px] leading-relaxed">
              Decryption is authenticated via AES-256-GCM hardware primitives only after link boundary validation passes.
            </p>
          </div>
        </div>

        {/* Right: Shared File Access Surface */}
        <div className="w-full max-w-[560px] lg:ml-auto p-6 sm:p-8 bg-black/40 backdrop-blur-md border border-white/14 rounded-[2px] shadow-2xl space-y-6 animate-hero-entrance">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-white/80" />
              <span className="font-mono-tech text-xs tracking-widest text-white uppercase font-bold">
                SECURE SHARED OBJECT
              </span>
            </div>
            <button
              onClick={onReturnToHome}
              className="flex items-center gap-1.5 font-mono-tech text-[11px] text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN HOME</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center font-mono-tech text-xs text-white/40">
              [ AUTHENTICATING ACCESS TOKEN &amp; RETRIEVING OBJECT SPECIFICATION... ]
            </div>
          ) : errorMsg ? (
            <div className="p-4 border border-red-500/40 bg-red-500/10 text-red-300 font-mono-tech text-xs space-y-2 rounded-[2px]">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>ACCESS DENIED OR EXPIRED LINK</span>
              </div>
              <p className="font-sans-main text-[11px] text-red-200/80">{errorMsg}</p>
            </div>
          ) : shareData?.file ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="font-mono-tech text-[10px] text-white/40 uppercase tracking-wider">
                  AUTHENTICATED FILE OBJECT
                </div>
                <h2 className="font-sans-main text-2xl font-normal text-white">
                  {shareData.file.originalName}
                </h2>
                <div className="flex items-center gap-2 font-mono-tech text-[10.5px] text-white/50 pt-1">
                  <span>{(shareData.file.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>Owner: {shareData.file.ownerName || 'Encrypted Vault'}</span>
                </div>
              </div>

              {/* Cryptographic Envelope Details */}
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-2 font-mono-tech text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/40">CIPHER:</span>
                  <CryptoBadge label="AES-256-GCM" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">PERMITTED ROLE:</span>
                  <RoleBadge role={shareData.role} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/40">EXPIRES:</span>
                  <span className="text-white/70">
                    {shareData.expiresAt ? new Date(shareData.expiresAt).toLocaleString() : 'Permanent'}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[9.5px] text-white/40 uppercase">REGISTERED SHA-256</div>
                  <div className="text-[10px] text-emerald-300 break-all font-mono mt-0.5">
                    {shareData.file.sha256Hash}
                  </div>
                </div>
              </div>

              {verificationSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/35 rounded-[2px] font-mono-tech text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{verificationSuccess}</span>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
                isLoading={downloading}
              >
                {downloading ? 'DECRYPTING & VERIFYING...' : 'DECRYPT & DOWNLOAD SECURE FILE'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
