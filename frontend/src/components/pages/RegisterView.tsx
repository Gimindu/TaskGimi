'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useServerStatus } from '../../context/ServerStatusContext';
import { RenderColdStartNotice } from '../RenderColdStartNotice';
import { UserPlus, User, Mail, Key, AlertCircle, Info, CheckCircle2, Target, Loader2 } from 'lucide-react';

export function RegisterView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const { register, user, error } = useAuth();
  const { isWarmingUp } = useServerStatus();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setSubmitting(true);
    setPendingNotice(null);
    try {
      const res = await register(name, email, password);
      if (res && res.isApproved === false) {
        setPendingNotice(res.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      // Error handled by context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b] relative font-sans">
      <div className="w-full max-w-md">
        {/* Render Free Tier Cold Start Notice */}
        <RenderColdStartNotice />

        <div className="w-full bg-[#141417] border border-[#242429] p-8 rounded-3xl shadow-2xl z-10">
          {/* Workspace Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#18181b] border border-[#27272a] text-[#ff9f1c] mb-3 shadow-md">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-black text-2xl tracking-wider text-white uppercase">
              LESS TASK
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">Create a new normal user account</p>
          </div>

          {/* Pending Approval Success Notice */}
          {pendingNotice ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-white">Registration Successful!</h3>
              <p className="text-xs text-emerald-300/90 leading-relaxed font-medium">{pendingNotice}</p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Notice Info Pill */}
              <div className="mb-6 flex items-start space-x-2.5 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Normal user accounts require Administrator approval before logging in.</span>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 flex items-start space-x-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-2xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#ff9f1c] transition-all"
                    />
                  </div>
                </div>

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
                      placeholder="john@example.com"
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
                      placeholder="At least 6 characters"
                      minLength={6}
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
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isWarmingUp ? 'Waking backend (~30s)...' : 'Registering...'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                Already have an account?{' '}
                <Link href="/login" className="text-[#ff9f1c] hover:underline font-bold">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
