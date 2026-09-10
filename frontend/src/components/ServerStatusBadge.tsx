'use client';

import React, { useState } from 'react';
import { useServerStatus } from '../context/ServerStatusContext';
import { Server, RefreshCw, AlertTriangle, CheckCircle2, Clock, Info, X } from 'lucide-react';

interface ServerStatusBadgeProps {
  compact?: boolean;
}

export const ServerStatusBadge: React.FC<ServerStatusBadgeProps> = ({ compact = false }) => {
  const { status, latency, checkHealth } = useServerStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await checkHealth();
    setIsRefreshing(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'warming':
        return 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse';
      case 'offline':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'checking':
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      case 'warming':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping';
      case 'offline':
        return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
      case 'checking':
      default:
        return 'bg-blue-400 animate-pulse';
    }
  };

  const getLabelText = () => {
    switch (status) {
      case 'online':
        return latency ? `Backend Online (${latency}ms)` : 'Backend Online';
      case 'warming':
        return 'Backend Waking Up...';
      case 'offline':
        return 'Backend Offline';
      case 'checking':
      default:
        return 'Checking Backend...';
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${getStatusColor()}`}
        title="Click to view Backend Status & Render Hosting details"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${getDotColor()}`} />
        <span className="hidden sm:inline font-mono uppercase tracking-wider text-[11px]">
          {getLabelText()}
        </span>
        <span className="sm:hidden font-mono uppercase tracking-wider text-[10px]">
          {status === 'online' ? 'Online' : status === 'warming' ? 'Waking Up' : status === 'offline' ? 'Offline' : 'Checking'}
        </span>
        <Info className="w-3 h-3 opacity-60 hover:opacity-100 transition-opacity ml-0.5" />
      </button>

      {/* Backend Status & Render Info Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141417] border border-[#242429] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#ff9f1c]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white">Backend Server Status</h3>
                <p className="text-xs text-gray-400">Live health monitoring & Render instance info</p>
              </div>
            </div>

            {/* Status Card */}
            <div className={`p-4 rounded-xl border mb-4 ${getStatusColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-3 h-3 rounded-full ${getDotColor()}`} />
                  <span className="font-mono font-bold text-sm uppercase">{getLabelText()}</span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-gray-200 text-xs font-bold transition-all flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Ping</span>
                </button>
              </div>
            </div>

            {/* Render Cold Start Notice for Examiners */}
            <div className="space-y-3 bg-[#09090b] border border-[#242429] p-4 rounded-xl text-xs text-gray-300">
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
                className="px-5 py-2 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-heading font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
