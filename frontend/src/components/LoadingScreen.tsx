'use client';

import React from 'react';
import { Target, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading Workspace...',
  submessage = 'Organizing your tasks and syncing live workspace data',
}) => {
  return (
    <div className="min-h-screen w-full bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none z-50">
      {/* Dynamic Glow Orbs in Background */}
      <div className="absolute w-[500px] h-[500px] bg-[#ff9f1c]/10 rounded-full blur-3xl animate-pulse pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[400px] h-[400px] bg-[#ff9f1c]/5 rounded-full blur-3xl animate-pulse pointer-events-none -bottom-24 -right-24" />

      {/* Main Glassmorphic Container */}
      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-sm w-full mx-auto">
        {/* Brand Icon with Pulsing Halo */}
        <div className="relative mb-6 group">
          {/* Animated Spinner Ring */}
          <div className="absolute -inset-3 rounded-full border-2 border-transparent border-t-[#ff9f1c] border-r-[#ff9f1c]/40 animate-spin" />
          <div className="absolute -inset-6 rounded-full border border-[#ff9f1c]/20 animate-ping opacity-25" />

          {/* Logo Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[#141417] border border-[#242429] shadow-2xl flex items-center justify-center relative z-10">
            <Target className="w-8 h-8 text-[#ff9f1c] animate-pulse" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-heading font-black text-xl tracking-widest text-white uppercase">
            LESS TASK
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#ff9f1c]/10 border border-[#ff9f1c]/30 text-[#ff9f1c] text-[10px] font-black tracking-wider uppercase">
            PRO
          </span>
        </div>

        {/* Main Loading Status Text */}
        <h2 className="font-heading font-extrabold text-sm text-gray-200 mb-1 flex items-center space-x-2">
          <span>{message}</span>
        </h2>

        <p className="text-xs text-gray-500 font-normal leading-relaxed max-w-xs mb-6">
          {submessage}
        </p>

        {/* Pulsing Progress Bar */}
        <div className="w-48 h-1.5 bg-[#141417] border border-[#242429] rounded-full overflow-hidden relative shadow-inner">
          <div className="h-full bg-gradient-to-r from-amber-600 via-[#ff9f1c] to-amber-300 rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
};
