'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useServerStatus } from '../context/ServerStatusContext';
import { Server, RefreshCw, Clock, Info, X } from 'lucide-react';

export const ServerStatusBadge: React.FC = () => {
  const { status, latency, checkHealth } = useServerStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await checkHealth();
    setIsRefreshing(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'warming': return 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse';
      case 'offline': return 'bg-red-500/10 border-red-500/30 text-red-400';
      default: return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'online': return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      case 'warming': return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping';
      case 'offline': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
      default: return 'bg-blue-400 animate-pulse';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'online': return latency ? `Backend Online (${latency}ms)` : 'Backend Online';
      case 'warming': return 'Backend Waking Up...';
      case 'offline': return 'Backend Offline';
      default: return 'Checking Backend...';
    }
  };

  const modal = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-[#141417] border border-[#242429] w-full max-w-md rounded-3xl p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#ff9f1c] shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-white">Backend Server Status</h3>
            <p className="text-xs text-gray-400">Live health monitoring & Render instance info</p>
          </div>
        </div>

        {/* Status Card */}
        <div className={`p-4 rounded-2xl border mb-4 ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className={`w-3 h-3 rounded-full ${getDotColor()}`} />
              <span className="font-mono font-bold text-sm uppercase">{getLabel()}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 px-3 rounded-full bg-black/30 hover:bg-black/50 text-gray-200 text-xs font-bold transition-all flex items-center space-x-1 border border-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Ping</span>
            </button>
          </div>
        </div>

        {/* Render Notice */}
        <div className="space-y-3 bg-[#09090b] border border-[#242429] p-4 rounded-2xl text-xs text-gray-300">
          <div className="flex items-start space-x-2 text-amber-400 font-bold">
            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Notice for Examiner / Evaluator:</span>
          </div>
          <p className="text-gray-300 leading-relaxed">
            This project is hosted on <strong className="text-white">Render.com Free Tier</strong>.
            Render automatically puts backend web services into a <strong className="text-amber-300">sleep state</strong> after 15 minutes of inactivity.
          </p>
          <p className="text-gray-400 leading-relaxed">
            When sending the first request (e.g. initial login or task fetch), Render requires <strong className="text-amber-400">30–50 seconds</strong> to spin up the container cold start. Subsequent requests will respond instantly (&lt; 200ms).
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2.5 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-heading font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${getStatusColor()}`}
        title="Click to view Backend Status & Render Hosting details"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${getDotColor()}`} />
        <span className="hidden sm:inline font-mono uppercase tracking-wider text-[11px]">
          {getLabel()}
        </span>
        <span className="sm:hidden font-mono uppercase tracking-wider text-[10px]">
          {status === 'online' ? 'Online' : status === 'warming' ? 'Waking Up' : status === 'offline' ? 'Offline' : 'Checking'}
        </span>
        <Info className="w-3 h-3 opacity-60 hover:opacity-100 transition-opacity ml-0.5" />
      </button>

      {/* Portal renders modal at document.body to escape all parent stacking contexts */}
      {mounted && showModal && createPortal(modal, document.body)}
    </>
  );
};
