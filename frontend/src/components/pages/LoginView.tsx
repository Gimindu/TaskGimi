'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ShieldCheck, User as UserIcon, Target } from 'lucide-react';

export function LoginView() {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b] font-sans">
      <div className="w-full max-w-md">
        <div className="flex items-center space-x-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center">
            <Target className="w-4 h-4 text-[#ff9f1c]" />
          </div>
          <span className="font-heading font-black text-lg tracking-wide text-white uppercase">
            Less Task
          </span>
        </div>

        <div className="bg-[#141417] border border-[#242429] rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-xl text-white">Sign in</h1>
            <p className="text-sm text-gray-400 mt-1">
              Welcome back - enter your details to open your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff9f1c] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff9f1c] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-full bg-[#ff9f1c] hover:bg-amber-400 disabled:opacity-50 text-black font-heading font-bold text-sm transition-colors mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{submitting ? 'Signing in…' : 'Sign in'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#242429]">
            <p className="text-sm text-gray-400 mb-3">
              Testing the app? Fill in a seeded account:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={fillAdminCredentials}
                type="button"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl border border-[#242429] hover:border-amber-500/40 hover:bg-amber-500/5 text-gray-300 text-sm font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </button>
              <button
                onClick={fillNormalUserCredentials}
                type="button"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl border border-[#242429] hover:border-blue-500/40 hover:bg-blue-500/5 text-gray-300 text-sm font-medium transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Regular user</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#ff9f1c] hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
