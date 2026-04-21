'use client';
import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark' | 'eye-care';

const THEMES: Record<string, Record<string, string>> = {
  light: {
    '--bg': '#f5f5f5',
    '--bg-elevated': '#ffffff',
    '--bg-surface': '#ffffff',
    '--border': '#e4e4e7',
    '--border-hover': '#d4d4d8',
    '--text': '#09090b',
    '--text-secondary': '#52525b',
    '--text-muted': '#a1a1aa',
    '--accent': '#7c3aed',
    '--accent-hover': '#6d28d9',
    '--success': '#059669',
    '--warning': '#d97706',
    '--error': '#dc2626',
  },
  dark: {
    '--bg': '#09090b',
    '--bg-elevated': '#131316',
    '--bg-surface': '#18181b',
    '--border': '#27272a',
    '--border-hover': '#3f3f46',
    '--text': '#fafafa',
    '--text-secondary': '#a1a1aa',
    '--text-muted': '#52525b',
    '--accent': '#7c3aed',
    '--accent-hover': '#6d28d9',
    '--success': '#10b981',
    '--warning': '#f59e0b',
    '--error': '#ef4444',
  },
  'eye-care': {
    '--bg': '#1a1a10',
    '--bg-elevated': '#222218',
    '--bg-surface': '#2a2a1e',
    '--border': '#3a3a2a',
    '--border-hover': '#4a4a38',
    '--text': '#e8e4d0',
    '--text-secondary': '#b8b4a0',
    '--text-muted': '#7a7766',
    '--accent': '#a78b6a',
    '--accent-hover': '#96785a',
    '--success': '#6b9e6b',
    '--warning': '#c4a35a',
    '--error': '#c46b6b',
  },
};

function applyTheme(mode: ThemeMode) {
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = THEMES[prefersDark ? 'dark' : 'light'];
    Object.entries(theme).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  } else {
    const theme = THEMES[mode];
    if (theme) Object.entries(theme).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ls_theme') as ThemeMode | null;
      if (saved) setTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem('ls_theme', theme); } catch {}

    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const prefersDark = e.matches;
        const t = THEMES[prefersDark ? 'dark' : 'light'];
        Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
      }
    };
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return { theme, setTheme };
}
