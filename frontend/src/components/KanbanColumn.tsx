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
          icon: <ListTodo className="w-4 h-4 text-[#ff9f1c]" />,
          pill: 'border-[#ff9f1c]/50 text-[#ff9f1c]',
        };
      case 'Doing':
        return {
          icon: <Clock className="w-4 h-4 text-emerald-400" />,
          pill: 'border-emerald-500/50 text-emerald-400',
        };
      case 'Done':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-red-400" />,
          pill: 'border-red-500/50 text-red-400',
        };
    }
  };

  const style = getHeaderStyle();

  return (
    <div className="flex flex-col h-full rounded-3xl bg-[#141417] border border-[#242429] p-4 shadow-md">
      {/* Header (Matching Reference UI: "Today's Tasks 9" Header Style) */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#242429]">
        <div className="flex items-center space-x-2.5">
          {style.icon}
          <h2 className="font-heading font-extrabold text-lg text-white tracking-wide">{status}</h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${style.pill}`}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[380px] transition-colors rounded-2xl p-1 ${
              snapshot.isDraggingOver
                ? 'bg-[#18181c] ring-2 ring-[#ff9f1c]/50 border-dashed border border-[#ff9f1c]'
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
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#27272a] rounded-2xl my-auto">
                <Inbox className="w-7 h-7 text-gray-600 mb-2" />
                <p className="font-heading font-bold text-xs text-gray-500">No tasks in {status}</p>
                <p className="text-[10px] text-gray-600 mt-1">Drag task here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
