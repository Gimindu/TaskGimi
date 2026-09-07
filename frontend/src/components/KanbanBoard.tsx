'use client';

import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus, User } from '../types';
import { KanbanColumn } from './KanbanColumn';

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
  tasks,
  currentUser,
  allUsers,
  onStatusChange,
  onEdit,
  onDelete,
  onClaim,
  onReassign,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid column or in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    onStatusChange(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNS.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columnTasks}
              currentUser={currentUser}
              allUsers={allUsers}
              onEdit={onEdit}
              onDelete={onDelete}
              onClaim={onClaim}
              onReassign={onReassign}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};
