import React, { useState, useEffect, useRef } from 'react';
import { User, VaultFile, AuditEvent, SecurityPosture } from './types';
import { api, getStoredToken } from './services/api';
import { Navigation } from './components/Navigation';
import { LandingView } from './components/LandingView';
import { AuthModal } from './components/AuthModal';
import { VaultView } from './components/VaultView';
import { UploadModal } from './components/UploadModal';
import { FileDetailsModal } from './components/FileDetailsModal';
import { SecurityDashboard } from './components/SecurityDashboard';
import { AuditActivityView } from './components/AuditActivityView';
import { SecurityEventsView } from './components/SecurityEventsView';
import { SecurityArchitectureView } from './components/SecurityArchitectureView';
import { SecuritySettingsView } from './components/SecuritySettingsView';
import { SharedFileView } from './components/SharedFileView';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4';
const POSTER_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // Core Data States
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [securityEvents, setSecurityEvents] = useState<AuditEvent[]>([]);
  const [posture, setPosture] = useState<SecurityPosture | null>(null);
  const [loading, setLoading] = useState(true);

  // Video Ref & Autoplay Guarantee
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn('[SecureVault] Video autoplay waiting for interaction or network buffer:', err);
        });
      }
    }
  }, []);

  // Check URL query parameters for share token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('share');
    if (token) {
      setShareToken(token);
    }
  }, []);

  // Initial Auth Check
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = getStoredToken();
      if (token) {
        try {
          const currentUser = await api.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setCurrentView('vault');
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Fetch data whenever user is logged in
  const refreshAllData = async () => {
    try {
      const postureData = await api.getSecurityPosture();
      setPosture(postureData);

      if (user) {
        const [vaultFiles, logs, events] = await Promise.all([
          api.getFiles(),
          api.getAuditLogs(),
          api.getSecurityEvents(),
        ]);
        setFiles(vaultFiles);
        setAuditLogs(logs);
        setSecurityEvents(events);

        // Keep selectedFile in sync if open
        if (selectedFile) {
          const updated = vaultFiles.find((f) => f.id === selectedFile.id);
          if (updated) setSelectedFile(updated);
        }
      }
    } catch (err) {
      console.error('Error syncing vault data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [user]);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentView('vault');
    refreshAllData();
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setFiles([]);
    setAuditLogs([]);
    setSecurityEvents([]);
    setCurrentView('landing');
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
      setCurrentView('vault');
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

  const isDemoActive = files.some((f) => f.isDemo);

  return (
    <div className="securevault-app text-white selection:bg-white/20 selection:text-white">
      {/* Cinematic Background Video Layer */}
      <div className="securevault-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="securevault-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_URL}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div className="securevault-scrim" />
      </div>

      {/* Main SecureVault Interface Content */}
      <div className="securevault-content">
        {/* If viewing a share token directly */}
        {shareToken ? (
          <SharedFileView
            token={shareToken}
            onReturnToHome={() => {
              setShareToken(null);
              window.history.pushState({}, document.title, window.location.pathname);
            }}
          />
        ) : (
          <>
            {/* Top Header & Navigation (Rendered on Workstation & Internal Views) */}
            {currentView !== 'landing' && (
              <Navigation
                currentView={currentView}
                onViewChange={(v) => {
                  if (v === 'how-it-works' || v === 'architecture') {
                    setCurrentView('architecture');
                  } else if (v === 'audit-preview') {
                    if (user) setCurrentView('audit');
                    else setIsAuthModalOpen(true);
                  } else if (
                    v === 'vault' ||
                    v === 'posture' ||
                    v === 'audit' ||
                    v === 'events' ||
                    v === 'settings'
                  ) {
                    if (user) setCurrentView(v);
                    else setIsAuthModalOpen(true);
                  } else {
                    setCurrentView(v);
                  }
                }}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
                isDemoActive={isDemoActive}
              />
            )}

            {/* Main Content Router */}
            <main className="flex-1">
              {currentView === 'landing' && (
                <LandingView
                  onEnterVault={() => {
                    if (user) setCurrentView('vault');
                    else setIsAuthModalOpen(true);
                  }}
                  onViewSecurityModel={() => setCurrentView('architecture')}
                  onRunDemo={handleSeedDemo}
                  onViewChange={(v) => {
                    if (v === 'landing') setCurrentView('landing');
                    else if (v === 'security') setCurrentView('architecture');
                    else if (v === 'vault' || v === 'shares') {
                      if (user) setCurrentView('vault');
                      else setIsAuthModalOpen(true);
                    } else if (v === 'audit') {
                      if (user) setCurrentView('audit');
                      else setIsAuthModalOpen(true);
                    } else {
                      setCurrentView(v);
                    }
                  }}
                  onDirectLogin={async (emailInput, passwordInput) => {
                    const res = await api.login(emailInput, passwordInput);
                    setUser(res.user);
                    setCurrentView('vault');
                    await refreshAllData();
                  }}
                  isLoggedIn={!!user}
                />
              )}

              {currentView === 'vault' && user && (
                <VaultView
                  files={files}
                  onOpenFileUpload={() => setIsUploadModalOpen(true)}
                  onSelectFile={(f) => setSelectedFile(f)}
                  onRefresh={refreshAllData}
                  currentUserEmail={user.email}
                  onSeedDemo={handleSeedDemo}
                  onResetDemo={handleResetDemo}
                  isDemoActive={isDemoActive}
                />
              )}

              {currentView === 'posture' && user && (
                <SecurityDashboard posture={posture} onRefresh={refreshAllData} />
              )}

              {currentView === 'audit' && user && (
                <AuditActivityView auditLogs={auditLogs} onRefresh={refreshAllData} />
              )}

              {currentView === 'events' && user && (
                <SecurityEventsView events={securityEvents} onRefresh={refreshAllData} />
              )}

              {currentView === 'architecture' && <SecurityArchitectureView />}

              {currentView === 'settings' && user && (
                <SecuritySettingsView onRefreshPosture={refreshAllData} />
              )}
            </main>
          </>
        )}

        {/* Modals */}
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

        <FileDetailsModal
          file={selectedFile}
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          onRefresh={refreshAllData}
          currentUserEmail={user?.email || ''}
        />
      </div>
    </div>
  );
}

