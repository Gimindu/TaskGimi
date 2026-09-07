'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle, ShieldCheck, User as UserIcon, Target } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login, user, error, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error handled by context
    } finally {
      setSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    clearError();
    setEmail('admin@taskgimi.com');
    setPassword('Admin@123456');
  };

  const fillNormalUserCredentials = () => {
    clearError();
    setEmail('jane@example.com');
    setPassword('Password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b] relative font-sans">
      <div className="w-full max-w-md bg-[#141417] border border-[#242429] p-8 rounded-3xl shadow-2xl z-10">
        {/* Workspace Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#18181b] border border-[#27272a] text-[#ff9f1c] mb-3 shadow-md">
            <Target className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-black text-2xl tracking-wider text-white uppercase">
            LESS TASK
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">Sign in to access your task management workspace</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start space-x-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-2xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#ff9f1c] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-2xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#ff9f1c] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-full bg-[#ff9f1c] hover:bg-amber-400 disabled:opacity-50 text-black font-heading font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Seed Logins */}
        <div className="mt-6 pt-6 border-t border-[#242429] text-center">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">
            Quick Seed Logins
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={fillAdminCredentials}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Seeded Admin</span>
            </button>
            <button
              onClick={fillNormalUserCredentials}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all"
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Seeded Normal User</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#ff9f1c] hover:underline font-bold">
            Register Normal User
          </Link>
        </p>
      </div>
    </div>
  );
}
