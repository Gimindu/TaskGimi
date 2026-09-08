'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTaskContext } from '../../context/TaskContext';
import { Task, TaskStatus, TaskPriority, User } from '../../types';
import { Navbar } from '../Navbar';
import { TaskModal } from '../TaskModal';
import { ConfirmModal } from '../ConfirmModal';
import { LoadingScreen } from '../LoadingScreen';
import { CustomDropdown } from '../CustomDropdown';
import {
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Calendar,
  Flame,
  CheckCircle,
  Clock,
  Search,
  Plus,
  ListTodo,
  Sparkles,
  Folder,
  Edit3,
  Trash2,
  UserCheck,
  UserPlus,
  Tag as TagIcon,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

const TAG_COLORS: Record<string, string> = {
  bug: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  feature: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  frontend: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  backend: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  design: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  devops: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
};

export function ProfileView() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const {
    tasks,
    allUsers,
    loading: tasksLoading,
    isRefreshing,
    refreshAll: handleRefresh,
    handleStatusChange,
    handleSaveTask: contextSaveTask,
    handleDeleteTask: contextDeleteTask,
    handleClaimTask,
    handleReassignTask,
  } = useTaskContext();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [taskViewTab, setTaskViewTab] = useState<'assigned' | 'created' | 'all'>('assigned');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Confirm Modal State
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
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Handle Create / Update Task Submit
  const handleSaveTask = async (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority?: TaskPriority;
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

  if (authLoading || tasksLoading) {
    return <LoadingScreen message="Loading Profile..." submessage="Fetching user profile & task metrics" />;
  }

  if (!user) return null;

  // Filter tasks based on view tab (Assigned to Me vs Created by Me vs All)
  const myAssignedTasks = tasks.filter((t) => {
    const assignedId = typeof t.assignedUser === 'object' && t.assignedUser ? t.assignedUser._id || t.assignedUser.id : t.assignedUser;
    return assignedId === currentUserId;
  });

  const myCreatedTasks = tasks.filter((t) => {
    const creatorId = typeof t.creator === 'object' && t.creator ? t.creator._id || t.creator.id : t.creator;
    return creatorId === currentUserId;
  });

  const baseTasks =
    taskViewTab === 'assigned'
      ? myAssignedTasks
      : taskViewTab === 'created'
        ? myCreatedTasks
        : tasks;

  const filteredTasks = baseTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate user performance metrics
  const assignedTodo = myAssignedTasks.filter((t) => t.status === 'To Do').length;
  const assignedDoing = myAssignedTasks.filter((t) => t.status === 'Doing').length;
  const assignedDone = myAssignedTasks.filter((t) => t.status === 'Done').length;

  const joinedDateFormatted = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    : 'Active Member';

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans">
      <Navbar
        onOpenCreateModal={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-16 sm:pb-8">
        {/* Profile Hero Header Card */}
        <div className="bg-[#141417] border border-[#242429] rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff9f1c]/10 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#ff9f1c] via-amber-400 to-amber-200 text-black font-heading font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg uppercase ring-4 ring-[#ff9f1c]/20">
                  {user.name.charAt(0)}
                </div>
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#141417] border border-[#242429] flex items-center justify-center text-[#ff9f1c]"
                  title="Approved Account"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
              </div>

              {/* User Bio Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-heading font-black text-xl sm:text-3xl text-white tracking-wide">
                    {user.name}
                  </h1>

                  {/* Role Badge */}
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Admin</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase tracking-wider">
                      <UserIcon className="w-3 h-3" />
                      <span>Member</span>
                    </span>
                  )}

                  {/* Status Badge */}
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Approved</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-gray-400 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Joined {joinedDateFormatted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh Profile Data"
                className="p-2.5 rounded-full bg-[#18181b] hover:bg-[#242429] border border-[#27272a] text-gray-300 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 text-[#ff9f1c] ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Task Performance Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#141417] border border-[#242429] p-4 sm:p-5 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned</p>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white mt-0.5">{myAssignedTasks.length}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#ff9f1c]">
              <ListTodo className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-[#141417] border border-[#242429] p-4 sm:p-5 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">To Do</p>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-amber-400 mt-0.5">{assignedTodo}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-[#141417] border border-[#242429] p-4 sm:p-5 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-blue-400 mt-0.5">{assignedDoing}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-[#141417] border border-[#242429] p-4 sm:p-5 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Done</p>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-emerald-400 mt-0.5">{assignedDone}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* User Tasks Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Header Controls: Tab Toggle & Search Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141417] border border-[#242429] p-3 sm:p-4 rounded-3xl">
            {/* View Scope Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#09090b] rounded-full border border-[#242429] overflow-x-auto scrollbar-none shrink-0">
              <button
                onClick={() => setTaskViewTab('assigned')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${taskViewTab === 'assigned'
                    ? 'bg-[#ff9f1c] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                Assigned to Me ({myAssignedTasks.length})
              </button>

              <button
                onClick={() => setTaskViewTab('created')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${taskViewTab === 'created'
                    ? 'bg-[#ff9f1c] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                Created by Me ({myCreatedTasks.length})
              </button>

              {isAdmin && (
                <button
                  onClick={() => setTaskViewTab('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${taskViewTab === 'all'
                      ? 'bg-[#ff9f1c] text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  All Tasks ({tasks.length})
                </button>
              )}
            </div>

            {/* Search & Status Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tasks..."
                  className="pl-8 pr-3 py-1.5 bg-[#09090b] border border-[#242429] rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9f1c] w-36 sm:w-48"
                />
              </div>

              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${statusFilter === 'ALL'
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-[#09090b] text-gray-400 border border-[#242429] hover:text-white'
                  }`}
              >
                All
              </button>

              <button
                onClick={() => setStatusFilter('To Do')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${statusFilter === 'To Do'
                    ? 'bg-[#ff9f1c] text-black shadow-sm'
                    : 'bg-[#09090b] text-amber-400 border border-[#242429]'
                  }`}
              >
                To Do
              </button>

              <button
                onClick={() => setStatusFilter('Doing')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${statusFilter === 'Doing'
                    ? 'bg-blue-500 text-black shadow-sm'
                    : 'bg-[#09090b] text-blue-400 border border-[#242429]'
                  }`}
              >
                In Progress
              </button>

              <button
                onClick={() => setStatusFilter('Done')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${statusFilter === 'Done'
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'bg-[#09090b] text-emerald-400 border border-[#242429]'
                  }`}
              >
                Done
              </button>
            </div>
          </div>

          {/* Task Grid Cards */}
          {filteredTasks.length === 0 ? (
            <div className="bg-[#141417] border border-[#242429] rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-gray-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-white">No tasks found</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                No tasks match your selected view tab or filter criteria. Create a new task to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredTasks.map((task) => {
                const creatorObj = typeof task.creator === 'object' ? task.creator : null;
                const creatorName = creatorObj ? creatorObj.name : 'User';

                const assignedObj = typeof task.assignedUser === 'object' ? task.assignedUser : null;
                const assignedUserId = assignedObj
                  ? assignedObj.id || assignedObj._id
                  : typeof task.assignedUser === 'string'
                  ? task.assignedUser
                  : null;
                const assignedName = assignedObj ? assignedObj.name : 'Unassigned';

                const isAssignedToMe = assignedUserId === currentUserId;
                const isCreator = (creatorObj?.id || creatorObj?._id) === currentUserId;
                const isUnassigned = !assignedUserId;

                const canEdit = isAdmin || isCreator;
                const canDelete = isAdmin || isCreator;
                const canClaim = !isAdmin && isUnassigned;

                const isOverdue = Boolean(
                  task.dueDate &&
                  task.status !== 'Done' &&
                  !isNaN(new Date(task.dueDate).getTime()) &&
                  new Date(task.dueDate).getTime() < Date.now()
                );

                // Priority Border Accent
                const priorityBorder =
                  task.priority === 'high'
                    ? 'border-l-rose-500'
                    : task.priority === 'medium'
                    ? 'border-l-amber-500'
                    : 'border-l-zinc-700';

                return (
                  <div
                    key={task._id}
                    className={`p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 shadow-md hover:shadow-xl flex flex-col justify-between space-y-4 group ${
                      isOverdue
                        ? 'bg-gradient-to-br from-rose-950/30 via-[#141417] to-[#141417] border-rose-500/70 border-l-4 border-l-rose-500 ring-1 ring-rose-500/40 shadow-rose-950/40 hover:border-rose-400'
                        : `bg-[#141417] hover:bg-[#18181b] border border-[#242429] hover:border-[#ff9f1c]/50 border-l-4 ${priorityBorder} hover:shadow-amber-500/5`
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header Row: Creator Tag & Overdue Alert & Status Controls */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Creator Info */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <div className="w-5 h-5 rounded-md bg-[#242429] text-gray-300 text-[10px] font-extrabold flex items-center justify-center uppercase shrink-0">
                            {creatorName.charAt(0)}
                          </div>
                          <span className="text-[11px] font-medium text-gray-400 truncate max-w-[100px]">
                            By {creatorName}
                          </span>
                        </div>

                        {/* Overdue Warning Pill + Status dropdown */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {isOverdue && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/25 text-rose-300 border border-rose-500/60 animate-pulse shadow-sm shadow-rose-500/30">
                              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>Overdue</span>
                            </span>
                          )}

                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              task.status === 'To Do'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : task.status === 'Doing'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                task.status === 'To Do'
                                  ? 'bg-amber-400'
                                  : task.status === 'Doing'
                                  ? 'bg-blue-400'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <span>{task.status === 'Doing' ? 'In Progress' : task.status}</span>
                          </span>

                          <CustomDropdown
                            options={[
                              { value: 'To Do', label: 'To Do' },
                              { value: 'Doing', label: 'In Progress' },
                              { value: 'Done', label: 'Done' },
                            ]}
                            value={task.status}
                            onChange={(newStatus) => handleStatusChange(task._id, newStatus as TaskStatus)}
                            size="xs"
                            align="right"
                          />
                        </div>
                      </div>

                      {/* Card Title & Description */}
                      <div>
                        <h3 className="font-heading font-extrabold text-base text-white group-hover:text-[#ff9f1c] transition-colors leading-snug line-clamp-2">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Metadata Row: Project, Category Tags, Priority & Due Date */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {/* Project Tag Badge */}
                        {task.project && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#18181b] text-amber-400 border border-amber-500/30">
                            <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate max-w-[120px]">{task.project}</span>
                          </span>
                        )}

                        {/* Category Tags */}
                        {Array.isArray(task.tags) &&
                          task.tags.map((tag) => {
                            const tagLower = tag.toLowerCase();
                            const colorClass = TAG_COLORS[tagLower] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
                            return (
                              <span
                                key={tag}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${colorClass}`}
                              >
                                #{tag}
                              </span>
                            );
                          })}

                        {/* Priority Badge */}
                        {task.priority && (
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              task.priority === 'high'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : task.priority === 'medium'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            {task.priority === 'high' && <Flame className="w-2.5 h-2.5 text-rose-400" />}
                            <span>{task.priority} priority</span>
                          </span>
                        )}

                        {/* Due Date & Time Badge */}
                        {task.dueDate && (() => {
                          const due = new Date(task.dueDate);
                          if (isNaN(due.getTime())) return null;
                          const now = new Date();
                          const isDone = task.status === 'Done';
                          const isTaskOverdue = !isDone && due.getTime() < now.getTime();
                          const isToday = !isDone && due.toDateString() === now.toDateString();

                          const dateStr = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                          return (
                            <span
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                isTaskOverdue
                                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 animate-pulse shadow-sm shadow-rose-500/30'
                                  : isToday
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {isTaskOverdue ? (
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                              ) : (
                                <Calendar className="w-2.5 h-2.5" />
                              )}
                              <span>{isTaskOverdue ? `Overdue · ${dateStr}` : isToday ? `Due Today` : `Due ${dateStr}`}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Bottom Footer Row: Assignee & Action Buttons */}
                    <div className="pt-3 border-t border-[#242429] flex items-center justify-between text-xs text-gray-400 gap-2">
                      {/* Left: Assignee Info or Admin Assign Dropdown or Claim Button */}
                      <div className="flex items-center shrink-0">
                        {isAdmin ? (
                          <CustomDropdown
                            options={[
                              { value: '', label: '-- Unassigned --' },
                              ...(allUsers || []).map((u) => ({
                                value: u.id || u._id || '',
                                label: `${u.name} (${u.role})`,
                              })),
                            ]}
                            value={assignedUserId || ''}
                            onChange={(targetUserId) => handleReassignTask(task._id, targetUserId)}
                            align="left"
                            size="xs"
                            placeholder="Assign user..."
                          />
                        ) : isUnassigned ? (
                          canClaim ? (
                            <button
                              onClick={() => handleClaimTask(task._id)}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black text-[11px] font-extrabold transition-all shadow-sm active:scale-95"
                            >
                              <UserPlus className="w-3 h-3 stroke-[2.5]" />
                              <span>Claim</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-medium text-gray-500 italic">Unassigned</span>
                          )
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <div
                              className={`w-5 h-5 rounded-full text-black font-extrabold text-[9px] flex items-center justify-center uppercase shrink-0 ${
                                isAssignedToMe ? 'bg-[#ff9f1c]' : 'bg-gray-300'
                              }`}
                            >
                              {assignedName.charAt(0)}
                            </div>
                            <span
                              className={`truncate max-w-[100px] text-xs font-bold ${
                                isAssignedToMe ? 'text-[#ff9f1c]' : 'text-gray-300'
                              }`}
                            >
                              {isAssignedToMe ? 'You' : assignedName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Edit & Delete Buttons */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsModalOpen(true);
                            }}
                            title="Edit Task"
                            className="p-1.5 rounded-full bg-[#18181b] hover:bg-[#ff9f1c] hover:text-black border border-[#27272a] text-gray-300 transition-all shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            title="Delete Task"
                            className="p-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 transition-all shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

