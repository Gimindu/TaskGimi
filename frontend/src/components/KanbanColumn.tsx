'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task, TaskStatus, User } from '../types';
import { TaskCard } from './TaskCard';
import { ListTodo, Clock, CheckCircle2, Inbox } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  currentUser: User | null;
  allUsers: User[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClaim: (taskId: string) => void;
  onReassign: (taskId: string, targetUserId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  currentUser,
  allUsers,
  onEdit,
  onDelete,
  onClaim,
  onReassign,
}) => {
  const getHeaderStyle = () => {
    switch (status) {
      case 'To Do':
        return {
          icon: <ListTodo className="w-4.5 h-4.5 text-sky-400" />,
          border: 'border-sky-500/30',
          badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          indicator: 'bg-sky-400',
        };
      case 'Doing':
        return {
          icon: <Clock className="w-4.5 h-4.5 text-amber-400" />,
          border: 'border-amber-500/30',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          indicator: 'bg-amber-400',
        };
      case 'Done':
        return {
          icon: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />,
          border: 'border-emerald-500/30',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          indicator: 'bg-emerald-400',
        };
    }
  };

  const style = getHeaderStyle();

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-gray-800 p-4 shadow-xl">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
        <div className="flex items-center space-x-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${style.indicator}`} />
          {style.icon}
          <h2 className="font-bold text-gray-200 text-sm tracking-wide">{status}</h2>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.badge}`}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[350px] transition-colors rounded-xl p-1.5 ${
              snapshot.isDraggingOver
                ? 'bg-gray-800/40 ring-1 ring-indigo-500/40 border-dashed border border-indigo-500/50'
                : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                currentUser={currentUser}
                allUsers={allUsers}
                onEdit={onEdit}
                onDelete={onDelete}
                onClaim={onClaim}
                onReassign={onReassign}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-800 rounded-xl my-auto">
                <Inbox className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-xs font-medium text-gray-500">No tasks in {status}</p>
                <p className="text-[10px] text-gray-600 mt-1">
                  Drag a task here or create a new one
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
