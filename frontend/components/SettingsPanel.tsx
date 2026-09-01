'use client';

import { useEffect, useState } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RowProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

/** "Coming soon" pour une fonctionnalité annoncée mais pas encore branchée. */
function ComingSoonBadge() {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold whitespace-nowrap">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Coming soon
    </span>
  );
}

function Row({ icon, title, description, action, onClick }: RowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl hover-surface ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <span className="text-2 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-1">{title}</p>
        {description && <p className="text-[12px] text-3 mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {onClick && !action && (
        <svg className="w-4 h-4 text-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPrivacy) setShowPrivacy(false);
        else if (showInstall) setShowInstall(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, showPrivacy, showInstall]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in-up">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative w-full max-w-md">
          <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

          <div className="relative px-4 pt-5 pb-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="lg-text text-xl font-bold text-1">Settings</h2>
              <button
                type="button"
                onClick={onClose}
                className="hover-surface press-effect w-9 h-9 flex items-center justify-center rounded-xl text-2"
                aria-label="Close settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Section: App */}
            <div className="mb-4">
              <p className="px-4 mb-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-3">App</p>
              <Row
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                  </svg>
                }
                title="Install app"
                description="Add NextStop to your home screen"
                action={
                  <button type="button" 
                  onClick={() => setShowInstall(true)}
                  className="press-effect px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">
                    Install
                  </button>
                  
                }
              />
              <Row
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                }
                title="Notifications"
                description="Get alerts for your routes"
                action={<ComingSoonBadge />}
              />
              <Row
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Offline mode"
                description="Cache maps for offline use"
                action={<Toggle initial={true} />}
              />
            </div>

            {/* Section: Preferences */}
            <div className="mb-4">
              <p className="px-4 mb-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-3">Preferences</p>
              <Row
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5h12M9 3v2m4 13h6m-3-3v6M5 17l4-4 4 4M11 13l4-4 4 4" />
                  </svg>
                }
                title="Language"
                description="English"
              />
              <Row
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2a4 4 0 014-4h6m0 0l-3-3m3 3l-3 3M3 7h12m0 0l-3-3m3 3l-3 3" />
                  </svg>
                }
                title="Distance unit"
                description="Kilometers"
              />
            </div>

            {/* Section: Privacy */}
            <div className="mb-2">
              <p className="px-4 mb-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-3">Privacy</p>
              <Row
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                title="Data protection (GDPR)"
                description="Your rights and collected data"
                onClick={() => setShowPrivacy(true)}
              />
            </div>

            <p className="text-center text-[11px] text-3 mt-3">NextStop &middot; v0.1.0</p>
          </div>
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in-up">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPrivacy(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md max-h-[85vh] flex flex-col">
            <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <h2 className="text-[17px] font-bold text-1">Data protection</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="hover-surface press-effect w-9 h-9 flex items-center justify-center rounded-xl text-2"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="relative overflow-y-auto px-5 pb-5 space-y-4 text-[13px] text-2 leading-relaxed">

              {/* Données collectées */}
              <section>
                <h3 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-blue-400 mb-2">Data collected</h3>
                <p className="text-3 mb-2">
                  <strong className="text-2">Without an account:</strong> no personal data is collected or stored. No tracking cookies.
                </p>
                <p className="text-3">
                  <strong className="text-2">With an account:</strong> email address, bcrypt hash of the password (never the password in plain text), account creation date, and saved routes.
                </p>
              </section>

              {/* Vos droits */}
              <section>
                <h3 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-blue-400 mb-2">Your rights (GDPR)</h3>
                <ul className="space-y-1.5 text-3">
                  <li><span className="text-2 font-medium">Access:</span> view your data from the account settings.</li>
                  <li><span className="text-2 font-medium">Rectification:</span> changing your name or email is not yet available in the interface - contact the administrator to update your data.</li>
                  <li><span className="text-2 font-medium">Erasure:</span> delete your account in one click - all your data is immediately and permanently removed, with no archive.</li>
                  <li><span className="text-2 font-medium">Objection:</span> log out or delete your account at any time - all core features remain usable without an account.</li>
                </ul>
              </section>

              {/* Sécurité */}
              <section>
                <h3 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-blue-400 mb-2">Security</h3>
                <p className="text-3">
                  Communications are encrypted (HTTPS/TLS). Passwords are hashed with bcrypt. No sensitive data appears in logs.
                </p>
              </section>

              {/* Hébergement */}
              <section>
                <h3 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-blue-400 mb-2">Hosting</h3>
                <p className="text-3">
                  Database hosted on <strong className="text-2">Neon</strong> (EU-West, Frankfurt) within the European Union, in compliance with GDPR.
                </p>
              </section>

              {/* Contact */}
              <div className="glass-soft rounded-2xl px-4 py-3 border border-blue-400/20">
                <p className="text-[12px] text-3">
                  <strong className="text-2">Contact: </strong>
                  For any questions regarding your data, please contact the administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Install Modal */}
      {showInstall && (
        <InstallInstructionsModal onClose={() => setShowInstall(false)} />
      )}
      
    </>
  );
}

/* ---------------- Install Instructions Modal ---------------- */
type BrowserTab = 'chrome' | 'safari' | 'edge';

function detectBrowser(): BrowserTab {
  if (typeof navigator === 'undefined') return 'chrome';
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'edge';
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'safari';
  return 'chrome';
}

function InstallInstructionsModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<BrowserTab>(detectBrowser());
  const { canInstall, triggerInstall } = useInstallPrompt();
  const [attemptFailed, setAttemptFailed] = useState(false);

  // Le prompt natif "beforeinstallprompt" n'est jamais émis par Safari
  // (limitation d'Apple, pas contournable) le bouton n'a de sens que
  // sur Chrome/Edge, là où canInstall peut réellement devenir true.
  const nativeInstallAvailable = tab !== 'safari' && canInstall;

  const handleInstallClick = () => {
    if (nativeInstallAvailable) {
      triggerInstall();
    } else {
      // Chrome/Edge, mais le navigateur n'a pas (encore) proposé le prompt
      // natif — on ne le sait qu'après la tentative, pas par défaut.
      setAttemptFailed(true);
    }
  };

  const tabs: { id: BrowserTab; label: string }[] = [
    { id: 'chrome', label: 'Chrome' },
    { id: 'safari', label: 'Safari' },
    { id: 'edge', label: 'Edge' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in-up">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md">
        <div className=" bg-black/70 pointer-events-none absolute -inset-2 rounded-[32px]" />

        <div className="relative px-5 pt-5 pb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold  text-1">Download NextStop</h2>
            <button
              type="button"
              onClick={onClose}
              className="hover-surface press-effect w-9 h-9 flex items-center justify-center rounded-xl text-2"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-1 mb-4 p-1 rounded-xl input-surface">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTab(t.id); setAttemptFailed(false); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  tab === t.id ? 'bg-blue-600 text-white' : 'text-2 hover-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="text-[13px] text-2 leading-relaxed">
            {tab === 'chrome' && (
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Click the install icon (&#8853;) in the address bar</li>
                <li>Or open the ⋮ menu in the top right</li>
                <li>Select <strong className="text-1">Install NextStop</strong></li>
                <li>Confirm in the dialog that appears</li>
              </ol>
            )}

            {tab === 'safari' && (
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Tap the <strong className="text-1">Share</strong> button (square with arrow)</li>
                <li>Scroll down and select <strong className="text-1">Add to Home Screen</strong></li>
                <li>Tap <strong className="text-1">Add</strong> in the top right</li>
              </ol>
            )}

            {tab === 'edge' && (
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Click the Apps icon (&#8853;) in the address bar</li>
                <li>Or open the ⋯ menu in the top right</li>
                <li>Go to <strong className="text-1">Apps</strong> → <strong className="text-1">Install this site as an app</strong></li>
                <li>Confirm the installation</li>
              </ol>
            )}
          </div>

          {/* Bouton d'installation directeutilise le prompt natif du
              navigateur (beforeinstallprompt), disponible uniquement sur
              Chrome/Edge. Safarin'expose aucune API d'installation
              programmatique, donc le bouton y est désactivé d'emblée.
              Sur Chrome/Edge, le bouton reste cliquable même si le prompt
              n'est pas encore disponible, le message d'indisponibilité
              n'apparaît qu'après une tentative infructueuse, pas par défaut. */}
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={tab === 'safari'}
            className={`press-effect w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              tab === 'safari'
                ? 'bg-white/5 text-3 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Install NextStop
          </button>
          {(tab === 'safari' || attemptFailed) && (
            <p className="mt-2 text-center text-[11px] text-3">
              {tab === 'safari'
                ? 'Not supported on Safari - follow the steps above.'
                : 'Not available yet in this browser - follow the steps above.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


/* ---------------- Local Toggle ---------------- */
function Toggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const switchProps = { role: 'switch', 'aria-checked': on } as const;
  return (
    <button
      type="button"
      {...switchProps}
      onClick={() => setOn(!on)}
      className={`w-11 h-6 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-gray-400/40'}`}
      aria-label={`Toggle ${on ? 'off' : 'on'}`}
      title={on ? 'Enabled' : 'Disabled'}
    >
      <span
        className={`block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform m-0.5 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
