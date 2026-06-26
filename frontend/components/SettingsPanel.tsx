'use client';

import { useEffect, useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RowProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function Row({ icon, title, description, action }: RowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover-surface">
      <span className="text-2 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-1">{title}</p>
        {description && <p className="text-[12px] text-3 mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in-up">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        {/* Liquid glass background (separated layer, feathered) */}
        <div className="glass-bg pointer-events-none absolute -inset-2 rounded-[32px]" />

        {/* Content */}
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

          {/* Section: PWA */}
          <div className="mb-4">
            <p className="px-4 mb-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-3">
              App
            </p>
            <Row
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                </svg>
              }
              title="Install app"
              description="Add NextStop to your home screen"
              action={
                <button
                  type="button"
                  className="press-effect px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                >
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
              action={<Toggle initial={false} />}
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
          <div className="mb-2">
            <p className="px-4 mb-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-3">
              Preferences
            </p>
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

          {/* Section: About */}
          <p className="text-center text-[11px] text-3 mt-3">
            NextStop &middot; v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Local Toggle ---------------- */
function Toggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const switchProps = {
    role: 'switch',
    'aria-checked': on,
  } as const;
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
