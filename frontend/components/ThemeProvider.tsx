'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') setIsDark(false);
  }, []);

  // Reflect theme on <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', isDark);
    root.classList.toggle('theme-light', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark((v) => !v) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
