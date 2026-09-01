'use client';

import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * L'événement "beforeinstallprompt" n'est émis par le navigateur qu'une
 * seule fois par chargement de page. S'il était capturé dans l'état local
 * d'un composant (via useState), seul le premier composant monté à ce
 * moment-là (ex: SideMenu, toujours monté) pouvait ensuite déclencher
 *
 * On capture donc l'événement une seule fois dans un état module-level
 * (hors de React), partagé par tous les composants qui utilisent ce hook,
 * quel que soit leur ordre ou moment de montage.
 */
let sharedDeferredPrompt: BeforeInstallPromptEvent | null = null;
let sharedIsInstalled = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function setupGlobalListeners() {
  if (typeof window === 'undefined') return;

  if (window.matchMedia('(display-mode: standalone)').matches) {
    sharedIsInstalled = true;
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    sharedDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    sharedDeferredPrompt = null;
    sharedIsInstalled = true;
    notifyListeners();
  });
}

// Les listeners globaux ne doivent être posés qu'une seule fois, peu
// importe combien de composants montent ce hook ensuite.
let globalListenersReady = false;
function ensureGlobalListeners() {
  if (globalListenersReady) return;
  globalListenersReady = true;
  setupGlobalListeners();
}

export function useInstallPrompt() {
  // Force un re-render de ce composant quand l'état partagé change.
  const [, setTick] = useState(0);

  useEffect(() => {
    ensureGlobalListeners();
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!sharedDeferredPrompt) return;
    await sharedDeferredPrompt.prompt();
    const { outcome } = await sharedDeferredPrompt.userChoice;
    if (outcome === 'accepted') {
      sharedDeferredPrompt = null;
      sharedIsInstalled = true;
      notifyListeners();
    }
  }, []);

  return {
    /** True when the browser supports install and the app is not yet installed */
    canInstall: !!sharedDeferredPrompt && !sharedIsInstalled,
    isInstalled: sharedIsInstalled,
    triggerInstall,
  };
}
