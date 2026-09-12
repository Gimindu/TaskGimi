'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTaskContext } from '../../context/TaskContext';
import { Task, TaskStatus, TaskPriority, User } from '../../types';
import { Navbar } from '../Navbar';
import { StatsOverview } from '../StatsOverview';
import { KanbanBoard } from '../KanbanBoard';
import { TaskModal } from '../TaskModal';
import { ConfirmModal } from '../ConfirmModal';
import { LoadingScreen } from '../LoadingScreen';
import { Search, RefreshCw, Users, ArrowUpDown } from 'lucide-react';
import { CustomDropdown, DropdownOption } from '../CustomDropdown';

export function DashboardView() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const {
    tasks,
    allUsers,
    loading: tasksLoading,
    isRefreshing,
    refreshAll: handleRefresh,
    handleStatusChange: contextStatusChange,
    handleSaveTask: contextSaveTask,
    handleDeleteTask: contextDeleteTask,
    handleClaimTask,
    handleReassignTask,
  } = useTaskContext();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NEWEST');

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
    onConfirm: () => { },
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Handle DND status change with filter reset if needed
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (statusFilter !== 'ALL' && statusFilter !== newStatus) {
      setStatusFilter('ALL');
    }
    await contextStatusChange(taskId, newStatus);
  };

  // Handle Create / Update Task Submit
  const handleSaveTask = async (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string | null;
    tags?: string[];
    project?: string;
    assignedUser?: string | null;
  }) => {
    await contextSaveTask(data, editingTask?._id);
  };

  // Handle Delete Task Confirmation
  const handleDeleteTask = (taskId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete Task',
      onConfirm: async () => {
        await contextDeleteTask(taskId);
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

  // Sort filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'DUE_DATE') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'PRIORITY') {
      const weightMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const weightA = weightMap[a.priority || 'medium'] || 2;
      const weightB = weightMap[b.priority || 'medium'] || 2;
      return weightB - weightA;
    }
    // Default NEWEST
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  if (authLoading || tasksLoading) {
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6 pb-24 sm:pb-6">
        {/* Workspace Title & Search/Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-30">
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <div className="flex items-center space-x-3">
              <h1 className="font-heading font-black text-xl sm:text-2xl tracking-wide text-white uppercase">
                {isAdmin ? 'All Tasks' : 'My Tasks'}
              </h1>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-black bg-[#18181b] border border-[#ff9f1c]/40 text-[#ff9f1c]">
                {sortedTasks.length}
              </span>
            </div>

            {/* Quick Refresh on Mobile */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh Board"
              className="lg:hidden p-1.5 rounded-full bg-[#141417] border border-[#242429] hover:border-[#ff9f1c]/50 text-gray-400 hover:text-white transition-all shrink-0 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ff9f1c] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filter & Sort Pills Bar */}
          <div className="flex flex-wrap items-center gap-2 max-w-full pb-1.5 relative z-30">
            {/* Search Input Pill */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 bg-[#141417] border border-[#242429] rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9f1c] w-32 sm:w-48"
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
              In Progress
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

            {/* Sort Dropdown */}
            <CustomDropdown
              options={[
                { value: 'NEWEST', label: 'Sort: Newest' },
                { value: 'DUE_DATE', label: 'Sort: Due Date' },
                { value: 'PRIORITY', label: 'Sort: Priority' },
              ]}
              value={sortBy}
              onChange={setSortBy}
              icon={<ArrowUpDown className="w-3.5 h-3.5" />}
              align="left"
            />

            {/* Filter by User Selector */}
            <CustomDropdown
              options={[
                { value: 'ALL', label: 'All Assignees' },
                { value: 'ME', label: 'Assigned to Me' },
                { value: 'UNASSIGNED', label: 'Unassigned' },
                ...(isAdmin
                  ? (allUsers || []).map((u) => ({
                    value: `USER_${u.id || u._id}`,
                    label: u.name,
                  }))
                  : []),
              ]}
              value={userFilter}
              onChange={setUserFilter}
              icon={<Users className="w-3.5 h-3.5" />}
              align="right"
            />

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh Board"
              className="hidden lg:flex p-1.5 rounded-full bg-[#141417] border border-[#242429] hover:border-[#ff9f1c]/50 text-gray-400 hover:text-white transition-all shrink-0 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ff9f1c] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview tasks={tasks} usersCount={allUsers.length} isAdmin={isAdmin} />

        {/* Kanban Board */}
        <KanbanBoard
          tasks={sortedTasks}
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
        existingProjects={Array.from(
          new Set(tasks.map((t) => t.project).filter((p): p is string => Boolean(p && p.trim())))
        )}
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