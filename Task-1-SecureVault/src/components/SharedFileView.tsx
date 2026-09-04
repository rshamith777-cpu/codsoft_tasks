import React, { useState, useEffect } from 'react';
import { Shield, Lock, Download, CheckCircle2, AlertTriangle, FileText, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

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
        setVerificationSuccess(`AUTHENTICATED & VERIFIED: SHA-256 checksum matched registered fingerprint.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Download & decryption failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-transparent text-white">
      <div className="w-full max-w-xl bg-[#08080a]/80 backdrop-blur-xl border border-white/20 p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white/70" />
            <span className="font-mono-tech text-xs tracking-widest text-white uppercase font-bold">
              SECURE SHARED REPOSITORY
            </span>
          </div>
          <button
            onClick={onReturnToHome}
            className="flex items-center gap-1 font-mono-tech text-xs text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>VAULT PORTAL</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center font-mono-tech text-xs text-white/50">
            AUTHENTICATING ACCESS TOKEN & RETRIEVING OBJECT SPECIFICATION...
          </div>
        ) : errorMsg ? (
          <div className="p-4 border border-red-500/40 bg-red-500/10 text-red-300 font-mono-tech text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <AlertTriangle className="w-4 h-4" />
              ACCESS DENIED OR EXPIRED LINK
            </div>
            <div>{errorMsg}</div>
          </div>
        ) : shareData ? (
          <div className="space-y-5">
            {verificationSuccess && (
              <div className="p-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono-tech text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{verificationSuccess}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[10px] font-mono-tech text-white/40 uppercase">ENCRYPTED OBJECT</div>
              <h2 className="text-xl font-mono-tech font-bold text-white break-words">
                {shareData.file.originalName}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 border border-white/15 bg-white/5 font-mono-tech text-xs">
              <div>
                <span className="text-white/40 text-[10px] uppercase block">OBJECT SIZE</span>
                <span className="text-white font-medium">{(shareData.file.size / 1024).toFixed(1)} KB</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] uppercase block">CIPHER</span>
                <span className="text-white font-medium">AES-256-GCM</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] uppercase block">GRANTED ROLE</span>
                <span className="text-blue-400 font-medium">{shareData.role}</span>
              </div>
              <div>
                <span className="text-white/40 text-[10px] uppercase block">SHARED BY</span>
                <span className="text-white font-medium">{shareData.file.ownerName || 'Vault User'}</span>
              </div>
            </div>

            {/* SHA-256 Hash Display */}
            <div className="p-3.5 border border-white/15 bg-black/60 space-y-1 font-mono-tech">
              <div className="text-[10px] text-white/40 uppercase">AUTHENTICATED SHA-256 FINGERPRINT:</div>
              <div className="text-xs text-emerald-400 break-all p-2 bg-black border border-white/10">
                {shareData.file.sha256Hash}
              </div>
            </div>

            {/* Expiration Note */}
            <div className="text-[11px] font-mono-tech text-white/50">
              {shareData.expiresAt ? (
                <span>Expires at: {new Date(shareData.expiresAt).toLocaleString()}</span>
              ) : (
                <span>Persistent link (subject to owner revocation)</span>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'DECRYPTING & VERIFYING SHA-256...' : 'DECRYPT & DOWNLOAD OBJECT'}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
