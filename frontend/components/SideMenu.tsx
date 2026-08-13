'use client';

import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import SettingsPanel from '@/components/SettingsPanel';
import AuthModal from '@/components/AuthModal';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import { deleteCurrentUser, getCurrentUser, hasAuthToken, logoutUser } from '@/lib/auth';
import { getSavedRoutes, deleteSavedRoute } from '@/lib/api';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import type { AuthUser, SavedRouteItem } from '@/types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRoute?: (route: SavedRouteItem) => void;
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

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-3 pb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-3">
      {children}
    </p>
  );
}

function getInitials(email: string): string {
  const beforeAt = email.split('@')[0] || 'US';
  const chunks = beforeAt.split(/[._-]/g).filter(Boolean);
  if (chunks.length >= 2) {
    return `${chunks[0][0] ?? ''}${chunks[1][0] ?? ''}`.toUpperCase();
  }
  return beforeAt.slice(0, 2).toUpperCase() || 'US';
}

export default function SideMenu({ isOpen, onClose, onLoadRoute }: SideMenuProps) {
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savedRoutesOpen, setSavedRoutesOpen] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteItem[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const { isDark, toggle } = useTheme();
  const { canInstall, isInstalled, triggerInstall } = useInstallPrompt();

  const handleToggleProfile = async () => {
    const nextOpen = !userPanelOpen;
    setUserPanelOpen(nextOpen);

    if (!nextOpen) return;

    if (!hasAuthToken()) {
      setCurrentUser(null);
      setProfileError(null);
      return;
    }

    setIsLoadingProfile(true);
    setProfileError(null);

    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      setCurrentUser(null);
      setProfileError(err instanceof Error ? err.message : 'Unable to load profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setProfileError(null);
  };

  const handleDeleteAccount = async () => {
    await deleteCurrentUser();
    setCurrentUser(null);
    setProfileError(null);
  };

  const handleToggleSavedRoutes = async () => {
    const nextOpen = !savedRoutesOpen;
    setSavedRoutesOpen(nextOpen);
    if (!nextOpen) return;

    if (!hasAuthToken()) {
      setSavedRoutes([]);
      setRoutesError(null);
      return;
    }

    setIsLoadingRoutes(true);
    setRoutesError(null);
    try {
      const routes = await getSavedRoutes();
      setSavedRoutes(routes);
    } catch (err) {
      setRoutesError(err instanceof Error ? err.message : 'Loading error');
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const handleDeleteRoute = async (id: number) => {
    try {
      await deleteSavedRoute(id);
      setSavedRoutes(prev => prev.filter(r => r.id !== id));
    } catch {
      // silently ignore
    }
  };

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
        <div className="relative flex flex-col h-full px-6 pt-safe pb-safe">
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
              onClick={handleToggleProfile}
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
                {isLoadingProfile ? (
                  <p className="text-[12px] text-2">Loading profile...</p>
                ) : currentUser ? (
                  <>
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-token">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(currentUser.email)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-1 truncate">{currentUser.email.split('@')[0]}</p>
                        <p className="text-[11px] text-3 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="press-effect px-3 py-1.5 rounded-lg text-xs font-semibold text-1 bg-white/5 hover:bg-white/10"
                      >
                        Logout
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModalOpen(true)}
                        className="press-effect px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20"
                      >
                        Delete account
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-[12px] text-2">You are not connected yet.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthModalMode('login')}
                        className="press-effect flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthModalMode('register')}
                        className="press-effect flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-1 text-xs font-semibold border border-token"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}

                {profileError && <p className="text-[11px] text-red-400 mt-3">{profileError}</p>}
              </div>
            )}
          </nav>

          {/* Library section */}
          <SectionLabel>Library</SectionLabel>
          <nav className="flex flex-col gap-0.5 mb-3">
            <MenuItem
              onClick={handleToggleSavedRoutes}
              icon={
                <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              }
              label="Saved routes"
            >
              <svg
                className={`w-4 h-4 text-3 transition-transform duration-200 ${savedRoutesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </MenuItem>

            {savedRoutesOpen && (
              <div className="glass-soft mx-3 my-1 rounded-2xl animate-fade-in-up overflow-hidden">
                {!hasAuthToken() ? (
                  <div className="px-4 py-3.5 space-y-2.5">
                    <p className="text-[12px] text-2">Log in to see your saved routes.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthModalMode('login')}
                        className="press-effect flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthModalMode('register')}
                        className="press-effect flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-1 text-xs font-semibold border border-token"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ) : isLoadingRoutes ? (
                  <p className="px-4 py-3.5 text-[12px] text-2">Loading...</p>
                ) : routesError ? (
                  <p className="px-4 py-3.5 text-[12px] text-red-400">{routesError}</p>
                ) : savedRoutes.length === 0 ? (
                  <p className="px-4 py-3.5 text-[12px] text-2">No saved routes yet.</p>
                ) : (
                  <ul className="divide-y divide-token">
                    {savedRoutes.map((route) => {
                      const orderedStops = [...route.stops_json].sort((a, b) => a.order - b.order);
                      return (
                        <li key={route.id} className="px-4 py-3">
                          {/* Clickable card area — excludes delete button */}
                          <button
                            type="button"
                            onClick={() => { onLoadRoute?.(route); onClose(); }}
                            className="press-effect w-full text-left rounded-xl -mx-1 px-1 py-0.5 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-1 truncate">{route.name}</p>
                                <p className="text-[11px] text-3 mt-0.5">{formatDate(route.created_at)}</p>
                              </div>
                              <span className="flex-shrink-0 text-blue-400 text-[10px] font-semibold flex items-center gap-0.5 mt-1">
                                Load
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                            </div>
                            <ol className="mt-2 space-y-0.5">
                              {orderedStops.map((stop, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-blue-600/20 text-blue-400 text-[9px] font-bold flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span className="text-[11px] text-2 leading-tight">{stop.address}</span>
                                </li>
                              ))}
                            </ol>
                            {(route.total_duration_sec != null || route.total_distance_m != null) && (
                              <div className="flex gap-3 mt-2 pt-2 border-t border-token">
                                {route.total_duration_sec != null && (
                                  <span className="text-[10px] text-3 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatDuration(route.total_duration_sec)}
                                  </span>
                                )}
                                {route.total_distance_m != null && (
                                  <span className="text-[10px] text-3 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    {formatDistance(route.total_distance_m)}
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                          {/* Delete button outside the clickable card */}
                          <div className="flex justify-end mt-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteRoute(route.id)}
                              className="press-effect flex items-center gap-1 px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                              aria-label="Delete"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-[10px] font-medium">Delete</span>
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

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

          {/* Footer: Get App — hidden once installed or when browser doesn't support install */}
          {!isInstalled && (
            <button
              type="button"
              onClick={canInstall ? triggerInstall : undefined}
              disabled={!canInstall}
              className={`press-effect flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl border border-token text-1 transition-opacity ${
                canInstall ? 'hover-surface opacity-100' : 'opacity-40 cursor-default'
              }`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-[14px] font-semibold tracking-tight">
                {canInstall ? 'Installer l’app' : 'Get the app'}
              </span>
            </button>
          )}
          <p className="text-center text-[10px] text-3 mt-3 tracking-wide">
            NextStop &middot; v0.1.0
          </p>
        </div>
      </aside>

      {/* Settings modal */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AuthModal
        isOpen={authModalMode !== null}
        mode={authModalMode ?? 'login'}
        onClose={() => setAuthModalMode(null)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setProfileError(null);
        }}
      />
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
}
