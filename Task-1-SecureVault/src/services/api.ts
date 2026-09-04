import {
  User,
  VaultFile,
  AuditEvent,
  SecurityPosture,
  SecuritySettings,
  ShareLink,
  CopilotResponse,
} from '../types';

const TOKEN_KEY = 'securevault_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (isJson = true): HeadersInit => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setStoredToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setStoredToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      removeStoredToken();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: getHeaders(),
      });
      if (!res.ok) {
        removeStoredToken();
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  // Vault Files
  async getFiles(): Promise<VaultFile[]> {
    const res = await fetch('/api/vault/files', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch vault files');
    return data.files || [];
  },

  async uploadFile(file: File): Promise<{ file: VaultFile }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/vault/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'File upload and encryption failed');
    return data;
  },

  async downloadFile(fileId: string, filename: string): Promise<{ integrityVerified: boolean; sha256: string }> {
    const res = await fetch(`/api/vault/download/${fileId}`, {
      headers: getHeaders(false),
    });

    if (!res.ok) {
      let errorMsg = 'Download failed';
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const integrityStatus = res.headers.get('X-Integrity-Status');
    const sha256 = res.headers.get('X-SHA256') || '';

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return {
      integrityVerified: integrityStatus === 'VERIFIED',
      sha256,
    };
  },

  async deleteFile(fileId: string): Promise<void> {
    const res = await fetch(`/api/vault/files/${fileId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete file');
  },

  // Permissions & Sharing
  async addPermission(fileId: string, targetEmail: string, role: 'OWNER' | 'EDITOR' | 'VIEWER'): Promise<void> {
    const res = await fetch('/api/vault/permissions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileId, targetEmail, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to grant permission');
  },

  async revokePermission(permissionId: string): Promise<void> {
    const res = await fetch(`/api/vault/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to revoke permission');
  },

  async createShareLink(
    fileId: string,
    role: 'EDITOR' | 'VIEWER',
    expiryHours: number,
    maxAccessCount?: number | null
  ): Promise<{ shareLink: ShareLink }> {
    const res = await fetch('/api/vault/share-links', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileId, role, expiryHours, maxAccessCount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate share link');
    return data;
  },

  async revokeShareLink(shareId: string): Promise<void> {
    const res = await fetch(`/api/vault/share-links/${shareId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to revoke share link');
  },

  // Shared Link Access
  async getSharedFileInfo(token: string): Promise<any> {
    const res = await fetch(`/api/vault/shared/${token}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Link invalid or expired');
    return data.share;
  },

  async downloadSharedFile(token: string, filename: string): Promise<{ integrityVerified: boolean; sha256: string }> {
    const res = await fetch(`/api/vault/download-shared/${token}`);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to download shared file');
    }
    const integrityStatus = res.headers.get('X-Integrity-Status');
    const sha256 = res.headers.get('X-SHA256') || '';

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return {
      integrityVerified: integrityStatus === 'VERIFIED',
      sha256,
    };
  },

  // Security Posture & Audits
  async getSecurityPosture(): Promise<SecurityPosture> {
    const res = await fetch('/api/security/posture', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to retrieve security posture');
    return data;
  },

  async getAuditLogs(): Promise<AuditEvent[]> {
    const res = await fetch('/api/security/audit-logs', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');
    return data.auditLogs || [];
  },

  async getSecurityEvents(): Promise<AuditEvent[]> {
    const res = await fetch('/api/security/events', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch security events');
    return data.events || [];
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    const res = await fetch('/api/security/settings', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch security settings');
    return data.settings;
  },

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const res = await fetch('/api/security/settings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update security settings');
    return data.settings;
  },

  async verifyAllIntegrity(): Promise<{ checked: number; verified: number; failed: number }> {
    const res = await fetch('/api/security/verify-all-integrity', {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Integrity audit failed');
    return data;
  },

  async simulateUnauthorizedAccess(targetResource?: string): Promise<void> {
    await fetch('/api/security/simulate-unauthorized-access', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetResource }),
    });
  },

  // Deterministic Demo Controls
  async seedDemo(): Promise<void> {
    const res = await fetch('/api/demo/seed', {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to initialize demo');
  },

  async resetDemo(): Promise<void> {
    const res = await fetch('/api/demo/reset', {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset demo');
  },

  async getAllShares(): Promise<ShareLink[]> {
    const res = await fetch('/api/vault/all-shares', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch shares');
    return data.shares || [];
  },

  async getAutomations(): Promise<any[]> {
    const res = await fetch('/api/security/automations', {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch automations');
    return data.automations || [];
  },

  async runAutomation(automationId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/security/run-automation', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ automationId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to execute automation');
    return data;
  },

  async executeAgentAction(action: {
    actionId: string;
    type: string;
    targetId?: string;
    payload?: any;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/security/agent-action', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(action),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to execute agent remediation');
    return data;
  },

  // AI Security Copilot
  async getAiStatus(): Promise<{ configured: boolean; model: string; localFallbackAvailable: boolean; activeEngine?: string }> {
    try {
      const res = await fetch('/api/ai/status');
      if (!res.ok) return { configured: false, model: 'gemini-2.0-flash', localFallbackAvailable: true };
      return await res.json();
    } catch {
      return { configured: false, model: 'gemini-2.0-flash', localFallbackAvailable: true };
    }
  },

  async askCopilot(prompt: string, mode?: 'ai' | 'local'): Promise<CopilotResponse> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, mode }),
    });
    const data = await res.json();
    if (!res.ok && res.status !== 503) {
      throw new Error(data.error || 'Request to Copilot service failed');
    }
    return data;
  },

  async configureAiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/ai/configure-key', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to configure Gemini API key');
    return data;
  },

  async removeAiKey(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/ai/remove-key', {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to disconnect Gemini API key');
    return data;
  },
};
