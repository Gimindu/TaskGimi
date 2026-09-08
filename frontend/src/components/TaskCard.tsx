'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, User } from '../types';
import { UserCheck, Edit3, Trash2, UserPlus, ArrowUpRight, Flame, Calendar } from 'lucide-react';

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

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
          }}
          className={`p-4 rounded-3xl mb-3 transition-all duration-200 group relative bg-[#18181c] border border-[#27272a] hover:border-[#3f3f46] text-white ${
            snapshot.isDragging
              ? 'scale-105 shadow-2xl z-50 ring-2 ring-[#ff9f1c]'
              : ''
          }`}
        >
          {/* Top Row: Avatar Left & Action Buttons Right (Matching Reference UI) */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-black text-xs uppercase shadow-md bg-[#27272a] text-[#ff9f1c] border border-[#3f3f46]">
                {((creatorName || 'U').trim().charAt(0) || 'U').toUpperCase()}
              </div>
              <div>
                <span className="text-[11px] font-bold block leading-none text-gray-400">
                  {creatorName}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
                  Creator
                </span>
              </div>
            </div>

            {/* Right Controls: Arrow & Edit/Delete Icons */}
            <div className="flex items-center space-x-1.5">
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  title="Edit Task"
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors bg-[#27272a] hover:bg-[#3f3f46] text-gray-300"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}

              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task._id);
                  }}
                  title="Delete Task"
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors bg-[#27272a] hover:bg-red-500/20 text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#27272a] text-gray-300">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Task Title */}
          <h3 className="font-heading font-extrabold text-sm mb-1 leading-snug tracking-tight text-white">
            {task.title}
          </h3>

          {/* Task Description */}
          {task.description && (
            <p className="text-xs mb-3 line-clamp-2 leading-relaxed text-gray-400">
              {task.description}
            </p>
          )}

          {/* Priority & Due Date & Category Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {/* Category Tags */}
            {Array.isArray(task.tags) &&
              task.tags.map((tag) => {
                const tagLower = tag.toLowerCase();
                let colorClass = 'bg-slate-500/20 text-slate-300 border-slate-500/30';
                if (tagLower === 'bug') colorClass = 'bg-red-500/20 text-red-300 border-red-500/40';
                else if (tagLower === 'feature') colorClass = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                else if (tagLower === 'frontend') colorClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                else if (tagLower === 'backend') colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                else if (tagLower === 'design') colorClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                else if (tagLower === 'devops') colorClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

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
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : task.priority === 'medium'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}
              >
                {task.priority === 'high' && <Flame className="w-2.5 h-2.5 text-red-400" />}
                <span>{task.priority} priority</span>
              </span>
            )}

            {/* Due Date & Time Badge */}
            {task.dueDate && (() => {
              const due = new Date(task.dueDate);
              if (isNaN(due.getTime())) return null;
              const now = new Date();
              const isDone = task.status === 'Done';
              const isOverdue = !isDone && due.getTime() < now.getTime();
              const isToday = !isDone && due.toDateString() === now.toDateString();

              const dateStr = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const timeStr = due.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
              const fullDisplay = `${dateStr} at ${timeStr}`;

              return (
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    isOverdue
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                      : isToday
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{isOverdue ? `Overdue (${dateStr}, ${timeStr})` : isToday ? `Due Today at ${timeStr}` : `Due ${fullDisplay}`}</span>
                </span>
              );
            })()}
          </div>

          {/* Bottom Row: Status Micro-Pills & Assignment */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#242429] mt-3">
            {/* Status Pill */}
            <div className="flex items-center space-x-1.5">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                task.status === 'To Do'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : task.status === 'Doing'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                <Flame className="w-3 h-3" />
                <span>{task.status}</span>
              </span>
            </div>

            {/* Assignment Action / Badge */}
            <div className="flex items-center">
              {isAdmin ? (
                <select
                  value={assignedUserId || ''}
                  onChange={(e) => onReassign(task._id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] font-bold rounded-full px-2 py-0.5 focus:outline-none cursor-pointer bg-[#27272a] border border-[#3f3f46] text-gray-200"
                >
                  <option value="">-- Unassigned --</option>
                  {(allUsers || []).map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              ) : isUnassigned ? (
                canClaim ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim(task._id);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all bg-[#ff9f1c] text-black hover:bg-amber-400"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Claim Task</span>
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#27272a] text-gray-400">
                    Unassigned
                  </span>
                )
              ) : (
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  isAssignedToMe
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                    : 'bg-[#27272a] text-gray-300'
                }`}>
                  <UserCheck className="w-3 h-3" />
                  <span>{isAssignedToMe ? 'Assigned to You' : assignedName}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
