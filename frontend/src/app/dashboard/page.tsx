'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Task, TaskStatus, User } from '../../types';
import { Navbar } from '../../components/Navbar';
import { StatsOverview } from '../../components/StatsOverview';
import { KanbanBoard } from '../../components/KanbanBoard';
import { TaskModal } from '../../components/TaskModal';
import { AdminUserList } from '../../components/AdminUserList';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Search, Filter, Loader2, RefreshCw, Plus, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Custom Confirmation Modal State
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

  const isAdmin = user?.role === 'admin';

  // Fetch Tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  }, []);

  // Fetch Users List (Admin Only)
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/users');
      setAllUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(true);
        Promise.all([fetchTasks(), fetchUsers()]).finally(() => setLoading(false));
      }
    }
  }, [user, authLoading, router, fetchTasks, fetchUsers]);

  // Handle DND status change (Optimistic UI update + API Call)
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic local state update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      // Update with populated task from server
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error('Failed to persist task status change:', err);
      // Re-fetch on error to revert state
      fetchTasks();
    }
  };

  // Handle Create / Update Task Submit
  const handleSaveTask = async (data: {
    title: string;
    description: string;
    status: TaskStatus;
    assignedUser?: string | null;
  }) => {
    if (editingTask) {
      const res = await api.put(`/tasks/${editingTask._id}`, data);
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
    } else {
      const res = await api.post('/tasks', data);
      setTasks((prev) => [res.data, ...prev]);
    }
    fetchTasks();
    if (isAdmin) fetchUsers();
  };

  // Handle Claim Task (Normal user claims unassigned task)
  const handleClaimTask = async (taskId: string) => {
    try {
      const currentUserId = user?.id || user?._id;
      const res = await api.patch(`/tasks/${taskId}/assign`, { targetUserId: currentUserId });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error('Failed to claim task:', err);
    }
  };

  // Handle Reassign Task (Admin reassigns to any user)
  const handleReassignTask = async (taskId: string, targetUserId: string) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/assign`, { targetUserId: targetUserId || null });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      fetchUsers();
    } catch (err) {
      console.error('Failed to reassign task:', err);
    }
  };

  // Handle Delete Task
  const handleDeleteTask = (taskId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete Task',
      onConfirm: async () => {
        try {
          await api.delete(`/tasks/${taskId}`);
          setTasks((prev) => prev.filter((t) => t._id !== taskId));
        } catch (err) {
          console.error('Failed to delete task:', err);
        }
      },
    });
  };

  // Handle Approve User (Admin action)
  const handleApproveUser = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/approve`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  // Handle Decline / Remove User (Admin action)
  const handleDeclineUser = (userId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Decline / Remove User',
      message: 'Are you sure you want to decline or remove this user account? This will remove the user from the system.',
      confirmText: 'Remove User',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${userId}`);
          fetchUsers();
          fetchTasks();
        } catch (err) {
          console.error('Failed to decline user:', err);
        }
      },
    });
  };

  // Filter tasks based on search query & status filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-gray-200">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium text-gray-400">Loading workspace data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col">
      {/* Header Navbar */}
      <Navbar
        onOpenCreateModal={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* Dashboard Title & Overview Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight flex items-center space-x-2">
              <span>{isAdmin ? 'Administrator Workspace' : 'My Task Board'}</span>
              {isAdmin && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold uppercase tracking-wide">
                  Global Access
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {isAdmin
                ? 'Overview of all tasks and user assignments across the system'
                : 'Drag and drop cards to change task status in real time'}
            </p>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              fetchTasks();
              fetchUsers();
            }}
            className="self-start md:self-auto flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Board</span>
          </button>
        </div>

        {/* Stats Overview */}
        <StatsOverview tasks={tasks} usersCount={allUsers.length} isAdmin={isAdmin} />

        {/* Admin Quick Banner to Dedicated User Directory Page */}
        {isAdmin && (
          <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-100 flex items-center space-x-2">
                  <span>User Directory & Approvals</span>
                  {allUsers.filter((u) => u.isApproved === false).length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold animate-pulse">
                      {allUsers.filter((u) => u.isApproved === false).length} Pending Approval
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Manage registered users, approve new accounts, and inspect assignments in the dedicated directory.
                </p>
              </div>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition-all shadow-md shrink-0"
            >
              <span>Manage Users Page</span>
            </Link>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="glass-panel p-4 rounded-xl border border-gray-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title..."
              className="w-full pl-9 pr-3 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Filter:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="Doing">Doing</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        {/* DND Kanban Board */}
        <KanbanBoard
          tasks={filteredTasks}
          currentUser={user}
          allUsers={allUsers}
          onStatusChange={handleStatusChange}
          onEdit={(task) => {
            setEditingTask(task);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteTask}
          onClaim={handleClaimTask}
          onReassign={handleReassignTask}
        />
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        currentUser={user}
        allUsers={allUsers}
      />

      {/* Custom Confirmation Modal */}
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
