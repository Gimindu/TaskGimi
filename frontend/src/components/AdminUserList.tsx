'use client';

import React from 'react';
import { User, Task } from '../types';
import { ShieldCheck, User as UserIcon, CheckSquare, CheckCircle2, Clock, UserCheck, UserX, Mail } from 'lucide-react';

interface AdminUserListProps {
  users: User[];
  tasks: Task[];
  onApproveUser: (userId: string) => void;
  onDeclineUser: (userId: string) => void;
}

export const AdminUserList: React.FC<AdminUserListProps> = ({
  users,
  tasks,
  onApproveUser,
  onDeclineUser,
}) => {
  const pendingCount = users.filter((u) => u.isApproved === false).length;

  return (
    <div className="bg-[#141417] rounded-3xl border border-[#242429] p-4 sm:p-6 shadow-md mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-heading font-extrabold text-base text-white flex items-center space-x-2">
            <ShieldCheck className="w-4.5 h-4.5 text-[#ff9f1c]" />
            <span>Registered Users Directory</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            Approve pending user signups and manage account privileges.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-black animate-pulse flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingCount} Pending</span>
            </span>
          )}
          <span className="px-3 py-1 bg-[#18181b] border border-[#27272a] text-[#ff9f1c] rounded-full text-xs font-black">
            {users.length} User{users.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Desktop Table View (Visible on Medium+ screens >= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#09090b] text-gray-400 uppercase tracking-wider text-[10px] font-extrabold border-b border-[#242429]">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Approval Status</th>
              <th className="py-3 px-4">Assigned Tasks</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242429]">
            {users.map((u) => {
              const uId = u.id || u._id || '';
              const isPending = u.isApproved === false;
              const assignedCount = tasks.filter((t) => {
                const assignedObj = typeof t.assignedUser === 'object' ? t.assignedUser : null;
                const aId = assignedObj ? (assignedObj.id || assignedObj._id) : typeof t.assignedUser === 'string' ? t.assignedUser : null;
                return aId === uId;
              }).length;

              return (
                <tr key={uId} className={`transition-colors ${isPending ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-[#18181b]'}`}>
                  <td className="py-3 px-4 font-bold text-white flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#ff9f1c] text-black font-black flex items-center justify-center text-[10px] uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">{u.email}</td>
                  <td className="py-3 px-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                        <UserIcon className="w-3 h-3 text-blue-400" />
                        <span>User</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isPending ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approved</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center space-x-1 text-gray-200 font-bold">
                      <CheckSquare className="w-3.5 h-3.5 text-[#ff9f1c]" />
                      <span>{assignedCount} task{assignedCount !== 1 ? 's' : ''}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'admin' && (
                      <div className="flex items-center justify-end space-x-2">
                        {isPending && (
                          <button
                            onClick={() => onApproveUser(uId)}
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-sm active:scale-95"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDeclineUser(uId)}
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>{isPending ? 'Decline' : 'Remove'}</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (Visible on Mobile screens < 768px) */}
      <div className="md:hidden space-y-3">
        {users.map((u) => {
          const uId = u.id || u._id || '';
          const isPending = u.isApproved === false;
          const assignedCount = tasks.filter((t) => {
            const assignedObj = typeof t.assignedUser === 'object' ? t.assignedUser : null;
            const aId = assignedObj ? (assignedObj.id || assignedObj._id) : typeof t.assignedUser === 'string' ? t.assignedUser : null;
            return aId === uId;
          }).length;

          return (
            <div
              key={uId}
              className={`p-4 rounded-2xl border transition-all ${
                isPending
                  ? 'bg-amber-500/5 border-amber-500/30'
                  : 'bg-[#18181c] border-[#27272a]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ff9f1c] text-black font-black flex items-center justify-center text-xs uppercase shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-white">{u.name}</h3>
                    <p className="text-xs text-gray-400 font-mono flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-amber-500 shrink-0 inline mr-1" />
                      <span className="truncate max-w-[180px]">{u.email}</span>
                    </p>
                  </div>
                </div>

                {/* Role Pill */}
                {u.role === 'admin' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Admin
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                    User
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#242429] mt-3">
                <div className="flex items-center space-x-2 text-xs">
                  {isPending ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  )}

                  <span className="text-gray-400 text-[11px] font-bold">
                    {assignedCount} task{assignedCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {u.role !== 'admin' && (
                  <div className="flex items-center space-x-2">
                    {isPending && (
                      <button
                        onClick={() => onApproveUser(uId)}
                        className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => onDeclineUser(uId)}
                      className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold"
                    >
                      {isPending ? 'Decline' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
