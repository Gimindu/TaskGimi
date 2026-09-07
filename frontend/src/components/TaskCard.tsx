'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, User } from '../types';
import { UserCheck, Edit3, Trash2, UserPlus, ShieldAlert, Calendar } from 'lucide-react';

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

  // Extract creator info safely
  const creatorObj = typeof task.creator === 'object' ? task.creator : null;
  const creatorName = creatorObj ? creatorObj.name : 'Unknown User';

  // Extract assigned user info safely
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
          className={`glass-card p-4 rounded-xl mb-3 transition-all duration-200 border ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-2xl ring-2 ring-indigo-500/30 scale-105 bg-gray-900/95 z-50'
              : 'border-gray-800 hover:border-gray-700'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-100 text-sm leading-snug line-clamp-2">
              {task.title}
            </h3>

            {/* Action Icons */}
            <div className="flex items-center space-x-1 shrink-0">
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  title="Edit Task"
                  className="p-1 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task._id);
                  }}
                  title="Delete Task"
                  className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta & User Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-gray-800/60 mt-3">
            {/* Creator Badge */}
            <span className="text-gray-400 flex items-center space-x-1">
              <span className="text-gray-400">By:</span>
              <span className="font-medium text-gray-300">{creatorName}</span>
            </span>

            {/* Assigned User Badge / Claim / Reassign */}
            <div className="flex items-center">
              {isAdmin ? (
                /* Admin Reassign Dropdown */
                <select
                  value={assignedUserId || ''}
                  onChange={(e) => onReassign(task._id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-900 border border-gray-700 text-gray-300 text-[11px] rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Unassigned --</option>
                  {allUsers.map((u) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              ) : isUnassigned ? (
                /* Normal User Claim Button */
                canClaim ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim(task._id);
                    }}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all text-[11px] font-semibold"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Claim Task</span>
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px]">
                    Unassigned
                  </span>
                )
              ) : (
                /* Assigned User Label */
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                    isAssignedToMe
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
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
