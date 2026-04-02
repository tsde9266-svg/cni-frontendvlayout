'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { NavItem, AdminRole } from '@/types/admin';
import { ADMIN_ROLES } from '@/types/admin';

/**
 * Full nav definition.
 * Items without `roles` are visible to all admin roles.
 * Items with `roles` are only shown to users with one of those roles.
 */
const NAV_DEFINITION: NavItem[] = [
  {
    label: 'Dashboard',
    href:  '/admin',
    icon:  'dashboard',
  },
  {
    label: 'Articles',
    href:  '/admin/articles',
    icon:  'articles',
  },
  {
    label: 'Comments',
    href:  '/admin/comments',
    icon:  'comments',
  },
  {
    label: 'Media',
    href:  '/admin/media',
    icon:  'media',
    roles: ['super_admin', 'admin', 'editor'],
  },
  {
    label: 'Categories',
    href:  '/admin/categories',
    icon:  'categories',
    roles: ['super_admin', 'admin', 'editor'],
  },
  {
    label: 'Tags',
    href:  '/admin/tags',
    icon:  'tags',
    roles: ['super_admin', 'admin', 'editor'],
  },
  {
    label: 'Social Hub',
    href:  '/admin/social',
    icon:  'social',
    roles: ['super_admin', 'admin', 'editor'],
  },
  {
    label: 'Live Streams',
    href:  '/admin/live',
    icon:  'live',
    roles: ['super_admin', 'admin', 'editor'],
  },
  {
    label: 'Events',
    href:  '/admin/events',
    icon:  'events',
    roles: ['super_admin', 'admin', 'editor'],
  },
  {
    label: 'Users',
    href:  '/admin/users',
    icon:  'users',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Authors',
    href:  '/admin/authors',
    icon:  'authors',
    roles: ['super_admin', 'admin', 'editor'],
  },
  {
    label: 'Memberships',
    href:  '/admin/memberships',
    icon:  'memberships',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Promo Codes',
    href:  '/admin/promo-codes',
    icon:  'promo',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Payments',
    href:  '/admin/payments',
    icon:  'payments',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'SEO Redirects',
    href:  '/admin/seo-redirects',
    icon:  'seo',
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Audit Log',
    href:  '/admin/audit-log',
    icon:  'audit',
    roles: ['super_admin'],
  },
  {
    label: 'Settings',
    href:  '/admin/settings',
    icon:  'settings',
    roles: ['super_admin', 'admin'],
  },
];

export function useAdminNav() {
  const user = useAuthStore(s => s.user);

  const userRoles = useMemo<AdminRole[]>(
    () => (user?.roles ?? []) as AdminRole[],
    [user]
  );

  const isAdmin = useMemo(
    () => userRoles.some(r => ADMIN_ROLES.includes(r)),
    [userRoles]
  );

  const filteredNav = useMemo(() =>
    NAV_DEFINITION.filter(item =>
      !item.roles || item.roles.some(r => userRoles.includes(r))
    ),
    [userRoles]
  );

  return { nav: filteredNav, isAdmin, userRoles };
}
