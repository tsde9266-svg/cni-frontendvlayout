'use client';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuthStore';
import { ADMIN_ROLES } from '@/types/admin';
import type { AdminRole } from '@/types/admin';

export default function AuthButton() {
  const { user, logout } = useAuthStore();

  if (user) {
    const roles   = (user.roles ?? []) as AdminRole[];
    const isStaff = roles.some(r => ADMIN_ROLES.includes(r));

    return (
      <div className="flex items-center gap-2">
        {user.membership?.badge && (
          <span
            className="text-xs font-bold px-2 py-0.5"
            style={{ backgroundColor: user.membership.badge_color ?? '#003087', color: 'white', fontFamily: 'var(--font-inter)' }}
          >
            {user.membership.badge}
          </span>
        )}

        {isStaff && (
          <Link href="/admin"
            className="text-xs font-bold text-cni-blue border border-cni-blue px-2 py-1 no-underline
                       hover:bg-cni-blue hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-inter)' }}>
            Admin
          </Link>
        )}

        <span className="text-gray-700 text-xs hidden sm:block"
          style={{ fontFamily: 'var(--font-inter)' }}>
          {user.display_name}
        </span>

        <button onClick={logout}
          className="text-gray-600 hover:text-cni-red text-xs transition-colors"
          style={{ fontFamily: 'var(--font-inter)' }}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Sign In — dark text, clearly visible on white header */}
      <Link href="/login"
        className="text-sm font-medium text-gray-800 hover:text-cni-blue no-underline transition-colors px-1">
        Sign In
      </Link>
      {/* Join — solid red pill, high contrast */}
      <Link href="/register"
        className="text-sm font-bold text-white bg-cni-blue hover:bg-cni-blue-dark px-3 py-1.5 no-underline transition-colors">
        Join
      </Link>
    </div>
  );
}
