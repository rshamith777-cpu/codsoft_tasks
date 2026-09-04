import React, { useState, useRef } from 'react';
import { X, Upload, Shield, Lock, FileCode, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { VaultFile } from '../types';

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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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
      // Step: Encryption on server
      const res = await api.uploadFile(selectedFile);
      setUploadedResult(res.file);
      setStep('VERIFYING');

      // Verify client and server hash match
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
    <div
      id="upload-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div
        id="upload-modal-dialog"
        className="w-full max-w-xl bg-[#0a0a0c] border border-white/20 p-6 sm:p-8 shadow-2xl relative"
        style={{ borderRadius: '8px' }}
      >
        {/* Close Button */}
        <button
          id="btn-close-upload-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-colors"
          aria-label="Close upload modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-white/70" />
            <span className="font-mono-tech text-[10px] text-white/40 tracking-widest uppercase">
              SECURE ENCRYPTED INGESTION
            </span>
          </div>
          <h2 id="upload-modal-title" className="text-xl font-medium tracking-tight text-white">
            Upload & Encrypt File
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Payload is hashed with SHA-256 and encrypted with AES-256-GCM prior to storage.
          </p>
        </div>

        {/* State Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 border border-red-500/40 bg-red-500/10 text-red-300 font-mono-tech text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload State Pipeline */}
        {step === 'COMPLETE' && uploadedResult ? (
          <div className="space-y-5">
            <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-mono-tech text-xs font-semibold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                ENCRYPTED & STORED SECURELY
              </div>
              <div className="text-xs text-white/80 font-mono-tech">
                File: <span className="text-white font-medium">{uploadedResult.originalName}</span>
              </div>
              <div className="text-xs text-white/80 font-mono-tech">
                Cipher: <span className="text-white font-medium">AES-256-GCM (128-bit Auth Tag)</span>
              </div>
              <div className="text-xs text-white/80 font-mono-tech break-all">
                SHA-256: <span className="text-emerald-300 font-mono-tech">{uploadedResult.sha256Hash}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono-tech text-xs tracking-widest uppercase transition-colors"
              >
                UPLOAD ANOTHER FILE
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase transition-colors"
              >
                RETURN TO VAULT
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* File Dropzone */}
            {!selectedFile ? (
              <div
                id="file-dropzone"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-white bg-white/10'
                    : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-white/40 mb-3" />
                <div className="font-mono-tech text-xs text-white font-medium tracking-wider mb-1">
                  DROP FILE TO ENCRYPT OR CLICK TO SELECT
                </div>
                <div className="font-mono-tech text-[10px] text-white/40 uppercase">
                  ANY FILE TYPE • UP TO 50 MB • ZERO PLAINTEXT PERSISTENCE
                </div>
              </div>
            ) : (
              /* Selected File Cryptographic Staging Box */
              <div className="p-4 border border-white/15 bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-white/80" />
                    <span className="font-mono-tech text-xs text-white font-medium truncate max-w-[280px]">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="font-mono-tech text-[10px] text-white/40 hover:text-white uppercase tracking-wider"
                  >
                    [ CHANGE FILE ]
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-tech pt-2 border-t border-white/10">
                  <div>
                    <span className="text-white/40">FILE SIZE:</span>{' '}
                    <span className="text-white">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div>
                    <span className="text-white/40">ENCRYPTION:</span>{' '}
                    <span className="text-white">AES-256-GCM</span>
                  </div>
                </div>

                {clientSha256 && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="font-mono-tech text-[10px] text-white/40 uppercase mb-1">
                      CLIENT COMPUTED SHA-256 FINGERPRINT:
                    </div>
                    <div className="font-mono-tech text-[10px] text-emerald-400 break-all p-2 bg-black/60 border border-white/10">
                      {clientSha256}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cryptographic Execution Stages Indicator */}
            <div className="p-3 border border-white/10 bg-black/40 text-[11px] font-mono-tech space-y-1.5">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                CRYPTOGRAPHIC PIPELINE STAGES:
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">1. Client SHA-256 Hash</span>
                <span className={clientSha256 ? 'text-emerald-400' : 'text-white/30'}>
                  {clientSha256 ? 'CALCULATED' : 'WAITING'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">2. AES-256-GCM Encryption</span>
                <span
                  className={
                    step === 'ENCRYPTING'
                      ? 'text-amber-400 animate-pulse'
                      : step === 'STORING' || step === 'VERIFYING' || step === 'COMPLETE'
                      ? 'text-emerald-400'
                      : 'text-white/30'
                  }
                >
                  {step === 'ENCRYPTING'
                    ? 'ENCRYPTING...'
                    : step === 'STORING' || step === 'VERIFYING' || step === 'COMPLETE'
                    ? 'AUTHENTICATED'
                    : 'READY'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">3. Immutable Audit Log</span>
                <span className={step === 'COMPLETE' ? 'text-emerald-400' : 'text-white/30'}>
                  {step === 'COMPLETE' ? 'RECORDED' : 'PENDING'}
                </span>
              </div>
            </div>

            {/* Ingestion Trigger Button */}
            {selectedFile && step !== 'COMPLETE' && (
              <button
                id="btn-execute-encrypt-upload"
                onClick={handleExecuteUpload}
                disabled={step === 'ENCRYPTING' || step === 'STORING' || step === 'VERIFYING'}
                className="w-full py-3 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {step === 'ENCRYPTING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ENCRYPTING WITH AES-256-GCM...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>ENCRYPT & SECURE STORE IN VAULT</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
