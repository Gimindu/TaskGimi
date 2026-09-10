'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export type ServerStatus = 'checking' | 'online' | 'warming' | 'offline';

interface ServerStatusContextType {
  status: ServerStatus;
  latency: number | null;
  checkHealth: () => Promise<void>;
  isWarmingUp: boolean;
  lastChecked: Date | null;
}

const ServerStatusContext = createContext<ServerStatusContextType | undefined>(undefined);

export const ServerStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ServerStatus>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    const startTime = Date.now();

    // Timer to mark as "warming" if request takes longer than 2.5 seconds
    const warmingTimer = setTimeout(() => {
      setStatus((prev) => (prev === 'online' ? 'online' : 'warming'));
    }, 2500);

    try {
      const res = await api.get('/health', { timeout: 45000 });
      clearTimeout(warmingTimer);
      const duration = Date.now() - startTime;
      setLatency(duration);
      setLastChecked(new Date());

      if (res.status === 200 && res.data?.status === 'ok') {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (err: any) {
      clearTimeout(warmingTimer);
      setLatency(null);
      setLastChecked(new Date());

      // If timed out or network error, backend might be starting up or down
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.message?.includes('Network Error')) {
        setStatus('warming');
      } else {
        setStatus('offline');
      }
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Re-check backend health every 30 seconds
    const interval = setInterval(() => {
      checkHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <ServerStatusContext.Provider
      value={{
        status,
        latency,
        checkHealth,
        isWarmingUp: status === 'warming' || status === 'checking',
        lastChecked,
      }}
    >
      {children}
    </ServerStatusContext.Provider>
  );
};

export const useServerStatus = () => {
  const context = useContext(ServerStatusContext);
  if (!context) {
    throw new Error('useServerStatus must be used within a ServerStatusProvider');
  }
  return context;
};
