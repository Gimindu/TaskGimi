'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, User } from '../types';
import { X, Check, AlertCircle, Calendar, ShieldAlert } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string | null;
    assignedUser?: string | null;
  }) => Promise<void>;
  initialTask?: Task | null;
  currentUser: User | null;
  allUsers: User[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  currentUser,
  allUsers,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [assignedUser, setAssignedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const currentUserId = currentUser?.id || currentUser?._id || '';

  const formatToDatetimeLocal = (dateString?: string | Date | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setStatus(initialTask.status);
      setPriority(initialTask.priority || 'medium');
      setDueDate(formatToDatetimeLocal(initialTask.dueDate));
      const assignedObj = typeof initialTask.assignedUser === 'object' ? initialTask.assignedUser : null;
      const assignedId = assignedObj ? (assignedObj.id || assignedObj._id) : typeof initialTask.assignedUser === 'string' ? initialTask.assignedUser : '';
      setAssignedUser(assignedId || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setPriority('medium');
      setDueDate('');
      setAssignedUser('');
    }
    setError(null);
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assignedUser: assignedUser || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141417] border border-[#242429] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-6 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#242429] mb-4 shrink-0">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-white">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-gray-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body with Vertical Scroll */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement JWT Authentication"
              className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#ff9f1c]"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details for this task..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#ff9f1c] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-gray-200 text-xs focus:outline-none focus:border-[#ff9f1c] cursor-pointer"
              >
                <option value="To Do">To Do</option>
                <option value="Doing">Doing</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-gray-200 text-xs focus:outline-none focus:border-[#ff9f1c] cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority 🔥</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onClick={(e) => (e.target as any).showPicker?.()}
                className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-gray-200 text-xs focus:outline-none focus:border-[#ff9f1c] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                Assigned User
              </label>
              {isAdmin ? (
                <select
                  value={assignedUser}
                  onChange={(e) => setAssignedUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-gray-200 text-xs focus:outline-none focus:border-[#ff9f1c] cursor-pointer"
                >
                  <option value="">-- Unassigned --</option>
                  {allUsers.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={assignedUser}
                  onChange={(e) => setAssignedUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-gray-200 text-xs focus:outline-none focus:border-[#ff9f1c] cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  <option value={currentUserId}>Assign to Myself ({currentUser?.name})</option>
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#242429] mt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-gray-400 hover:text-white hover:bg-[#18181b] text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-[#ff9f1c] hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
