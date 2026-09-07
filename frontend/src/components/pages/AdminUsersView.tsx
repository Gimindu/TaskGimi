'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { User, Task } from '../../types';
import { Navbar } from '../Navbar';
import { AdminUserList } from '../AdminUserList';
import { ConfirmModal } from '../ConfirmModal';
import { LoadingScreen } from '../LoadingScreen';
import { ShieldCheck, Users, Clock, CheckCircle2, Search, RefreshCw, LayoutGrid } from 'lucide-react';

export function AdminUsersView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      message: 'Are you sure you want to decline or remove this user account? This action cannot be undone.',
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
    return <LoadingScreen message="Loading Directory..." submessage="Fetching user accounts & workspace permissions" />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6 pb-16 sm:pb-6">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading font-black text-xl sm:text-2xl tracking-wide text-white uppercase flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-[#ff9f1c]" />
              <span>User Directory</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold uppercase tracking-wider">
                Admin Exclusive
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Approve pending user signups and manage system accounts
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#141417] border border-[#242429] text-gray-300 hover:text-white text-xs font-bold transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Task Board</span>
            </Link>

            <button
              onClick={() => {
                fetchUsers();
                fetchTasks();
              }}
              className="p-2 rounded-full bg-[#141417] border border-[#242429] text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-[#141417] border border-[#242429] p-4 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Total Users</p>
              <p className="font-heading text-2xl font-black text-white mt-0.5">{users.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-[#141417] border border-amber-500/30 p-4 rounded-3xl flex items-center justify-between shadow-md bg-amber-500/5">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff9f1c]">Pending Approvals</p>
              <p className="font-heading text-2xl font-black text-[#ff9f1c] mt-0.5">{pendingUsersCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-[#ff9f1c] flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-[#141417] border border-emerald-500/30 p-4 rounded-3xl flex items-center justify-between shadow-md bg-emerald-500/5">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Approved Accounts</p>
              <p className="font-heading text-2xl font-black text-emerald-300 mt-0.5">{approvedUsersCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#141417] border border-[#242429] p-3 rounded-2xl mb-6 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-[#09090b] border border-[#27272a] rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9f1c]"
            />
          </div>
        </div>

        {/* User Directory Table */}
        <AdminUserList
          users={filteredUsers}
          tasks={tasks}
          onApproveUser={handleApproveUser}
          onDeclineUser={handleDeclineUser}
        />
      </main>

      {/* Confirm Modal */}
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
