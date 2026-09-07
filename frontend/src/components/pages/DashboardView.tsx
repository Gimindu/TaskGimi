'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Task, TaskStatus, User } from '../../types';
import { Navbar } from '../Navbar';
import { StatsOverview } from '../StatsOverview';
import { KanbanBoard } from '../KanbanBoard';
import { TaskModal } from '../TaskModal';
import { ConfirmModal } from '../ConfirmModal';
import { LoadingScreen } from '../LoadingScreen';
import { Search, RefreshCw, Flame, Users } from 'lucide-react';

export function DashboardView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');

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

    const assignedId =
      typeof task.assignedUser === 'object' && task.assignedUser
        ? task.assignedUser._id || task.assignedUser.id
        : typeof task.assignedUser === 'string'
        ? task.assignedUser
        : null;

    const currentUserId = user?.id || user?._id;

    let matchesUser = true;
    if (userFilter === 'UNASSIGNED') {
      matchesUser = !assignedId;
    } else if (userFilter === 'ME') {
      matchesUser = assignedId === currentUserId;
    } else if (userFilter.startsWith('USER_')) {
      const targetId = userFilter.replace('USER_', '');
      matchesUser = assignedId === targetId;
    }

    return matchesSearch && matchesStatus && matchesUser;
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6">
        {/* Workspace Title & Search/Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <div className="flex items-center space-x-3">
              <h1 className="font-heading font-black text-xl sm:text-2xl tracking-wide text-white uppercase">
                {isAdmin ? 'All Tasks' : 'My Tasks'}
              </h1>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-black bg-[#18181b] border border-[#ff9f1c]/40 text-[#ff9f1c]">
                {filteredTasks.length}
              </span>
            </div>

            {/* Quick Refresh on Mobile */}
            <button
              onClick={() => {
                fetchTasks();
                fetchUsers();
              }}
              title="Refresh Board"
              className="lg:hidden p-1.5 rounded-full bg-[#141417] border border-[#242429] text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Pills Bar (Horizontally Scrollable on Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Search Input Pill */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 bg-[#141417] border border-[#242429] rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9f1c] w-36 sm:w-48"
              />
            </div>

            {/* Filter Status Pills */}
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1 rounded-full text-xs font-black transition-all shrink-0 ${
                statusFilter === 'ALL'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#141417] text-gray-400 border border-[#242429] hover:text-white'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setStatusFilter('To Do')}
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
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
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'Doing'
                  ? 'bg-blue-500 text-black shadow-md'
                  : 'bg-[#141417] text-blue-400 border border-[#242429] hover:border-blue-500/50'
              }`}
            >
              Doing
            </button>

            <button
              onClick={() => setStatusFilter('Done')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                statusFilter === 'Done'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#141417] text-emerald-400 border border-[#242429] hover:border-emerald-500/50'
              }`}
            >
              Done
            </button>

            {/* Sort / Filter by User Selector */}
            <div className="relative inline-flex items-center shrink-0">
              <Users className="w-3.5 h-3.5 text-[#ff9f1c] absolute left-3 pointer-events-none" />
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-[#141417] border border-[#242429] hover:border-[#ff9f1c]/40 rounded-full text-xs font-bold text-gray-200 focus:outline-none focus:border-[#ff9f1c] cursor-pointer appearance-none"
              >
                <option value="ALL">All Assignees</option>
                <option value="ME">Assigned to Me</option>
                <option value="UNASSIGNED">Unassigned Tasks</option>
                {isAdmin &&
                  (allUsers || []).map((u) => (
                    <option key={u.id || u._id} value={`USER_${u.id || u._id}`}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => {
                fetchTasks();
                fetchUsers();
              }}
              title="Refresh Board"
              className="hidden lg:block p-1.5 rounded-full bg-[#141417] border border-[#242429] text-gray-400 hover:text-white transition-colors shrink-0"
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
