'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { ADMIN_ROLES } from '@/types/admin';
import type { AdminRole } from '@/types/admin';

interface Props {
  children:      React.ReactNode;
  requiredRole?: AdminRole;
}

/**
 * AdminGuard
 *
 * Protects every /admin/* page. Shows a spinner while session is being
 * restored from localStorage (loading=true), then makes exactly one
 * redirect decision. No loop possible because:
 *
 *   - loading starts TRUE (see useAuthStore)
 *   - the guard returns a spinner and does nothing while loading=true
 *   - hydrate() runs once, sets loading=false
 *   - the guard then checks user exactly once and either lets through or
 *     redirects to /admin/login — never redirects back to /admin
 */
export default function AdminGuard({ children, requiredRole }: Props) {
  const router  = useRouter();
  const user    = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);

  useEffect(() => {
    if (loading) return; // still hydrating — do nothing

    if (!user) {
      router.replace('/admin/login');
      return;
    }

    const roles = (user.roles ?? []) as AdminRole[];

    if (!roles.some(r => ADMIN_ROLES.includes(r))) {
      router.replace('/admin/login?error=unauthorized');
      return;
    }

    if (requiredRole && !roles.includes(requiredRole)) {
      router.replace('/admin');
    }
  }, [loading, user, router, requiredRole]);

  // Always show spinner while hydrating
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 border-cni-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Hydration done, no valid admin user — blank while redirect fires
  if (!user || !(user.roles ?? []).some(r => ADMIN_ROLES.includes(r as AdminRole))) {
    return null;
  }

  return <>{children}</>;
}
