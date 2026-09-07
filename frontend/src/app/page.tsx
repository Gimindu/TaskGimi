'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';
import {
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutGrid,
  CheckCircle2,
  Users,
  Sparkles,
  Flame,
  Clock,
  Layers,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
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
    <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans selection:bg-[#ff9f1c] selection:text-black relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute w-[600px] h-[600px] bg-[#ff9f1c]/10 rounded-full blur-3xl pointer-events-none -top-40 left-1/2 -translate-x-1/2" />
      <div className="absolute w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none top-96 -right-20" />

      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 w-full bg-[#09090b]/90 backdrop-blur-xl border-b border-[#242429] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-amber-500 group-hover:border-[#ff9f1c] transition-all shadow-lg">
              <Target className="w-5 h-5 text-[#ff9f1c]" />
            </div>
            <span className="font-heading font-black text-2xl tracking-wider text-white uppercase">
              LESS TASK
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Board Preview
            </a>
          </nav>

          {/* CTA Header Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-lg active:scale-95"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white hover:bg-gray-200 text-black font-extrabold text-xs transition-all shadow-md active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Pill Highlight Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#141417] border border-[#242429] text-xs font-bold text-[#ff9f1c] shadow-lg animate-fade-in">
          <Zap className="w-3.5 h-3.5 text-[#ff9f1c]" />
          <span>Next-Gen Workspace Task Management</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f1c] animate-pulse" />
        </div>

        {/* Hero Title */}
        <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Do More. Stress Less.{' '}
          <span className="bg-gradient-to-r from-[#ff9f1c] via-amber-300 to-amber-500 bg-clip-text text-transparent">
            Task Clarity
          </span>{' '}
          Redefined.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-normal">
          The minimal, lightning-fast Kanban workspace designed for team speed and focus. Organize tasks, manage roles, and complete goals seamlessly.
        </p>

        {/* Hero CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={user ? '/dashboard' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-heading font-black text-sm tracking-wide transition-all shadow-xl shadow-orange-500/20 active:scale-95"
          >
            <span>{user ? 'Open Workspace Board' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>

          {!user && (
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full bg-[#141417] hover:bg-[#1f1f23] border border-[#242429] hover:border-[#ff9f1c]/40 text-gray-200 font-extrabold text-sm transition-all shadow-md"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          )}
        </div>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 pt-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Role-Based Access Control</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Drag & Drop Kanban Board</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Admin Signup Approvals</span>
          </div>
        </div>
      </section>

      {/* Interactive Board Preview Section */}
      <section id="preview" className="px-4 sm:px-8 max-w-7xl mx-auto py-12">
        <div className="bg-[#141417] border border-[#242429] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#242429] pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-gray-500 ml-2">less-task.app/dashboard</span>
            </div>
            <span className="text-xs font-extrabold text-[#ff9f1c] bg-[#ff9f1c]/10 border border-[#ff9f1c]/30 px-3 py-1 rounded-full uppercase">
              Live Preview
            </span>
          </div>

          {/* Kanban Board Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: To Do */}
            <div className="bg-[#09090b] border border-[#242429] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-2">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>To Do</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#18181b] text-[#ff9f1c]">2</span>
              </div>

              <div className="bg-[#141417] border border-[#242429] p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">To Do</span>
                  <span className="text-[10px] text-gray-500">Alex R.</span>
                </div>
                <h4 className="font-heading font-bold text-xs text-white">Setup MongoDB Atlas Indexes</h4>
                <p className="text-[11px] text-gray-400">Optimize search query performance across user task assignments.</p>
              </div>

              <div className="bg-[#141417] border border-[#242429] p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">To Do</span>
                  <span className="text-[10px] text-gray-500">Sarah M.</span>
                </div>
                <h4 className="font-heading font-bold text-xs text-white">Design Mobile Navigation Menu</h4>
                <p className="text-[11px] text-gray-400">Create responsive drawer for smaller touch viewports.</p>
              </div>
            </div>

            {/* Column 2: Doing */}
            <div className="bg-[#09090b] border border-[#242429] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Doing</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#18181b] text-emerald-400">1</span>
              </div>

              <div className="bg-gradient-to-br from-[#ff9f1c] via-[#f97316] to-[#ea580c] text-black p-4 rounded-xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/20 text-black uppercase">In Progress</span>
                  <span className="text-[10px] font-bold text-black/80">Jane Doe (Admin)</span>
                </div>
                <h4 className="font-heading font-black text-sm text-black">Refactor Auth JWT Middleware</h4>
                <p className="text-[11px] font-medium text-black/90">Enhance RBAC role verification for user directory approval workflow.</p>
              </div>
            </div>

            {/* Column 3: Done */}
            <div className="bg-[#09090b] border border-[#242429] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Done</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#18181b] text-red-400">1</span>
              </div>

              <div className="bg-[#141417] border border-[#242429] p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Done</span>
                  <span className="text-[10px] text-gray-500">Jane Doe</span>
                </div>
                <h4 className="font-heading font-bold text-xs text-white">Theme & UI Palette Overhaul</h4>
                <p className="text-[11px] text-gray-400">Applied pitch-black canvas and warm golden accents across all pages.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-4 sm:px-8 max-w-7xl mx-auto py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-[#ff9f1c]/10 text-[#ff9f1c] border border-[#ff9f1c]/30 text-xs font-black uppercase tracking-wider">
            Engineered For Speed
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
            Built to keep your focus where it matters most.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#141417] border border-[#242429] hover:border-[#ff9f1c]/40 p-6 rounded-3xl transition-all shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#ff9f1c]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-white">Fluid Drag & Drop</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Organize tasks across To Do, Doing, and Done columns with smooth animation feedback and instant API synchronization.
            </p>
          </div>

          <div className="bg-[#141417] border border-[#242429] hover:border-[#ff9f1c]/40 p-6 rounded-3xl transition-all shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-white">Admin Approval Workflow</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Prevent unauthorized spam signups. New user accounts require explicit system administrator approval before logging in.
            </p>
          </div>

          <div className="bg-[#141417] border border-[#242429] hover:border-[#ff9f1c]/40 p-6 rounded-3xl transition-all shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-white">Dedicated User Profile</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Track individual member performance, assigned workloads, created task lists, and joined account statistics.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action Banner */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto pb-20">
        <div className="bg-gradient-to-r from-[#1c140a] via-[#241a0b] to-[#141417] border border-[#3f2a10] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
              Ready to streamline your workspace tasks?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Join Less Task today to experience clean, distraction-free task management with real-time updates.
            </p>
            <div className="pt-2">
              <Link
                href={user ? '/dashboard' : '/register'}
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-heading font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
              >
                <span>Launch Workspace Now</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#242429] bg-[#09090b] py-8 text-center text-xs text-gray-500 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Target className="w-4 h-4 text-[#ff9f1c]" />
          <span className="font-heading font-extrabold text-gray-300">LESS TASK</span>
        </div>
        <p>© 2026 Less Task Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
