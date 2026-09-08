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
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[#09090b]/95 backdrop-blur-lg border-b border-[#242429] px-3 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & WORKSPACE Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-amber-500 group-hover:border-amber-500 transition-all shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff9f1c]" />
              </div>
              <span className="font-heading font-extrabold text-lg sm:text-2xl tracking-wider text-white uppercase">
                LESS TASK
              </span>
            </Link>
          </div>

          {/* User Info & Navigation */}
          {user && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Desktop Route Tabs */}
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
                className={`flex items-center space-x-1.5 sm:space-x-2 bg-[#141417] border px-2.5 sm:px-3 py-1 rounded-full transition-all hover:border-[#ff9f1c]/50 ${
                  pathname === '/profile' ? 'border-[#ff9f1c]' : 'border-[#242429]'
                }`}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#ff9f1c] text-black font-extrabold flex items-center justify-center text-[10px] uppercase shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-gray-200 hidden md:inline">
                  {user.name}
                </span>

                {user.role === 'admin' ? (
                  <span className="hidden xs:inline-flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Admin</span>
                  </span>
                ) : (
                  <span className="hidden xs:inline-flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase">
                    <UserIcon className="w-2.5 h-2.5" />
                    <span>User</span>
                  </span>
                )}
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sign Out"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#18181b] border border-[#27272a] hover:bg-red-500/20 hover:border-red-500/40 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile screens < 640px) */}
      {user && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur-xl border-t border-[#242429] py-2 px-6 flex justify-around items-center shadow-2xl">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center space-y-1 text-[10px] font-bold transition-all ${
              pathname === '/dashboard' ? 'text-[#ff9f1c]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-full ${pathname === '/dashboard' ? 'bg-[#ff9f1c]/10 border border-[#ff9f1c]/30' : ''}`}>
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span>Board</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin/users"
              className={`flex flex-col items-center space-y-1 text-[10px] font-bold transition-all ${
                pathname === '/admin/users' ? 'text-[#ff9f1c]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-full ${pathname === '/admin/users' ? 'bg-[#ff9f1c]/10 border border-[#ff9f1c]/30' : ''}`}>
                <Users className="w-4 h-4" />
              </div>
              <span>Users</span>
            </Link>
          )}

          <Link
            href="/profile"
            className={`flex flex-col items-center space-y-1 text-[10px] font-bold transition-all ${
              pathname === '/profile' ? 'text-[#ff9f1c]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-full ${pathname === '/profile' ? 'bg-[#ff9f1c]/10 border border-[#ff9f1c]/30' : ''}`}>
              <UserIcon className="w-4 h-4" />
            </div>
            <span>Profile</span>
          </Link>
        </div>
      )}

      {/* Floating Action Button (FAB) - Create Task */}
      {user && onOpenCreateModal && (
        <button
          onClick={onOpenCreateModal}
          title="Create New Task"
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-40 flex items-center justify-center space-x-0 sm:space-x-2 w-12 h-12 sm:w-auto sm:h-auto sm:px-5 sm:py-4 rounded-full bg-[#ff9f1c] hover:bg-amber-400 text-black font-heading font-black text-xs tracking-wider uppercase shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 ring-4 ring-amber-500/25 group"
        >
          <Plus className="w-5 h-5 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
          <span className="hidden sm:inline font-extrabold">New Task</span>
        </button>
      )}
    </>
  );
};
