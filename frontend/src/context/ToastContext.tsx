'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Flame, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (title: string, type?: ToastType, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, type: ToastType = 'success', message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-3">
        {toasts.map((toast) => {
          let bgClass = 'bg-[#141417] border-emerald-500/40 text-emerald-300';
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;

          if (toast.type === 'error') {
            bgClass = 'bg-[#141417] border-red-500/40 text-red-300';
            icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
          } else if (toast.type === 'info') {
            bgClass = 'bg-[#141417] border-blue-500/40 text-blue-300';
            icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-[#141417] border-amber-500/40 text-amber-300';
            icon = <Flame className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl animate-fadeIn transition-all ${bgClass}`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{icon}</div>
                <div>
                  <h4 className="font-heading font-extrabold text-xs text-white">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed font-medium">
                      {toast.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
