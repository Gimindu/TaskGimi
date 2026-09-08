'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, User } from '../types';
import { UserCheck, Edit3, Trash2, UserPlus, Calendar, Folder, MoreHorizontal } from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';

interface TaskCardProps {
  task: Task;
  index: number;
  currentUser: User | null;
  allUsers: User[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClaim: (taskId: string) => void;
  onReassign: (taskId: string, targetUserId: string) => void;
}

const PRIORITY_META: Record<string, { label: string; dot: string; border: string; text: string }> = {
  high: { label: 'High', dot: 'bg-rose-400', border: 'border-l-rose-500/70', text: 'text-rose-300' },
  medium: { label: 'Medium', dot: 'bg-amber-400', border: 'border-l-amber-500/60', text: 'text-amber-300' },
  low: { label: 'Low', dot: 'bg-zinc-500', border: 'border-l-zinc-700', text: 'text-zinc-400' },
};

const STATUS_META: Record<string, { label: string; dot: string; text: string }> = {
  'To Do': { label: 'To do', dot: 'bg-zinc-500', text: 'text-zinc-400' },
  'Doing': { label: 'In progress', dot: 'bg-sky-400', text: 'text-sky-300' },
  'Done': { label: 'Done', dot: 'bg-emerald-400', text: 'text-emerald-300' },
};

const TAG_COLORS: Record<string, string> = {
  bug: 'bg-rose-400',
  feature: 'bg-violet-400',
  frontend: 'bg-cyan-400',
  backend: 'bg-amber-400',
  design: 'bg-pink-400',
  devops: 'bg-indigo-400',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  currentUser,
  allUsers,
  onEdit,
  onDelete,
  onClaim,
  onReassign,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const currentUserId = currentUser?.id || currentUser?._id;

  const creatorObj = typeof task.creator === 'object' ? task.creator : null;
  const creatorName = creatorObj ? creatorObj.name : 'User';

  const assignedObj = typeof task.assignedUser === 'object' ? task.assignedUser : null;
  const assignedUserId = assignedObj ? (assignedObj.id || assignedObj._id) : typeof task.assignedUser === 'string' ? task.assignedUser : null;
  const assignedName = assignedObj ? assignedObj.name : null;

  const isAssignedToMe = assignedUserId === currentUserId;
  const isCreator = (creatorObj?.id || creatorObj?._id) === currentUserId;
  const isUnassigned = !assignedUserId;

  const canEdit = isAdmin || isCreator || isAssignedToMe || isUnassigned;
  const canDelete = isAdmin || isCreator;
  const canClaim = !isAdmin && isUnassigned;

  const priorityMeta = task.priority ? PRIORITY_META[task.priority] : null;
  const statusMeta = STATUS_META[task.status] || STATUS_META['To Do'];

  let dueInfo: { label: string; tone: 'overdue' | 'today' | 'default' } | null = null;
  if (task.dueDate) {
    const due = new Date(task.dueDate);
    if (!isNaN(due.getTime())) {
      const now = new Date();
      const isDone = task.status === 'Done';
      const isOverdue = !isDone && due.getTime() < now.getTime();
      const isToday = !isDone && due.toDateString() === now.toDateString();
      const dateStr = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeStr = due.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      dueInfo = {
        label: isOverdue ? `Overdue · ${dateStr}` : isToday ? `Today · ${timeStr}` : `${dateStr} · ${timeStr}`,
        tone: isOverdue ? 'overdue' : isToday ? 'today' : 'default',
      };
    }
  }

  return (
    <Draggable draggableId={String(task._id || task.id || '')} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`group relative mb-2.5 rounded-lg border border-zinc-800/80 border-l-2 bg-zinc-900/60 text-white transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900 ${priorityMeta ? priorityMeta.border : 'border-l-zinc-800'
            } ${snapshot.isDragging ? 'rotate-[0.5deg] shadow-xl shadow-black/40 ring-1 ring-zinc-600' : ''}`}
        >
          <div className="px-3.5 pt-3.5 pb-3">
            {/* Header: creator + actions */}
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-[10px] font-semibold text-zinc-300">
                  {((creatorName || 'U').trim().charAt(0) || 'U').toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-zinc-500">{creatorName}</span>
              </div>

              <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                    title="Edit task"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task._id);
                    }}
                    title="Delete task"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
                <button
                  title="More"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Title & description */}
            <h3 className="mb-1 text-[13.5px] font-semibold leading-snug text-zinc-100">
              {task.title}
            </h3>
            {task.description && (
              <p className="mb-2.5 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                {task.description}
              </p>
            )}

            {/* Meta: project, tags, due date */}
            {(task.project || (Array.isArray(task.tags) && task.tags.length > 0) || dueInfo) && (
              <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {task.project && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                    <Folder className="h-3 w-3 text-zinc-500" />
                    <span className="max-w-[120px] truncate">{task.project}</span>
                  </span>
                )}

                {Array.isArray(task.tags) &&
                  task.tags.map((tag) => {
                    const dot = TAG_COLORS[tag.toLowerCase()] || 'bg-zinc-500';
                    return (
                      <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                        {tag}
                      </span>
                    );
                  })}

                {dueInfo && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${dueInfo.tone === 'overdue'
                        ? 'text-rose-400'
                        : dueInfo.tone === 'today'
                          ? 'text-amber-300'
                          : 'text-zinc-400'
                      }`}
                  >
                    <Calendar className="h-3 w-3" />
                    {dueInfo.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer: status, priority, assignment */}
          <div className="flex items-center justify-between border-t border-zinc-800/70 px-3.5 py-2">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${statusMeta.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>

              {priorityMeta && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${priorityMeta.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dot}`} />
                  {priorityMeta.label}
                </span>
              )}
            </div>

            <div className="flex items-center">
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
                  onChange={(targetUserId) => onReassign(task._id, targetUserId)}
                  align="right"
                  size="xs"
                  placeholder="Assign..."
                />
              ) : isUnassigned ? (
                canClaim ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim(task._id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-900 transition-colors hover:bg-white"
                  >
                    <UserPlus className="h-3 w-3" />
                    Claim
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-zinc-600">Unassigned</span>
                )
              ) : (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium ${isAssignedToMe ? 'text-sky-300' : 'text-zinc-400'
                    }`}
                >
                  <UserCheck className="h-3 w-3" />
                  {isAssignedToMe ? 'You' : assignedName}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};