'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, ShieldCheck, User as UserIcon, LayoutGrid, Users, Target } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
}) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/95 backdrop-blur-lg border-b border-[#242429] px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & WORKSPACE Title */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-amber-500 group-hover:border-amber-500 transition-all">
              <Target className="w-5 h-5 text-[#ff9f1c]" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-wider text-white uppercase">
              LESS TASK
            </span>
          </Link>

          {/* New Task Pill Button */}
          {user && onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-gray-200 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 ml-2"
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center font-bold">
                <Plus className="w-3 h-3 text-black" />
              </span>
              <span>New Task</span>
            </button>
          )}
        </div>

        {/* User Info & Navigation */}
        {user && (
          <div className="flex items-center space-x-3">
            {/* Route Tabs */}
            <nav className="hidden sm:flex items-center space-x-1.5 bg-[#141417] p-1 rounded-full border border-[#242429]">
              <Link
                href="/dashboard"
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-[#ff9f1c] text-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Board</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin/users"
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    pathname === '/admin/users'
                      ? 'bg-[#ff9f1c] text-black shadow-sm'
                      : 'text-gray-400 hover:text-amber-400'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users</span>
                </Link>
              )}
            </nav>

            {/* Profile Avatar Pill */}
            <Link
              href="/profile"
              className={`flex items-center space-x-2 bg-[#141417] border px-3 py-1 rounded-full transition-all hover:border-[#ff9f1c]/50 ${
                pathname === '/profile' ? 'border-[#ff9f1c]' : 'border-[#242429]'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#ff9f1c] text-black font-extrabold flex items-center justify-center text-[10px] uppercase">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-gray-200 hidden md:inline">
                {user.name}
              </span>
              
              {user.role === 'admin' ? (
                <span className="ml-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Admin</span>
                </span>
              ) : (
                <span className="ml-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase">
                  <UserIcon className="w-2.5 h-2.5" />
                  <span>User</span>
                </span>
              )}
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] hover:bg-red-500/20 hover:border-red-500/40 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
