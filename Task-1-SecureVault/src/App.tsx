import React, { useState, useEffect, useRef } from 'react';
import { User, VaultFile, AuditEvent, SecurityPosture } from './types';
import { api, getStoredToken } from './services/api';
import { Navigation } from './components/Navigation';
import { LandingView } from './components/LandingView';
import { AuthModal } from './components/AuthModal';
import { VaultView } from './components/VaultView';
import { UploadModal } from './components/UploadModal';
import { OverviewView } from './components/OverviewView';
import { CryptoInspectorView } from './components/CryptoInspectorView';
import { SecureSharesView } from './components/SecureSharesView';
import { SecurityDashboard } from './components/SecurityDashboard';
import { AuditActivityView } from './components/AuditActivityView';
import { SecurityArchitectureView } from './components/SecurityArchitectureView';
import { SecuritySettingsView } from './components/SecuritySettingsView';
import { SharedFileView } from './components/SharedFileView';
import { SecurityCopilot } from './components/SecurityCopilot';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { CommandPalette } from './components/ui/CommandPalette';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4';
const POSTER_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png';

const ROUTE_STORAGE_KEY = 'securevault_active_route';

// Helper to extract clean view id from window hash or localStorage
function getInitialRoute(): string {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (hash) return hash;
  const stored = localStorage.getItem(ROUTE_STORAGE_KEY);
  if (stored) return stored;
  return 'landing';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>(getInitialRoute);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // Core Data States
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [securityEvents, setSecurityEvents] = useState<AuditEvent[]>([]);
  const [posture, setPosture] = useState<SecurityPosture | null>(null);
  const [loading, setLoading] = useState(true);

  // Video Preloading & Smooth Poster-to-Video Fade
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;

      const handleReady = () => {
        setVideoReady(true);
      };

      video.addEventListener('canplay', handleReady);
      video.addEventListener('loadeddata', handleReady);

      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn('[SecureVault] Video autoplay waiting for interaction or buffer:', err);
        });
      }

      return () => {
        video.removeEventListener('canplay', handleReady);
        video.removeEventListener('loadeddata', handleReady);
      };
    }
  }, []);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL query parameters for share token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('share');
    if (token) {
      setShareToken(token);
    }
  }, []);

  // Hash-based deterministic routing listener (supports Browser Back, Forward, Direct Route Load)
  useEffect(() => {
    const handleHashChange = () => {
      const route = window.location.hash.replace(/^#\/?/, '').trim();
      if (route) {
        setCurrentView(route);
        localStorage.setItem(ROUTE_STORAGE_KEY, route);
      } else {
        // Empty hash represents landing
        setCurrentView('landing');
        localStorage.removeItem(ROUTE_STORAGE_KEY);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch data whenever user is logged in
  const refreshAllData = async () => {
    try {
      const postureData = await api.getSecurityPosture();
      setPosture(postureData);

      const token = getStoredToken();
      if (token) {
        const [vaultFiles, logs, events] = await Promise.all([
          api.getFiles().catch(() => []),
          api.getAuditLogs().catch(() => []),
          api.getSecurityEvents().catch(() => []),
        ]);
        setFiles(vaultFiles);
        setAuditLogs(logs);
        setSecurityEvents(events);
      }
    } catch (err) {
      console.error('[SecureVault] Error syncing vault data:', err);
    }
  };

  // Helper to ensure an active demo session if user is not yet logged in
  const ensureUserSession = async (): Promise<User | null> => {
    if (user) return user;
    try {
      const token = getStoredToken();
      if (token) {
        const cur = await api.getCurrentUser();
        if (cur) {
          setUser(cur);
          return cur;
        }
      }
    } catch {
      // Continue to demo account fallback
    }

    try {
      const res = await api.login('officer@securevault.internal', 'CyberSecurity2026!');
      setUser(res.user);
      return res.user;
    } catch {
      try {
        const reg = await api.register(
          'Security Officer',
          'officer@securevault.internal',
          'CyberSecurity2026!'
        );
        setUser(reg.user);
        return reg.user;
      } catch (err) {
        console.warn('[SecureVault] Demo session initialization:', err);
        return null;
      }
    }
  };

  // Initial Auth Check: Preserves selected route and auto-initializes session
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = getStoredToken();
      if (token) {
        try {
          const currentUser = await api.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            const currentRoute = getInitialRoute();
            if (currentRoute && currentRoute !== 'landing') {
              setCurrentView(currentRoute);
              window.location.hash = `#/${currentRoute}`;
            }
          }
        } catch {
          // Token expired or invalid
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user]);

  // Seamless Non-blocking Navigation Handler
  const handleNavigate = async (viewId: string) => {
    if (viewId !== 'landing' && viewId !== 'architecture' && !user) {
      const activeUser = await ensureUserSession();
      if (!activeUser) {
        setIsAuthModalOpen(true);
        return;
      }
    }

    setCurrentView(viewId);
    localStorage.setItem(ROUTE_STORAGE_KEY, viewId);

    if (viewId === 'landing') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/${viewId}`;
    }
  };

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);

    // Keep target route if already specified, else overview
    const currentRoute = getInitialRoute();
    const destination = currentRoute && currentRoute !== 'landing' ? currentRoute : 'overview';
    handleNavigate(destination);
    refreshAllData();
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setFiles([]);
    setAuditLogs([]);
    setSecurityEvents([]);
    handleNavigate('landing');
    refreshAllData();
  };

  const handleSeedDemo = async () => {
    if (!user) {
      try {
        const res = await api.login('officer@securevault.internal', 'CyberSecurity2026!');
        setUser(res.user);
      } catch {
        try {
          const res = await api.register(
            'Security Officer',
            'officer@securevault.internal',
            'CyberSecurity2026!'
          );
          setUser(res.user);
        } catch (e: any) {
          alert('Could not authenticate demo user: ' + e.message);
          return;
        }
      }
    }
    try {
      await api.seedDemo();
      await refreshAllData();
      handleNavigate('vault');
    } catch (err: any) {
      alert('Demo seed error: ' + err.message);
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      await refreshAllData();
    } catch (err: any) {
      alert('Demo reset error: ' + err.message);
    }
  };

  const isDemoActive = (files ?? []).some((f) => f.isDemo);

  return (
    <ToastProvider>
      <div className="securevault-app text-white selection:bg-white/20 selection:text-white">
        {/* Layer 0: Cinematic Background Media Stack */}
        <div className="securevault-media" aria-hidden="true">
          {/* Poster image renders immediately to prevent flash of black */}
          <img
            src={POSTER_URL}
            alt="SecureVault Cinematic Atmosphere"
            className={`securevault-poster ${videoReady ? 'faded' : ''}`}
          />
          {/* Video preloads and fades in smoothly upon buffering */}
          <video
            ref={videoRef}
            className={`securevault-video ${videoReady ? 'ready' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
          {/* Layer 1: Directional Asymmetric Atmospheric Scrim */}
          <div className="securevault-scrim" />
        </div>

        {/* Layer 2: Main Application UI & Persistent Shell */}
        <div className="securevault-content">
          {shareToken ? (
            <SharedFileView
              token={shareToken}
              onReturnToHome={() => {
                setShareToken(null);
                window.history.pushState({}, document.title, window.location.pathname);
              }}
            />
          ) : loading && !user && getStoredToken() ? (
            /* Minimal Premium Loading State (No giant spinner) */
            <div className="w-full min-h-screen flex items-center justify-center p-6">
              <div className="flex items-center gap-3 font-mono-tech text-xs tracking-[0.2em] uppercase text-white/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LOADING WORKSPACE...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Persistent Navigation across all internal workstation modules */}
              {currentView !== 'landing' && (
                <Navigation
                  currentView={currentView}
                  onViewChange={handleNavigate}
                  user={user}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onLogout={handleLogout}
                  onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                  onOpenCopilot={() => setIsCopilotOpen(true)}
                  isDemoActive={isDemoActive}
                />
              )}

              {/* Workspace Root wrapped in ErrorBoundary */}
              <ErrorBoundary onResetToVault={() => handleNavigate('vault')}>
                <main className="flex-1 flex flex-col">
                  {currentView === 'landing' && (
                    <LandingView
                      onEnterVault={() => handleNavigate('overview')}
                      onViewSecurityModel={() => handleNavigate('architecture')}
                      onRunDemo={handleSeedDemo}
                      onViewChange={(v) => handleNavigate(v)}
                      onDirectLogin={async (emailInput, passwordInput) => {
                        const res = await api.login(emailInput, passwordInput);
                        setUser(res.user);
                        handleNavigate('overview');
                        await refreshAllData();
                      }}
                      isLoggedIn={!!user}
                    />
                  )}

                  {/* 01 Overview */}
                  {currentView === 'overview' && (
                    <OverviewView
                      files={files}
                      posture={posture}
                      auditLogs={auditLogs}
                      onNavigate={handleNavigate}
                      onOpenUpload={() => setIsUploadModalOpen(true)}
                      onRunIntegrityAudit={async () => {
                        await api.verifyAllIntegrity();
                        refreshAllData();
                      }}
                    />
                  )}

                  {/* 02 Vault */}
                  {currentView === 'vault' && (
                    <VaultView
                      files={files}
                      onOpenFileUpload={() => setIsUploadModalOpen(true)}
                      onSelectFile={() => {}}
                      onRefresh={refreshAllData}
                      currentUserEmail={user?.email || 'officer@securevault.internal'}
                      onSeedDemo={handleSeedDemo}
                      onResetDemo={handleResetDemo}
                      isDemoActive={isDemoActive}
                    />
                  )}

                  {/* 03 Crypto Inspector */}
                  {currentView === 'crypto-inspector' && (
                    <CryptoInspectorView files={files} onRefresh={refreshAllData} />
                  )}

                  {/* 04 Secure Shares */}
                  {currentView === 'shares' && (
                    <SecureSharesView
                      files={files}
                      onRefresh={refreshAllData}
                      currentUserEmail={user?.email || 'officer@securevault.internal'}
                    />
                  )}

                  {/* 05 Security (Posture + Agents + Automations) */}
                  {currentView === 'security' && (
                    <SecurityDashboard
                      posture={posture}
                      files={files}
                      auditLogs={auditLogs}
                      onRefresh={refreshAllData}
                    />
                  )}

                  {/* 06 Audit Activity */}
                  {currentView === 'audit' && (
                    <AuditActivityView auditLogs={auditLogs} onRefresh={refreshAllData} />
                  )}

                  {/* 07 Architecture & Threat Model (Publicly viewable or authenticated) */}
                  {currentView === 'architecture' && <SecurityArchitectureView />}

                  {/* 08 Settings & Account */}
                  {currentView === 'settings' && (
                    <SecuritySettingsView onRefreshPosture={refreshAllData} />
                  )}
                </main>
              </ErrorBoundary>
            </>
          )}

          {/* Overlays & Modals */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleLoginSuccess}
          />

          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={() => {
              refreshAllData();
            }}
          />

          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onNavigate={handleNavigate}
            onUpload={() => setIsUploadModalOpen(true)}
            onRunAudit={async () => {
              await api.verifyAllIntegrity();
              refreshAllData();
            }}
            onSeedDemo={handleSeedDemo}
            onResetDemo={handleResetDemo}
            isDemoActive={isDemoActive}
          />

          <SecurityCopilot
            isOpen={isCopilotOpen}
            onClose={() => setIsCopilotOpen(false)}
          />
        </div>
      </div>
    </ToastProvider>
  );
}
