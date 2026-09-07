'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, ShieldCheck, User as UserIcon, Kanban, LayoutGrid, Users } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateModal }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/80 px-4 sm:px-8 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
                <Kanban className="w-5.5 h-5.5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                Task Gimi
              </h1>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest hidden sm:block">
                Task Management System
              </p>
            </div>
          </Link>

          {/* Navigation Tabs */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-gray-800">
              <Link
                href="/dashboard"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Task Board</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin/users"
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/admin/users'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-gray-400 hover:text-amber-300 hover:bg-gray-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>User Directory</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* New Task Button */}
            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Task</span>
              </button>
            )}

            {/* Admin Dedicated Page Nav for Mobile */}
            {isAdmin && (
              <Link
                href="/admin/users"
                className="md:hidden p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                title="User Directory"
              >
                <Users className="w-5 h-5" />
              </Link>
            )}

            {/* Profile Info */}
            <div className="flex items-center space-x-2.5 bg-gray-900/80 border border-gray-800 px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col hidden lg:flex">
                <span className="text-xs font-semibold text-gray-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-gray-400">{user.email}</span>
              </div>
              
              {/* Role Badge */}
              {user.role === 'admin' ? (
                <span className="ml-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>Admin</span>
                </span>
              ) : (
                <span className="ml-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                  <UserIcon className="w-3 h-3 text-blue-400" />
                  <span>User</span>
                </span>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
