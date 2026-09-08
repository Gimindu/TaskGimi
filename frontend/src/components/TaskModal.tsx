'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, User } from '../types';
import { X, Check, AlertCircle, Calendar, ShieldAlert } from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

const PRESET_TAGS = ['Frontend', 'Backend', 'Bug', 'Feature', 'Design', 'DevOps'];

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string | null;
    tags?: string[];
    project?: string;
    assignedUser?: string | null;
  }) => Promise<void>;
  initialTask?: Task | null;
  currentUser: User | null;
  allUsers: User[];
  existingProjects?: string[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  currentUser,
  allUsers,
  existingProjects = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [project, setProject] = useState<string>('');
  const [assignedUser, setAssignedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const currentUserId = currentUser?.id || currentUser?._id || '';

  const creatorObj = typeof initialTask?.creator === 'object' ? initialTask.creator : null;
  const creatorId = creatorObj ? (creatorObj.id || creatorObj._id) : typeof initialTask?.creator === 'string' ? initialTask.creator : null;
  const isCreator = Boolean(creatorId && currentUserId && String(creatorId) === String(currentUserId));
  const isEditable = isAdmin || !initialTask || isCreator;

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
      setTags(initialTask.tags || []);
      setProject(initialTask.project || '');
      const assignedObj = typeof initialTask.assignedUser === 'object' ? initialTask.assignedUser : null;
      const assignedId = assignedObj ? (assignedObj.id || assignedObj._id) : typeof initialTask.assignedUser === 'string' ? initialTask.assignedUser : '';
      setAssignedUser(assignedId || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setProject(existingProjects && existingProjects.length > 0 ? existingProjects[0] : '');
      setAssignedUser('');
    }
    setError(null);
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (!isEditable) return;
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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
        tags,
        project: project.trim() || 'General',
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
            {initialTask ? (isEditable ? 'Edit Task' : 'Task Details') : 'Create New Task'}
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

          {!isEditable && (
            <div className="flex items-center space-x-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Task details created by Admin are read-only. You can update the status below.</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              disabled={!isEditable}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement JWT Authentication"
              className={`w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#ff9f1c] ${
                !isEditable ? 'opacity-60 cursor-not-allowed bg-[#0e0e10]' : ''
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              disabled={!isEditable}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details for this task..."
              rows={3}
              className={`w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#ff9f1c] resize-none ${
                !isEditable ? 'opacity-60 cursor-not-allowed bg-[#0e0e10]' : ''
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                Status
              </label>
              <CustomDropdown
                options={[
                  { value: 'To Do', label: 'To Do' },
                  { value: 'Doing', label: 'In Progress' },
                  { value: 'Done', label: 'Done' },
                ]}
                value={status}
                onChange={(val) => setStatus(val as TaskStatus)}
                size="sm"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                Priority Level
              </label>
              <CustomDropdown
                options={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'high', label: 'High Priority 🔥' },
                ]}
                value={priority}
                onChange={(val) => setPriority(val as TaskPriority)}
                size="sm"
                fullWidth
                disabled={!isEditable}
              />
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
                disabled={!isEditable}
                onChange={(e) => setDueDate(e.target.value)}
                onClick={(e) => isEditable && (e.target as any).showPicker?.()}
                className={`w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-gray-200 text-xs focus:outline-none focus:border-[#ff9f1c] ${
                  !isEditable ? 'opacity-60 cursor-not-allowed bg-[#0e0e10]' : 'cursor-pointer'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
                Assigned User
              </label>
              <CustomDropdown
                options={
                  isAdmin
                    ? [
                        { value: '', label: '-- Unassigned --' },
                        ...allUsers.map((u) => ({
                          value: u.id || u._id || '',
                          label: `${u.name} (${u.role})`,
                        })),
                      ]
                    : [
                        { value: '', label: 'Unassigned' },
                        { value: currentUserId || '', label: `Assign to Myself (${currentUser?.name})` },
                      ]
                }
                value={assignedUser}
                onChange={setAssignedUser}
                size="sm"
                fullWidth
                placeholder="Select Assignee..."
                disabled={!isEditable}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
              Project / Workspace Tag
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={project}
                disabled={!isEditable}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Type project name (e.g. Website Redesign)..."
                className={`w-full px-3.5 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#ff9f1c] ${
                  !isEditable ? 'opacity-60 cursor-not-allowed bg-[#0e0e10]' : ''
                }`}
              />

              {existingProjects && existingProjects.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] text-gray-500 font-semibold mb-1 block">
                    Existing Workspace Projects (click to select):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                    {existingProjects.map((p) => {
                      const isSelected = project.trim().toLowerCase() === p.trim().toLowerCase();
                      return (
                        <button
                          key={p}
                          type="button"
                          disabled={!isEditable}
                          onClick={() => isEditable && setProject(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                            !isEditable
                              ? 'opacity-50 cursor-not-allowed bg-[#141417] border-[#242429] text-gray-500'
                              : isSelected
                              ? 'bg-[#ff9f1c]/20 border-[#ff9f1c] text-[#ff9f1c]'
                              : 'bg-[#141417] border-[#242429] text-gray-400 hover:text-white hover:border-gray-500'
                          }`}
                        >
                          📁 {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5">
              Category Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((t) => {
                const selected = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!isEditable}
                    onClick={() => toggleTag(t)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      !isEditable
                        ? 'opacity-50 cursor-not-allowed bg-[#09090b] border border-[#27272a] text-gray-500'
                        : selected
                        ? 'bg-[#ff9f1c] text-black shadow-md'
                        : 'bg-[#09090b] border border-[#27272a] text-gray-400 hover:text-white'
                    }`}
                  >
                    {selected ? `✓ ${t}` : `+ ${t}`}
                  </button>
                );
              })}
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
