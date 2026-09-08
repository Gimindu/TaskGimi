'use client';

import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus, User } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { Flame, Clock, CheckCircle2, LayoutGrid } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  currentUser: User | null;
  allUsers: User[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClaim: (taskId: string) => void;
  onReassign: (taskId: string, targetUserId: string) => void;
}

const COLUMNS: TaskStatus[] = ['To Do', 'Doing', 'Done'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks = [],
  currentUser,
  allUsers = [],
  onStatusChange,
  onEdit,
  onDelete,
  onClaim,
  onReassign,
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeUsers = Array.isArray(allUsers) ? allUsers : [];

  // Mobile View Column Switcher ('ALL' | 'To Do' | 'Doing' | 'Done')
  const [mobileActiveTab, setMobileActiveTab] = useState<'ALL' | TaskStatus>('ALL');

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    onStatusChange(draggableId, newStatus);
  };

  const getCount = (status: TaskStatus) => safeTasks.filter((t) => t && t.status === status).length;

  return (
    <div className="space-y-4 pb-16 sm:pb-0">
      {/* Mobile Column View Switcher Tabs (Only visible on screens < 768px) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setMobileActiveTab('ALL')}
          className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 ${mobileActiveTab === 'ALL'
            ? 'bg-white text-black shadow-md'
            : 'bg-[#141417] text-gray-400 border border-[#242429]'
            }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All Columns ({safeTasks.length})</span>
        </button>

        <button
          onClick={() => setMobileActiveTab('To Do')}
          className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 ${mobileActiveTab === 'To Do'
            ? 'bg-[#ff9f1c] text-black shadow-md'
            : 'bg-[#141417] text-amber-400 border border-[#242429]'
            }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>To Do ({getCount('To Do')})</span>
        </button>

        <button
          onClick={() => setMobileActiveTab('Doing')}
          className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 ${mobileActiveTab === 'Doing'
            ? 'bg-blue-500 text-black shadow-md'
            : 'bg-[#141417] text-blue-400 border border-[#242429]'
            }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>In Progress ({getCount('Doing')})</span>
        </button>

        <button
          onClick={() => setMobileActiveTab('Done')}
          className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 ${mobileActiveTab === 'Done'
            ? 'bg-emerald-500 text-black shadow-md'
            : 'bg-[#141417] text-emerald-400 border border-[#242429]'
            }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Done ({getCount('Done')})</span>
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
          {COLUMNS.map((status) => {
            const columnTasks = safeTasks.filter((t) => t && t.status === status);
            const isVisibleOnMobile = mobileActiveTab === 'ALL' || mobileActiveTab === status;

            return (
              <div
                key={status}
                className={`${isVisibleOnMobile ? 'block' : 'hidden md:block'}`}
              >
                <KanbanColumn
                  status={status}
                  tasks={columnTasks}
                  currentUser={currentUser}
                  allUsers={safeUsers}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClaim={onClaim}
                  onReassign={onReassign}
                />
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
