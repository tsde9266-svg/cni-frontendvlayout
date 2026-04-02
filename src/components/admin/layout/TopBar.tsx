'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuthStore';
import { MenuIcon, BellIcon, SearchIcon, ChevronRightIcon } from '../ui/Icons';
import type { Breadcrumb } from '@/types/admin';
import clsx from 'clsx';
// import { clsx } from 'clsx';

interface Props {
  breadcrumbs?:  Breadcrumb[];
  onMobileMenu:  () => void;
  /** Additional actions rendered on the right side of the bar */
  actions?:      React.ReactNode;
}

export default function TopBar({ breadcrumbs = [], onMobileMenu, actions }: Props) {
  const user   = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0 z-30">

      {/* Mobile menu button */}
      <button
        className="lg:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
        onClick={onMobileMenu}
        aria-label="Open menu"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex-1 flex items-center gap-1.5 min-w-0">
        <Link
          href="/admin"
          className="text-xs font-ui text-gray-400 hover:text-cni-blue shrink-0 no-underline"
        >
          Admin
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            <ChevronRightIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />
            {crumb.href ? (
              <Link
                href={crumb.href}
                className={clsx(
                  'text-xs font-ui truncate no-underline',
                  i === breadcrumbs.length - 1
                    ? 'text-gray-800 font-medium pointer-events-none'
                    : 'text-gray-400 hover:text-cni-blue'
                )}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-xs font-ui text-gray-800 font-medium truncate">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Page-level actions slot */}
        {actions}

        {/* Search shortcut */}
        <button
          className="hidden sm:flex items-center gap-2 text-xs font-ui text-gray-400 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
          onClick={() => {/* global search — wired in S3 */}}
          title="Search (⌘K)"
        >
          <SearchIcon className="w-3.5 h-3.5" />
          <span>Search</span>
          <kbd className="hidden md:inline bg-white border border-gray-200 rounded px-1 text-[10px] text-gray-400">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button
          className="relative p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5" />
          {/* Unread dot — wire to real count in S2 */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-cni-red rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-cni-blue-light border-2 border-cni-blue flex items-center justify-center">
              <span className="text-cni-blue font-ui font-bold text-[11px]">
                {user?.display_name?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <span className="hidden md:block text-xs font-ui font-medium text-gray-700 max-w-[120px] truncate">
              {user?.display_name}
            </span>
          </button>

          {userMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-ui font-semibold text-gray-900 truncate">{user?.display_name}</p>
                  <p className="text-[11px] font-ui text-gray-400 truncate">{user?.email}</p>
                </div>

                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-ui text-gray-700 hover:bg-gray-50 no-underline"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Profile &amp; Settings
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-ui text-gray-700 hover:bg-gray-50 no-underline"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                  View site
                </Link>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-ui text-cni-red hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                      <path strokeLinecap="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
