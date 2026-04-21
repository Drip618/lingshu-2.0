'use client';
import { useState, useEffect, useCallback } from 'react';

export interface AIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  enabled: boolean;
}

const STORAGE_KEY = 'lingshu_ai_config';

const defaultConfig: AIConfig = {
  apiKey: '',
  baseURL: '',
  model: '',
  enabled: false,
};

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultConfig, ...parsed });
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  const updateConfig = useCallback((updates: Partial<AIConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { config, updateConfig, resetConfig, isLoaded };
}
