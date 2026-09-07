'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { User, Task } from '../../../types';
import { Navbar } from '../../../components/Navbar';
import { AdminUserList } from '../../../components/AdminUserList';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { ShieldCheck, Users, Clock, CheckCircle2, Search, Loader2, RefreshCw, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export default function AdminUserManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users directory:', err);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setLoading(true);
        Promise.all([fetchUsers(), fetchTasks()]).finally(() => setLoading(false));
      }
    }
  }, [user, authLoading, router, fetchUsers, fetchTasks]);

  const handleApproveUser = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/approve`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const handleDeclineUser = (userId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Decline / Remove User',
      message: 'Are you sure you want to decline or remove this user account? This will permanently delete the account.',
      confirmText: 'Remove User',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${userId}`);
          fetchUsers();
          fetchTasks();
        } catch (err) {
          console.error('Failed to remove user:', err);
        }
      },
    });
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingUsersCount = users.filter((u) => u.isApproved === false).length;
  const approvedUsersCount = users.filter((u) => u.isApproved !== false).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-gray-200">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-medium text-gray-400">Loading User Directory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>User Management Directory</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold uppercase tracking-wide">
                Admin Exclusive
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Approve pending signups, inspect user roles, and manage system accounts
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-medium transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Back to Task Board</span>
            </Link>

            <button
              onClick={() => {
                fetchUsers();
                fetchTasks();
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* User Statistics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-gray-800">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Total Users</p>
              <p className="text-2xl font-extrabold text-white mt-1">{users.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-amber-500/30 bg-amber-500/5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Pending Approvals</p>
              <p className="text-2xl font-extrabold text-amber-300 mt-1">{pendingUsersCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-emerald-500/30 bg-emerald-500/5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Approved Accounts</p>
              <p className="text-2xl font-extrabold text-emerald-300 mt-1">{approvedUsersCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 mb-6 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-9 pr-3 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Admin User Management Directory Table */}
        <AdminUserList
          users={filteredUsers}
          tasks={tasks}
          onApproveUser={handleApproveUser}
          onDeclineUser={handleDeclineUser}
        />
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
