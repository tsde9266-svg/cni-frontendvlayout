'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useAdminNav } from '@/hooks/useAdminNav';
import { NavIconSvg, XIcon, ExternalLinkIcon, LogOutIcon } from '../ui/Icons';
import { ROLE_LABELS } from '@/types/admin';
import type { AdminRole } from '@/types/admin';
import type { NavItem } from '@/types/admin';
import clsx from 'clsx';
// import { clsx } from 'clsx';

interface Props {
  collapsed:  boolean;
  onCollapse: (val: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const user     = useAuthStore(s => s.user);
  const logout   = useAuthStore(s => s.logout);
  const { nav }  = useAdminNav();

  const primaryRole = ((user?.roles ?? []) as AdminRole[])[0];
  const roleLabel   = ROLE_LABELS[primaryRole] ?? 'Staff';

  const isActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Split nav into sections
  const contentNav  = nav.filter(i => ['dashboard','articles','comments','media','categories','tags'].includes(i.icon));
  const engageNav   = nav.filter(i => ['social','live','events'].includes(i.icon));
  const adminNav    = nav.filter(i => ['users','authors','memberships','promo','payments','ads'].includes(i.icon));
  const systemNav   = nav.filter(i => ['seo','audit','settings'].includes(i.icon));

  function NavSection({ items, label }: { items: NavItem[], label: string }) {
    if (!items.length) return null;
    return (
      <div className="mb-4">
        {!collapsed && (
          <p className="px-3 mb-1 text-[10px] font-ui font-semibold uppercase tracking-widest text-gray-400">
            {label}
          </p>
        )}
        <ul className="space-y-0.5">
          {items.map(item => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={clsx(
                    'group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-ui font-medium transition-all duration-150',
                    active
                      ? 'bg-cni-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <NavIconSvg
                    name={item.icon}
                    className={clsx(
                      'flex-shrink-0',
                      collapsed ? 'w-5 h-5' : 'w-4 h-4',
                      active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge != null && item.badge > 0 && (
                    <span className={clsx(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                      active ? 'bg-white/20 text-white' : 'bg-cni-red text-white'
                    )}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Brand header */}
      <div className={clsx(
        'flex items-center border-b border-gray-200 flex-shrink-0',
        collapsed ? 'h-14 justify-center px-2' : 'h-14 px-4 gap-3'
      )}>
        <div className="w-8 h-8 bg-cni-blue flex items-center justify-center flex-shrink-0">
          <span className="text-white font-headline font-bold text-sm">C</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-headline font-bold text-gray-900 text-sm truncate">CNI Admin</p>
            <p className="text-[10px] font-ui text-gray-400 truncate">News Network</p>
          </div>
        )}
        {/* Mobile close */}
        <button
          className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          onClick={onMobileClose}
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* User pill */}
      <div className={clsx(
        'flex items-center border-b border-gray-100 flex-shrink-0',
        collapsed ? 'py-3 justify-center' : 'px-3 py-3 gap-2.5'
      )}>
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-cni-blue-light border-2 border-cni-blue flex items-center justify-center flex-shrink-0">
          <span className="text-cni-blue font-ui font-bold text-[11px]">
            {user?.display_name?.[0]?.toUpperCase() ?? 'A'}
          </span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-ui font-semibold text-gray-900 truncate">{user?.display_name}</p>
            <p className="text-[10px] font-ui text-gray-400 truncate">{roleLabel}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0">
        <NavSection items={contentNav}  label="Content" />
        <NavSection items={engageNav}   label="Engage" />
        <NavSection items={adminNav}    label="Admin" />
        <NavSection items={systemNav}   label="System" />
      </nav>

      {/* Footer actions */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-ui text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title={collapsed ? 'View site' : undefined}
        >
          <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>View site</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-ui text-gray-500 hover:bg-red-50 hover:text-cni-red transition-colors"
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOutIcon className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-md text-xs font-ui text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            {collapsed
              ? <path strokeLinecap="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
              : <path strokeLinecap="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7"/>
            }
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="relative z-10 flex flex-col w-64 bg-white h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
