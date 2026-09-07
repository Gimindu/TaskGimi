'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Task, TaskStatus, User } from '../../types';
import { Navbar } from '../../components/Navbar';
import { TaskModal } from '../../components/TaskModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { LoadingScreen } from '../../components/LoadingScreen';
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
  Loader2,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ListTodo,
  Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
    onConfirm: () => {},
  });

  const isAdmin = user?.role === 'admin';
  const currentUserId = user?.id || user?._id;

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error loading tasks for profile:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data);
    } catch (err) {
      console.error('Error loading users list:', err);
    }
  }, []);

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

  // Handle DND or manual status change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error('Failed to update task status:', err);
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

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Profile..." submessage="Fetching user profile & task metrics" />;
  }

  if (!user) return null;

  // Filter tasks based on view tab (Assigned to Me vs Created by Me vs All)
  const myAssignedTasks = tasks.filter((t) => {
    const assignedId = typeof t.assignedUser === 'object' ? t.assignedUser?._id : t.assignedUser;
    return assignedId === currentUserId;
  });

  const myCreatedTasks = tasks.filter((t) => {
    const creatorId = typeof t.creator === 'object' ? t.creator?._id : t.creator;
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Profile Hero Header Card */}
        <div className="bg-[#141417] border border-[#242429] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff9f1c]/10 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ff9f1c] via-amber-400 to-amber-200 text-black font-heading font-black text-4xl flex items-center justify-center shadow-lg uppercase ring-4 ring-[#ff9f1c]/20">
                  {user.name.charAt(0)}
                </div>
                <div
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#141417] border border-[#242429] flex items-center justify-center text-[#ff9f1c]"
                  title="Approved Account"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* User Bio Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
                    {user.name}
                  </h1>

                  {/* Role Badge */}
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>System Administrator</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase tracking-wider">
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Workspace Member</span>
                    </span>
                  )}

                  {/* Status Badge */}
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Approved</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-amber-500" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Joined {joinedDateFormatted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center space-x-3 shrink-0">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141417] border border-[#242429] p-5 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Tasks</p>
              <h3 className="font-heading font-black text-3xl text-white mt-1">{myAssignedTasks.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#ff9f1c]">
              <ListTodo className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#141417] border border-[#242429] p-5 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">To Do</p>
              <h3 className="font-heading font-black text-3xl text-amber-400 mt-1">{assignedTodo}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#141417] border border-[#242429] p-5 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
              <h3 className="font-heading font-black text-3xl text-blue-400 mt-1">{assignedDoing}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#141417] border border-[#242429] p-5 rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
              <h3 className="font-heading font-black text-3xl text-emerald-400 mt-1">{assignedDone}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* User Tasks Section */}
        <div className="space-y-6">
          {/* Header Controls: Tab Toggle & Search Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141417] border border-[#242429] p-4 rounded-3xl">
            {/* View Scope Tabs */}
            <div className="flex items-center p-1 bg-[#09090b] rounded-full border border-[#242429]">
              <button
                onClick={() => setTaskViewTab('assigned')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  taskViewTab === 'assigned'
                    ? 'bg-[#ff9f1c] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Assigned to Me ({myAssignedTasks.length})
              </button>

              <button
                onClick={() => setTaskViewTab('created')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                  taskViewTab === 'created'
                    ? 'bg-[#ff9f1c] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Created by Me ({myCreatedTasks.length})
              </button>

              {isAdmin && (
                <button
                  onClick={() => setTaskViewTab('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                    taskViewTab === 'all'
                      ? 'bg-[#ff9f1c] text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Tasks ({tasks.length})
                </button>
              )}
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tasks..."
                  className="pl-9 pr-3.5 py-1.5 bg-[#09090b] border border-[#242429] rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9f1c] w-40 sm:w-48"
                />
              </div>

              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-[#09090b] text-gray-400 border border-[#242429] hover:text-white'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setStatusFilter('To Do')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  statusFilter === 'To Do'
                    ? 'bg-[#ff9f1c] text-black shadow-sm'
                    : 'bg-[#09090b] text-amber-400 border border-[#242429]'
                }`}
              >
                To Do
              </button>

              <button
                onClick={() => setStatusFilter('Doing')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  statusFilter === 'Doing'
                    ? 'bg-blue-500 text-black shadow-sm'
                    : 'bg-[#09090b] text-blue-400 border border-[#242429]'
                }`}
              >
                Doing
              </button>

              <button
                onClick={() => setStatusFilter('Done')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  statusFilter === 'Done'
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
            <div className="bg-[#141417] border border-[#242429] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-gray-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-white">No tasks found</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                No tasks match your selected view tab or filter criteria. Create a new task to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => {
                const assignedName =
                  typeof task.assignedUser === 'object' && task.assignedUser
                    ? task.assignedUser.name
                    : 'Unassigned';

                const creatorName =
                  typeof task.creator === 'object' && task.creator
                    ? task.creator.name
                    : 'Workspace Admin';

                return (
                  <div
                    key={task._id}
                    className="bg-[#141417] border border-[#242429] hover:border-[#ff9f1c]/40 p-5 rounded-3xl transition-all shadow-md flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {/* Task Status Pill */}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            task.status === 'To Do'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : task.status === 'Doing'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {task.status}
                        </span>

                        {/* Status Toggle Quick Selector */}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value as TaskStatus)}
                          className="bg-[#09090b] text-[11px] text-gray-300 font-bold border border-[#242429] rounded-full px-2.5 py-0.5 focus:outline-none focus:border-[#ff9f1c] cursor-pointer"
                        >
                          <option value="To Do">To Do</option>
                          <option value="Doing">Doing</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>

                      <h3 className="font-heading font-extrabold text-base text-white group-hover:text-[#ff9f1c] transition-colors line-clamp-1">
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#242429] flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-[#ff9f1c] text-black font-black text-[9px] flex items-center justify-center uppercase">
                          {assignedName.charAt(0)}
                        </div>
                        <span className="truncate max-w-[110px] text-gray-300 font-bold">
                          {assignedName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-white hover:text-black border border-[#27272a] text-gray-300 text-[11px] font-extrabold transition-all"
                        >
                          Edit
                        </button>
                        {(isAdmin || (typeof task.creator === 'object' ? task.creator._id : task.creator) === currentUserId) && (
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="px-2 py-1 rounded-full bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-400 text-[11px] font-extrabold transition-all"
                          >
                            Delete
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
