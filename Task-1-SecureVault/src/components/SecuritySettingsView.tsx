import React, { useState, useEffect } from 'react';
import { Settings, Shield, Lock, Clock, Check, AlertCircle, Save, KeyRound, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';
import { SecuritySettings } from '../types';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useToast } from './ui/Toast';

interface SecuritySettingsViewProps {
  onRefreshPosture: () => void;
}

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({ onRefreshPosture }) => {
  const [settings, setSettings] = useState<SecuritySettings>({
    sessionTimeoutMinutes: 60,
    passwordMinLength: 8,
    defaultShareExpiryHours: 24,
    enforceDownloadVerification: true,
    auditLoggingEnabled: true,
    rateLimitingEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSecuritySettings();
      if (data) setSettings(data);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'SETTINGS ERROR',
        message: err.message || 'Failed to load security policies.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = await api.updateSecuritySettings(settings);
      setSettings(updated);
      showToast({
        type: 'success',
        title: 'POLICIES UPDATED',
        message: 'Security configuration saved and audited.',
      });
      onRefreshPosture();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'UPDATE FAILED',
        message: err.message || 'Failed to save security settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-start">
      <div className="w-full max-w-[1720px] mx-auto space-y-6 animate-hero-entrance">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.18em] text-white/50 uppercase">
              <Settings className="w-3.5 h-3.5 text-white/70" />
              <span>08 SECURITY &amp; ACCOUNT CONFIGURATION</span>
            </div>
            <h1 className="font-sans-main text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1">
              Security Policies &amp; Thresholds
            </h1>
          </div>
        </div>

        {/* Asymmetric 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
          {/* Left Column: Negative Space & Security Context */}
          <div className="space-y-4 font-mono-tech text-xs text-white/60">
            <div className="p-5 bg-black/40 backdrop-blur-md border border-white/12 rounded-[2px] space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold uppercase text-[11px] tracking-wider">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Policy Enforcement Engine</span>
              </div>
              <p className="font-sans-main text-xs text-white/60 leading-relaxed">
                Modifications to security thresholds alter server-side session lifetimes, share token limits, and cryptographic verification requirements across all users.
              </p>
              <div className="text-[10px] text-white/40 border-t border-white/10 pt-2">
                All policy modifications are written to the immutable audit stream as <span className="text-white/70">SETTING_CHANGE</span> events.
              </div>
            </div>

            <div className="p-4 border border-white/10 bg-white/[0.02] rounded-[2px] space-y-1 text-[10.5px]">
              <div className="font-bold text-white uppercase tracking-wider">
                ENCRYPTED ENCLAVE SECRET
              </div>
              <div className="text-white/40">
                Master vault secrets are held in hardware memory or environment variables and never surfaced via client API interfaces.
              </div>
            </div>
          </div>

          {/* Right Column: Settings Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Group 1: Session & Password Policies */}
            <div className="p-6 bg-black/40 backdrop-blur-md border border-white/12 rounded-[2px] space-y-5">
              <div className="font-mono-tech text-[10.5px] text-white/50 uppercase tracking-[0.16em] border-b border-white/10 pb-2">
                [ 01 // SESSION &amp; CREDENTIAL POLICIES ]
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-tech text-[10px] tracking-wider text-white/50 uppercase mb-1.5">
                    SESSION TIMEOUT (MINUTES)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.sessionTimeoutMinutes}
                    onChange={(e) =>
                      setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })
                    }
                    className="w-full bg-black/50 border border-white/15 focus:border-white/60 rounded-[2px] py-2 px-3 font-mono-tech text-xs text-white focus:outline-none"
                  />
                  <span className="font-mono-tech text-[9.5px] text-white/35 mt-1 block">
                    Range: 5 - 1440 minutes
                  </span>
                </div>

                <div>
                  <label className="block font-mono-tech text-[10px] tracking-wider text-white/50 uppercase mb-1.5">
                    PASSWORD MINIMUM LENGTH
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="64"
                    value={settings.passwordMinLength}
                    onChange={(e) =>
                      setSettings({ ...settings, passwordMinLength: Number(e.target.value) })
                    }
                    className="w-full bg-black/50 border border-white/15 focus:border-white/60 rounded-[2px] py-2 px-3 font-mono-tech text-xs text-white focus:outline-none"
                  />
                  <span className="font-mono-tech text-[9.5px] text-white/35 mt-1 block">
                    NIST recommendation: 8+ characters
                  </span>
                </div>
              </div>
            </div>

            {/* Group 2: Share Defaults */}
            <div className="p-6 bg-black/40 backdrop-blur-md border border-white/12 rounded-[2px] space-y-5">
              <div className="font-mono-tech text-[10.5px] text-white/50 uppercase tracking-[0.16em] border-b border-white/10 pb-2">
                [ 02 // CRYPTOGRAPHIC SHARE TOKEN BOUNDS ]
              </div>

              <div>
                <label className="block font-mono-tech text-[10px] tracking-wider text-white/50 uppercase mb-1.5">
                  DEFAULT SHARE EXPIRATION (HOURS)
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={settings.defaultShareExpiryHours}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultShareExpiryHours: Number(e.target.value) })
                  }
                  className="w-full bg-black/50 border border-white/15 focus:border-white/60 rounded-[2px] py-2 px-3 font-mono-tech text-xs text-white focus:outline-none"
                />
                <span className="font-mono-tech text-[9.5px] text-white/35 mt-1 block">
                  Automatic expiration applied when link creator does not specify custom bounds
                </span>
              </div>
            </div>

            {/* Group 3: Core Enforced Controls */}
            <div className="p-6 bg-black/40 backdrop-blur-md border border-white/12 rounded-[2px] space-y-4 font-mono-tech text-xs">
              <div className="text-[10.5px] text-white/50 uppercase tracking-[0.16em] border-b border-white/10 pb-2">
                [ 03 // ACTIVE SECURITY ENFORCEMENT CONTROLS ]
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.enforceDownloadVerification}
                    onChange={(e) =>
                      setSettings({ ...settings, enforceDownloadVerification: e.target.checked })
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-bold text-white">Enforce Download Integrity Verification</div>
                    <div className="font-sans-main text-white/50 text-[11px]">
                      Recompute SHA-256 hash prior to streaming decrypted file to recipient.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.auditLoggingEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, auditLoggingEnabled: e.target.checked })
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-bold text-white">Immutable Audit Logging Stream</div>
                    <div className="font-sans-main text-white/50 text-[11px]">
                      Record every authentication, encryption, download, and share operation.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.rateLimitingEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, rateLimitingEnabled: e.target.checked })
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-bold text-white">Rate Limiting &amp; Probe Protection</div>
                    <div className="font-sans-main text-white/50 text-[11px]">
                      Mitigate brute-force attacks and token probing on authentication endpoints.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Group 3: AI Security Copilot Engine */}
            <div className="p-6 bg-black/40 backdrop-blur-md border border-white/12 rounded-[2px] space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="font-mono-tech text-[10.5px] text-white/50 uppercase tracking-[0.16em] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>[ 03 // AI SECURITY COPILOT ENGINE ]</span>
                </div>
                <span
                  className={`px-2 py-0.5 font-mono-tech text-[9.5px] uppercase tracking-wider rounded-[2px] border ${
                    settings.geminiApiKey
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  }`}
                >
                  {settings.geminiApiKey ? 'GEMINI 2.0 CONFIGURED' : 'LOCAL TELEMETRY ACTIVE'}
                </span>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono-tech text-white/70">
                  Google Gemini API Key
                  <span className="text-white/40 block text-[11px] font-sans-main mt-0.5">
                    Optional. When blank, Copilot operates seamlessly via the built-in Local Telemetry Engine.
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={settings.geminiApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    placeholder="Enter Gemini API key (e.g. AIzaSy...)"
                    className="flex-1 px-3 py-2 bg-black/50 border border-white/15 rounded-[2px] text-white font-mono-tech text-xs placeholder:text-white/30 focus:outline-none focus:border-white/30"
                  />
                  {settings.geminiApiKey && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings({ ...settings, geminiApiKey: '' })}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="text-[11px] font-mono-tech text-white/45">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 underline underline-offset-2"
                  >
                    Generate a key at Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                type="submit"
                leftIcon={<Save className="w-3.5 h-3.5" />}
                isLoading={saving}
              >
                Save Security Policies
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
