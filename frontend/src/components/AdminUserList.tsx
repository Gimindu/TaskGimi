'use client';

import React from 'react';
import { User, Task } from '../types';
import { ShieldCheck, User as UserIcon, CheckSquare, CheckCircle2, XCircle, Clock, UserCheck, UserX } from 'lucide-react';

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
    <div className="glass-panel rounded-2xl border border-gray-800 p-6 shadow-xl mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-100 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>Admin Control: User Directory & Approvals</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Approve or decline new user registrations to prevent spammers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold animate-pulse flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingCount} Pending Approval{pendingCount !== 1 ? 's' : ''}</span>
            </span>
          )}
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs font-semibold">
            {users.length} Total User{users.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-900/80 text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Approval Status</th>
              <th className="py-3 px-4">Assigned Tasks</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {users.map((u) => {
              const uId = u.id || u._id || '';
              const isPending = u.isApproved === false;
              const assignedCount = tasks.filter((t) => {
                const assignedObj = typeof t.assignedUser === 'object' ? t.assignedUser : null;
                const aId = assignedObj ? (assignedObj.id || assignedObj._id) : typeof t.assignedUser === 'string' ? t.assignedUser : null;
                return aId === uId;
              }).length;

              return (
                <tr key={uId} className={`transition-colors ${isPending ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-gray-900/40'}`}>
                  <td className="py-3 px-4 font-semibold text-gray-100 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-mono">{u.email}</td>
                  <td className="py-3 px-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase">
                        <UserIcon className="w-3 h-3 text-blue-400" />
                        <span>User</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isPending ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Clock className="w-3 h-3" />
                        <span>Pending Approval</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approved</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center space-x-1 font-semibold text-gray-200">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{assignedCount} task{assignedCount !== 1 ? 's' : ''}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'admin' && (
                      <div className="flex items-center justify-end space-x-2">
                        {isPending && (
                          <button
                            onClick={() => onApproveUser(uId)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDeclineUser(uId)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 text-[11px] font-medium transition-all"
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
    </div>
  );
};
