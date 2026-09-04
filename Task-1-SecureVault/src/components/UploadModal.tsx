import React, { useState, useRef } from 'react';
import { X, Upload, Shield, Lock, FileCode, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { VaultFile } from '../types';
import { Button } from './ui/Button';
import { CryptoBadge, IntegrityBadge } from './ui/Badges';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: VaultFile) => void;
}

type UploadStep = 'IDLE' | 'HASHING' | 'ENCRYPTING' | 'STORING' | 'VERIFYING' | 'COMPLETE' | 'ERROR';

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<UploadStep>('IDLE');
  const [clientSha256, setClientSha256] = useState<string>('');
  const [uploadedResult, setUploadedResult] = useState<VaultFile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const calculateClientSha256 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setStep('HASHING');

    try {
      const hash = await calculateClientSha256(file);
      setClientSha256(hash);
      setStep('IDLE');
    } catch (err: any) {
      setErrorMessage('Failed to compute client-side SHA-256: ' + err.message);
      setStep('ERROR');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteUpload = async () => {
    if (!selectedFile) return;
    setErrorMessage(null);
    setStep('ENCRYPTING');

    try {
      const res = await api.uploadFile(selectedFile);
      setUploadedResult(res.file);
      setStep('VERIFYING');

      if (clientSha256 && res.file.sha256Hash !== clientSha256) {
        throw new Error('Integrity mismatch: Server hash does not match pre-upload hash!');
      }

      setStep('COMPLETE');
      onUploadSuccess(res.file);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload & encryption failed');
      setStep('ERROR');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setClientSha256('');
    setUploadedResult(null);
    setErrorMessage(null);
    setStep('IDLE');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-[520px] h-full bg-[#05070c]/90 backdrop-blur-xl border-l border-white/15 shadow-2xl flex flex-col justify-between p-6 sm:p-8 z-10 animate-slideInRight text-white overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div>
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
                CRYPTOGRAPHIC INGESTION PIPELINE
              </div>
              <h2 className="font-sans-main text-xl font-normal text-white mt-0.5">
                Upload &amp; Encrypt Document
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-[2px] transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mb-6 grid grid-cols-4 gap-1.5 font-mono-tech text-[9px] uppercase tracking-wider text-center">
            <div
              className={`p-1.5 border rounded-[2px] ${
                step === 'HASHING' || clientSha256
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 text-white/30'
              }`}
            >
              1. HASH
            </div>
            <div
              className={`p-1.5 border rounded-[2px] ${
                step === 'ENCRYPTING' || step === 'VERIFYING' || step === 'COMPLETE'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 text-white/30'
              }`}
            >
              2. ENCRYPT
            </div>
            <div
              className={`p-1.5 border rounded-[2px] ${
                step === 'VERIFYING' || step === 'COMPLETE'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 text-white/30'
              }`}
            >
              3. STORE
            </div>
            <div
              className={`p-1.5 border rounded-[2px] ${
                step === 'COMPLETE'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 text-white/30'
              }`}
            >
              4. VERIFY
            </div>
          </div>

          {/* Drag & Drop Zone */}
          {step !== 'COMPLETE' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border border-dashed rounded-[2px] text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-white bg-white/10'
                  : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-6 h-6 text-white/60 mx-auto mb-2" />
              <div className="font-mono-tech text-xs text-white tracking-wider uppercase">
                {selectedFile ? selectedFile.name : 'Select or drag file to encrypt'}
              </div>
              <div className="font-mono-tech text-[10px] text-white/40 mt-1">
                Limit: 50MB // Client-side pre-hash calculation
              </div>
            </div>
          )}

          {/* File Pre-computation Details */}
          {selectedFile && step !== 'COMPLETE' && (
            <div className="mt-5 space-y-3 font-mono-tech text-xs">
              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
                <div className="text-[9.5px] text-white/40 uppercase">FILE SIZE &amp; TYPE</div>
                <div className="text-white">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'binary/stream'}
                </div>
              </div>

              {clientSha256 && (
                <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
                  <div className="text-[9.5px] text-white/40 uppercase">
                    CLIENT PRE-ENCRYPTION SHA-256 DIGEST
                  </div>
                  <div className="text-[10.5px] text-emerald-300 font-mono break-all">
                    {clientSha256}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-950/30 border border-red-500/40 rounded-[2px] font-mono-tech text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Complete View */}
          {step === 'COMPLETE' && uploadedResult && (
            <div className="space-y-4 font-mono-tech text-xs animate-fadeIn">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/35 rounded-[2px] text-emerald-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-bold">ENCRYPTION &amp; INGESTION VERIFIED</div>
                  <div className="font-sans-main text-[11px] text-emerald-300/80 mt-0.5">
                    AES-256-GCM ciphertext persisted with verified SHA-256 digest.
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
                <div className="text-[9.5px] text-white/40 uppercase">STORED OBJECT ID</div>
                <div className="text-white text-xs">{uploadedResult.id}</div>
              </div>

              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px] space-y-1">
                <div className="text-[9.5px] text-white/40 uppercase">GCM AUTHENTICATION TAG</div>
                <div className="text-[11px] text-amber-300 font-mono break-all">
                  {uploadedResult.authTagHex}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-3">
          {step === 'COMPLETE' ? (
            <>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Upload Another
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Done &amp; Return to Vault
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleExecuteUpload}
                disabled={!selectedFile || step === 'HASHING' || step === 'ENCRYPTING'}
                isLoading={step === 'ENCRYPTING' || step === 'VERIFYING'}
              >
                {step === 'ENCRYPTING'
                  ? 'ENCRYPTING AES-256-GCM...'
                  : step === 'VERIFYING'
                  ? 'VERIFYING DIGEST...'
                  : 'ENCRYPT &amp; STORE'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
