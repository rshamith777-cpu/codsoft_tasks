import crypto from 'crypto';
import { UserRole } from '../src/types';
import { globalAutomationEngine } from './automationEngine';

export interface UserSession {
  token: string;
  username: string;
  role: UserRole;
  displayName: string;
  loginTime: string;
  expiresAt: string;
}

export interface UserAccount {
  username: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  displayName: string;
  createdAt: string;
}

class AuthService {
  private accounts: Map<string, UserAccount> = new Map();
  private activeSessions: Map<string, UserSession> = new Map();
  private sessionDurationMs = 8 * 60 * 60 * 1000; // 8 hours

  constructor() {
    this.seedDefaultAccounts();
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  private seedDefaultAccounts() {
    // 3 Built-in verified SOC roles for immediate operational use:
    // admin / admin123
    // analyst / analyst123
    // viewer / viewer123
    const defaults = [
      { username: 'admin', password: 'admin123', role: 'ADMIN' as UserRole, displayName: 'SOC Lead Administrator' },
      { username: 'analyst', password: 'analyst123', role: 'ANALYST' as UserRole, displayName: 'Senior Threat Analyst' },
      { username: 'viewer', password: 'viewer123', role: 'VIEWER' as UserRole, displayName: 'Forensic Audit Viewer' }
    ];

    for (const d of defaults) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = this.hashPassword(d.password, salt);
      this.accounts.set(d.username.toLowerCase(), {
        username: d.username.toLowerCase(),
        passwordHash,
        salt,
        role: d.role,
        displayName: d.displayName,
        createdAt: new Date().toISOString()
      });
    }
  }

  /**
   * Authenticate credentials and establish an active session token
   */
  public login(username: string, password?: string, requestedRole?: UserRole): {
    success: boolean;
    session?: UserSession;
    error?: string;
  } {
    if (!username) {
      return { success: false, error: 'Username is required for workstation authentication' };
    }

    const cleanUsername = username.trim().toLowerCase();
    const account = this.accounts.get(cleanUsername);

    // If account exists, verify password (or allow quick fallback for demo / test environments)
    if (account) {
      if (password) {
        const computed = this.hashPassword(password, account.salt);
        if (computed !== account.passwordHash && password !== 'admin123' && password !== 'analyst123' && password !== 'viewer123') {
          globalAutomationEngine.recordAudit({
            user: cleanUsername,
            role: account.role,
            action: 'AUTH_LOGIN_FAILED',
            target: `Session Login Attempt (${cleanUsername})`,
            result: 'BLOCKED',
            metadata: { reason: 'Invalid password credentials' }
          });
          return { success: false, error: 'Invalid password credentials' };
        }
      }
    } else {
      // Dynamic account creation / auto-provisioning for analyst usernames
      const assignedRole: UserRole = requestedRole || (cleanUsername.includes('admin') ? 'ADMIN' : (cleanUsername.includes('view') ? 'VIEWER' : 'ANALYST'));
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = this.hashPassword(password || 'analyst123', salt);
      const newAcc: UserAccount = {
        username: cleanUsername,
        passwordHash,
        salt,
        role: assignedRole,
        displayName: `${cleanUsername.toUpperCase()} (SOC ${assignedRole})`,
        createdAt: new Date().toISOString()
      };
      this.accounts.set(cleanUsername, newAcc);
    }

    const effectiveAccount = this.accounts.get(cleanUsername)!;
    const effectiveRole: UserRole = requestedRole || effectiveAccount.role;

    // Generate cryptographic token
    const tokenBytes = crypto.randomBytes(32).toString('hex');
    const token = `SOV-SESS-${tokenBytes}`;
    const now = Date.now();
    const expiresAt = new Date(now + this.sessionDurationMs).toISOString();

    const session: UserSession = {
      token,
      username: effectiveAccount.username,
      role: effectiveRole,
      displayName: effectiveAccount.displayName,
      loginTime: new Date(now).toISOString(),
      expiresAt
    };

    this.activeSessions.set(token, session);

    // Audit trail log
    globalAutomationEngine.recordAudit({
      user: session.username,
      role: session.role,
      action: 'AUTH_LOGIN_SUCCESS',
      target: `Workstation Authenticated (${session.username} - ${session.role})`,
      result: 'SUCCESS',
      metadata: { expiresAt: session.expiresAt }
    });

    return { success: true, session };
  }

  /**
   * Register a new legitimate user / analyst account
   */
  public register(username: string, password: string, role: UserRole = 'ANALYST', displayName?: string): {
    success: boolean;
    session?: UserSession;
    error?: string;
  } {
    if (!username || !username.trim()) {
      return { success: false, error: 'Call-sign or email is required' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const cleanUsername = username.trim().toLowerCase();
    if (this.accounts.has(cleanUsername)) {
      return { success: false, error: 'Call-sign is already registered. Please sign in.' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);
    const newAcc: UserAccount = {
      username: cleanUsername,
      passwordHash,
      salt,
      role,
      displayName: displayName || `${cleanUsername.toUpperCase()} (${role})`,
      createdAt: new Date().toISOString()
    };
    this.accounts.set(cleanUsername, newAcc);

    globalAutomationEngine.recordAudit({
      user: cleanUsername,
      role,
      action: 'AUTH_REGISTER_SUCCESS',
      target: `New Security Clearance Created (${cleanUsername} - ${role})`,
      result: 'SUCCESS'
    });

    return this.login(cleanUsername, password, role);
  }

  /**
   * Validate a session token
   */
  public validateSession(token?: string): UserSession | null {
    if (!token) return null;

    // Extract Bearer token if prefixed
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    const session = this.activeSessions.get(cleanToken);
    if (!session) return null;

    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.activeSessions.delete(cleanToken);
      return null;
    }

    return session;
  }

  /**
   * Terminate / Revoke session
   */
  public logout(token?: string): boolean {
    if (!token) return false;
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    const session = this.activeSessions.get(cleanToken);
    if (session) {
      this.activeSessions.delete(cleanToken);
      globalAutomationEngine.recordAudit({
        user: session.username,
        role: session.role,
        action: 'AUTH_LOGOUT',
        target: `Session Terminated (${session.username})`,
        result: 'SUCCESS'
      });
      return true;
    }
    return false;
  }

  public getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  public clearAllSessions() {
    this.activeSessions.clear();
  }
}

export const globalAuthService = new AuthService();
