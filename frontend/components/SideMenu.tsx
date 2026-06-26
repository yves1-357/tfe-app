'use client';

import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import SettingsPanel from '@/components/SettingsPanel';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

function MenuItem({ icon, label, onClick, children }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover-surface flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-left group"
    >
      <span className="text-2 group-hover:text-1 transition-colors">{icon}</span>
      <span className="flex-1 text-[15px] font-medium text-1 tracking-tight">{label}</span>
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-3 pb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-3">
      {children}
    </p>
  );
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[340px] max-w-[88%] overflow-hidden transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Liquid-glass backdrop (separated layer, feathered) */}
        <div className="glass-bg pointer-events-none absolute inset-y-0 -left-2 -right-3" />

        {/* Content layer */}
        <div className="relative flex flex-col h-full px-6 pt-8 pb-6">
          {/* Header: title + close */}
          <div className="flex items-start justify-between mb-9 px-1">
            <div>
              <h1 className="lg-text text-[32px] leading-none font-bold tracking-tight">
                <span className="text-1">Next</span>
                <span className="text-blue-500">Stop</span>
              </h1>
              <p className="text-[12px] text-3 mt-1.5 tracking-wide">Plan your routes</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hover-surface press-effect w-9 h-9 flex items-center justify-center rounded-xl text-2 -mt-1"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Account section */}
          <SectionLabel>Account</SectionLabel>
          <nav className="flex flex-col gap-0.5 mb-3">
            <MenuItem
              onClick={() => setUserPanelOpen(!userPanelOpen)}
              icon={
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              label="Profile"
            >
              <svg
                className={`w-4 h-4 text-3 transition-transform duration-200 ${userPanelOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </MenuItem>

            {userPanelOpen && (
              <div className="glass-soft mx-3 my-1 px-4 py-3.5 rounded-2xl animate-fade-in-up">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-token">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    JD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-1 truncate">John Doe</p>
                    <p className="text-[11px] text-3 truncate">john@example.com</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-3">Plan</span>
                  <span className="text-[12px] font-semibold text-blue-400">Free</span>
                </div>
              </div>
            )}
          </nav>

          {/* Library section */}
          <SectionLabel>Library</SectionLabel>
          <nav className="flex flex-col gap-0.5 mb-3">
            <MenuItem
              icon={
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              }
              label="Saved routes"
            />
            <MenuItem
              icon={
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Recents"
            />
          </nav>

          {/* Preferences section */}
          <SectionLabel>Preferences</SectionLabel>
          <nav className="flex flex-col gap-0.5">
            <MenuItem
              onClick={() => setSettingsOpen(true)}
              icon={
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="Settings"
            />

            <button
              type="button"
              onClick={toggle}
              className="hover-surface flex items-center gap-4 w-full px-4 py-3 rounded-2xl group"
            >
              <span className="text-2 group-hover:text-1 transition-colors">
                {isDark ? (
                  <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </span>
              <span className="flex-1 text-left text-[15px] font-medium text-1 tracking-tight">
                {isDark ? 'Dark mode' : 'Light mode'}
              </span>
              <span
                className={`relative w-[42px] h-[24px] rounded-full transition-colors ${
                  isDark ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    isDark ? 'translate-x-[18px]' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </nav>

          {/* Spacer */}
          <div className="flex-1 min-h-[24px]" />

          {/* Footer: Get App */}
          <button
            type="button"
            className="hover-surface press-effect flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl border border-token text-1"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-[14px] font-semibold tracking-tight">Get the app</span>
          </button>
          <p className="text-center text-[10px] text-3 mt-3 tracking-wide">
            NextStop &middot; v0.1.0
          </p>
        </div>
      </aside>

      {/* Settings modal */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
