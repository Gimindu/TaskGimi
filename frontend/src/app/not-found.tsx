'use client';

import React from 'react';
import Link from 'next/link';
import { Target, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-[#141417] border border-[#242429] p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#ff9f1c] mx-auto shadow-lg">
          <Target className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-[#ff9f1c]/10 border border-[#ff9f1c]/30 text-[#ff9f1c] text-xs font-black uppercase tracking-wider">
            404 - Page Not Found
          </span>
          <h1 className="font-heading font-black text-2xl text-white tracking-wide uppercase pt-2">
            Lost in the Workspace?
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
            The page or resource you are trying to access does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Task Board</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
