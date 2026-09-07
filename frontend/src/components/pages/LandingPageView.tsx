'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from '../LoadingScreen';
import {
  Target,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Users,
  Layers,
  Circle,
  CheckCircle2,
} from 'lucide-react';

export function LandingPageView() {
  const { user, loading: authLoading } = useAuth();
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Initial landing page loading timer for smooth splash effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (authLoading || initialLoading) {
    return (
      <LoadingScreen
        message="Initializing Less Task..."
        submessage="Setting up workspace environment & theme engine"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans selection:bg-[#ff9f1c] selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-[#09090b]/90 backdrop-blur-xl border-b border-[#242429] px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center">
              <Target className="w-4 h-4 text-[#ff9f1c]" />
            </div>
            <span className="font-heading font-black text-lg tracking-wide text-white uppercase">
              Less Task
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm text-gray-400">
            <a href="#workflow" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-bold text-sm transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-sm transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto pt-16 pb-20 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
        <div className="space-y-7">
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-white leading-[1.15] max-w-lg">
            Fewer tasks in progress. More things finished.
          </h1>

          <p className="text-base text-gray-400 leading-relaxed max-w-md">
            Less Task is a three-column workspace built around one rule: a task
            only moves forward. To Do, Doing, Done — nothing sits in five
            different lists, and nothing gets lost in a backlog nobody opens.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-heading font-black text-sm transition-colors"
            >
              <span>{user ? 'Open your board' : 'Start a workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!user && (
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Already have an account? Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Task panel */}
        <div className="bg-[#141417] border border-[#242429] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#242429]">
            <div>
              <p className="text-sm font-bold text-white">Product Launch</p>
              <p className="text-xs text-gray-500">3 members · updated 2m ago</p>
            </div>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 ring-2 ring-[#141417] flex items-center justify-center text-[10px] font-bold text-black">
                AR
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-500 ring-2 ring-[#141417] flex items-center justify-center text-[10px] font-bold text-black">
                SM
              </div>
              <div className="w-7 h-7 rounded-full bg-[#ff9f1c] ring-2 ring-[#141417] flex items-center justify-center text-[10px] font-bold text-black">
                JD
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 py-2">
            <Circle className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-200">
                Setup MongoDB Atlas indexes
              </p>
              <p className="text-xs text-gray-500">Alex R. · To Do</p>
            </div>
          </div>

          <div className="flex items-start gap-3 py-3 px-3 -mx-3 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 shadow-md shadow-blue-500/20">
            <Circle className="w-4 h-4 text-white/70 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">
                Refactor auth JWT middleware
              </p>
              <p className="text-xs text-white/80">Jane Doe · Doing</p>
            </div>
          </div>

          <div className="flex items-start gap-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-500 line-through decoration-gray-600">
                Theme & UI palette overhaul
              </p>
              <p className="text-xs text-gray-600">Jane Doe · Done</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="px-4 sm:px-8 max-w-6xl mx-auto py-14 border-t border-[#242429]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-heading font-black text-gray-700">1</span>
              <span className="font-heading font-bold text-white">To Do</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Anyone on the team can add a task and hand it a description,
              nothing more required to get it on the board.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-heading font-black text-gray-700">2</span>
              <span className="font-heading font-bold text-white">Doing</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              One person claims it, it gets an owner, and it stays visible to
              the whole workspace until it's finished.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-heading font-black text-gray-700">3</span>
              <span className="font-heading font-bold text-white">Done</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              It drops here and stays here — no reopening, no second column
              for "actually done" tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-8 max-w-6xl mx-auto py-14 border-t border-[#242429]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-[#141417] border border-[#242429] rounded-2xl p-8 space-y-4">
            <ShieldCheck className="w-6 h-6 text-[#ff9f1c]" />
            <h3 className="font-heading font-bold text-xl text-white">
              Nothing ships without a nod
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              New accounts sit in a pending state until an admin approves
              them. No open signup, no spam accounts sitting in your member
              list — someone in the workspace always knows who's joining
              before they can log in.
            </p>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex-1 border border-[#242429] rounded-2xl p-6 space-y-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h4 className="font-heading font-bold text-white text-sm">
                Drag between columns
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Moves sync instantly, no refresh needed to see where things stand.
              </p>
            </div>
            <div className="flex-1 border border-[#242429] rounded-2xl p-6 space-y-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h4 className="font-heading font-bold text-white text-sm">
                A profile per person
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                See what someone's carrying and what they've already closed out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto py-16 border-t border-[#242429]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <h2 className="font-heading font-bold text-2xl text-white max-w-sm">
            Set up your workspace in the time it takes to read this sentence.
          </h2>
          <Link
            href={user ? '/dashboard' : '/register'}
            className="inline-flex items-center space-x-2 px-7 py-3 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-heading font-black text-sm transition-colors shrink-0"
          >
            <span>{user ? 'Open your board' : 'Start a workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#242429] py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-[#ff9f1c]" />
            <span className="font-heading font-bold text-gray-300">Less Task</span>
          </div>
          <p>© 2026 Less Task Inc.</p>
        </div>
      </footer>
    </div>
  );
}
