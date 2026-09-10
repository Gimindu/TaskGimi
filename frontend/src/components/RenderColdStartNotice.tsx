'use client';

import React, { useState } from 'react';
import { useServerStatus } from '../context/ServerStatusContext';
import { Clock, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface RenderColdStartNoticeProps {
  hideWhenOnline?: boolean;
}

export const RenderColdStartNotice: React.FC<RenderColdStartNoticeProps> = ({
  hideWhenOnline = true,
}) => {
  const { status, latency, checkHealth } = useServerStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // If status is online and hideWhenOnline is enabled, do not render on screen
  if (hideWhenOnline && status === 'online') {
    return null;
  }

  const handlePing = async () => {
    setIsRefreshing(true);
    await checkHealth();
    setIsRefreshing(false);
  };

  return (
    <div className="mb-5 rounded-xl bg-[#141417] border border-amber-500/40 p-3.5 text-xs shadow-lg transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-extrabold text-white text-xs uppercase tracking-wide">
                Render Cold-Start Notice
              </span>
              <span
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  status === 'warming'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                    : status === 'offline'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === 'warming'
                      ? 'bg-amber-400 animate-ping'
                      : status === 'offline'
                      ? 'bg-red-400'
                      : 'bg-blue-400'
                  }`}
                />
                <span>
                  {status === 'warming'
                    ? 'Waking up...'
                    : status === 'offline'
                    ? 'Offline'
                    : 'Checking...'}
                </span>
              </span>
            </div>
            <p className="text-gray-400 text-[11px] mt-0.5">
              {status === 'warming'
                ? 'Backend server is spinning up (~30-50s delay on first load)'
                : status === 'offline'
                ? 'Cannot connect to backend service'
                : 'Verifying server connection...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handlePing}
            disabled={isRefreshing}
            title="Re-check server health"
            className="p-1 rounded-lg bg-[#242429] hover:bg-[#2e2e35] text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Details'}
            className="p-1 rounded-lg bg-[#242429] hover:bg-[#2e2e35] text-gray-300 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-[#27272a] text-gray-300 text-[11px] leading-relaxed">
          <p>
            <strong className="text-amber-300">Note for Examiner:</strong> Render free-tier backends automatically sleep after 15 mins of inactivity.
            Initial requests take 30-50s to wake up the server. Subsequent requests will respond instantly (&lt;200ms).
          </p>
        </div>
      )}
    </div>
  );
};
