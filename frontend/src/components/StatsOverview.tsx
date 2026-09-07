'use client';

import React from 'react';
import { Task, User } from '../types';
import { CheckCircle2, Clock, ListTodo, AlertCircle, Users, LayoutGrid } from 'lucide-react';

interface StatsOverviewProps {
  tasks: Task[];
  usersCount?: number;
  isAdmin: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ tasks, usersCount = 0, isAdmin }) => {
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'To Do').length;
  const doingTasks = tasks.filter((t) => t.status === 'Doing').length;
  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const unassignedTasks = tasks.filter((t) => !t.assignedUser).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      {/* Total Tasks */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-gray-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Total Tasks</p>
          <p className="text-2xl font-extrabold text-white mt-1">{totalTasks}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <LayoutGrid className="w-5 h-5" />
        </div>
      </div>

      {/* To Do */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-gray-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">To Do</p>
          <p className="text-2xl font-extrabold text-sky-300 mt-1">{todoTasks}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
          <ListTodo className="w-5 h-5" />
        </div>
      </div>

      {/* Doing */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-gray-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Doing</p>
          <p className="text-2xl font-extrabold text-amber-300 mt-1">{doingTasks}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Done */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-gray-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Done</p>
          <p className="text-2xl font-extrabold text-emerald-300 mt-1">{doneTasks}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Unassigned Tasks */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-gray-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Unassigned</p>
          <p className="text-2xl font-extrabold text-purple-300 mt-1">{unassignedTasks}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Total Users (Admin panel overview) */}
      {isAdmin && (
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-amber-500/20 bg-amber-500/5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Total Users</p>
            <p className="text-2xl font-extrabold text-amber-200 mt-1">{usersCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  );
};
