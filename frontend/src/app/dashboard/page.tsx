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
import { ConfirmModal } from '../../components/ConfirmModal';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Search, Filter, Loader2, RefreshCw, Flame } from 'lucide-react';

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

  // Handle DND status change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error('Failed to persist task status change:', err);
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

  // Handle Claim Task
  const handleClaimTask = async (taskId: string) => {
    try {
      const currentUserId = user?.id || user?._id;
      const res = await api.patch(`/tasks/${taskId}/assign`, { targetUserId: currentUserId });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error('Failed to claim task:', err);
    }
  };

  // Handle Reassign Task
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

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Task Board..." submessage="Fetching tasks and workspace data" />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans">
      {/* Workspace Header */}
      <Navbar
        onOpenCreateModal={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* Workspace Title & Search/Filter Pills (Matching Reference UI) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="font-heading font-black text-2xl tracking-wide text-white uppercase">
              {isAdmin ? 'All Tasks' : 'My Tasks'}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#18181b] border border-[#ff9f1c]/40 text-[#ff9f1c]">
              {filteredTasks.length}
            </span>
          </div>

          {/* Filter Pills Bar (Matching Reference UI: "All", "🔥 Hot", Status Pills) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input Pill */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-3.5 py-1.5 bg-[#141417] border border-[#242429] rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9f1c] w-40 sm:w-48"
              />
            </div>

            {/* Filter Status Pills */}
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-1 rounded-full text-xs font-black transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#141417] text-gray-400 border border-[#242429] hover:text-white'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setStatusFilter('To Do')}
              className={`inline-flex items-center space-x-1 px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                statusFilter === 'To Do'
                  ? 'bg-[#ff9f1c] text-black shadow-md'
                  : 'bg-[#141417] text-amber-400 border border-[#242429] hover:border-amber-500/50'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>To Do</span>
            </button>

            <button
              onClick={() => setStatusFilter('Doing')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                statusFilter === 'Doing'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#141417] text-emerald-400 border border-[#242429] hover:border-emerald-500/50'
              }`}
            >
              Doing
            </button>

            <button
              onClick={() => setStatusFilter('Done')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                statusFilter === 'Done'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-[#141417] text-red-400 border border-[#242429] hover:border-red-500/50'
              }`}
            >
              Done
            </button>

            <button
              onClick={() => {
                fetchTasks();
                fetchUsers();
              }}
              title="Refresh Board"
              className="p-1.5 rounded-full bg-[#141417] border border-[#242429] text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview tasks={tasks} usersCount={allUsers.length} isAdmin={isAdmin} />

        {/* Kanban Board */}
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

      {/* Task Modal */}
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
