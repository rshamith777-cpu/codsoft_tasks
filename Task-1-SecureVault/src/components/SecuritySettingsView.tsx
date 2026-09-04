import React, { useState, useEffect } from 'react';
import { Settings, Shield, Lock, Clock, Check, AlertCircle, Save } from 'lucide-react';
import { SecuritySettings } from '../types';
import { api } from '../services/api';

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSecuritySettings();
      if (data) setSettings(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const updated = await api.updateSecuritySettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      onRefreshPosture();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center font-mono-tech text-xs text-white/50">
        LOADING SECURITY CONFIGURATION...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-white/50 font-mono-tech text-[10px] tracking-widest uppercase">
            <Settings className="w-3.5 h-3.5 text-white/60" />
            SECURITY POLICY ADMINISTRATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-1">
            Security Controls & Policies
          </h1>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono-tech text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Security policies updated successfully and applied across server daemon.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 border border-red-500/40 bg-red-500/10 text-red-300 font-mono-tech text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="border border-white/15 bg-[#08080a]/75 backdrop-blur-md p-6 sm:p-8 space-y-6 font-mono-tech text-xs">
          {/* Section 1: Authentication Controls */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-white uppercase border-b border-white/10 pb-2">
              1. Authentication & Session Lifespan
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-xs mb-1.5">
                  Session Timeout Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Enforces automatic session termination on inactivity.
                </span>
              </div>

              <div>
                <label className="block text-white/70 text-xs mb-1.5">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  min="8"
                  max="32"
                  value={settings.passwordMinLength}
                  onChange={(e) =>
                    setSettings({ ...settings, passwordMinLength: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Enforced during registration and key derivations.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Sharing & Permissions */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="text-sm font-semibold text-white uppercase border-b border-white/10 pb-2">
              2. Share Link Policies
            </div>

            <div>
              <label className="block text-white/70 text-xs mb-1.5">
                Default Share Token Expiration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="720"
                value={settings.defaultShareExpiryHours}
                onChange={(e) =>
                  setSettings({ ...settings, defaultShareExpiryHours: Number(e.target.value) })
                }
                className="w-full max-w-xs px-3 py-2 bg-black/60 border border-white/20 text-white font-mono-tech text-xs focus:outline-none focus:border-white"
              />
              <span className="text-[10px] text-white/40 mt-1 block">
                Time-to-live automatically applied to generated external share links.
              </span>
            </div>
          </div>

          {/* Section 3: Cryptographic & Audit Enforcements */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="text-sm font-semibold text-white uppercase border-b border-white/10 pb-2">
              3. Verification & Telemetry Controls
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enforceDownloadVerification}
                  onChange={(e) =>
                    setSettings({ ...settings, enforceDownloadVerification: e.target.checked })
                  }
                  className="mt-1 accent-white"
                />
                <div>
                  <div className="text-white font-medium">Enforce SHA-256 Recalculation on Download</div>
                  <div className="text-[11px] text-white/50">
                    Calculates cryptographic digest upon AES-GCM decryption and halts download if signature differs.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auditLoggingEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, auditLoggingEnabled: e.target.checked })
                  }
                  className="mt-1 accent-white"
                />
                <div>
                  <div className="text-white font-medium">Immutable Security Audit Logging</div>
                  <div className="text-[11px] text-white/50">
                    Captures all user authentication, authorization checks, and file manipulations.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              id="btn-save-settings"
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-white text-black hover:bg-white/90 font-mono-tech font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'APPLYING POLICIES...' : 'SAVE & APPLY POLICIES'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
