'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutGrid } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Less Task Unhandled Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-[#141417] border border-[#242429] p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
            Workspace Error
          </span>
          <h1 className="font-heading font-black text-2xl text-white tracking-wide uppercase pt-2">
            Something Went Wrong
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
            An unexpected error occurred while rendering your workspace. Don't worry, your task data is safe.
          </p>
        </div>

        {error?.message && (
          <div className="p-3.5 bg-[#09090b] border border-[#242429] rounded-2xl text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-lg active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-[#18181b] hover:bg-gray-200 hover:text-black border border-[#27272a] text-gray-200 font-extrabold text-xs transition-all shadow-md"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Go to Board</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
