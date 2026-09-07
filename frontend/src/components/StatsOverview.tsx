'use client';

import React from 'react';
import { Task } from '../types';
import { Flame, CheckCircle2, Clock, ListTodo, AlertCircle, Users, LayoutGrid } from 'lucide-react';

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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Tasks */}
      <div className="bg-[#141417] border border-[#242429] p-4 rounded-3xl flex items-center justify-between shadow-md">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Tasks</p>
          <p className="font-heading text-2xl font-black text-white mt-0.5">{totalTasks}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1e1e24] border border-[#2e2e36] text-[#ff9f1c] flex items-center justify-center">
          <LayoutGrid className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* To Do */}
      <div className="bg-[#141417] border border-[#242429] p-4 rounded-3xl flex items-center justify-between shadow-md">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff9f1c]">To Do</p>
          <p className="font-heading text-2xl font-black text-[#ff9f1c] mt-0.5">{todoTasks}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#ff9f1c] flex items-center justify-center">
          <ListTodo className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* Doing */}
      <div className="bg-[#141417] border border-[#242429] p-4 rounded-3xl flex items-center justify-between shadow-md">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">Doing</p>
          <p className="font-heading text-2xl font-black text-blue-400 mt-0.5">{doingTasks}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
          <Clock className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* Done */}
      <div className="bg-[#141417] border border-[#242429] p-4 rounded-3xl flex items-center justify-between shadow-md">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Done</p>
          <p className="font-heading text-2xl font-black text-emerald-400 mt-0.5">{doneTasks}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* Unassigned Tasks */}
      <div className="bg-[#141417] border border-[#242429] p-4 rounded-3xl flex items-center justify-between shadow-md">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">Unassigned</p>
          <p className="font-heading text-2xl font-black text-purple-300 mt-0.5">{unassignedTasks}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
          <AlertCircle className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* System Users (Admin view) */}
      {isAdmin && (
        <div className="bg-[#141417] border border-amber-500/30 p-4 rounded-3xl flex items-center justify-between shadow-md bg-amber-500/5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">System Users</p>
            <p className="font-heading text-2xl font-black text-amber-200 mt-0.5">{usersCount}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>
      )}
    </div>
  );
};
