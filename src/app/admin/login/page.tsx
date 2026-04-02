'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { ADMIN_ROLES } from '@/types/admin';
import type { AdminRole } from '@/types/admin';
import { Input, Button } from '@/components/admin/ui/AdminUI';

function AdminLoginPage() {
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect') ?? '/admin';

  const user    = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);
  const login   = useAuthStore(s => s.login);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);

  // If user is already an admin, redirect immediately after hydration
  useEffect(() => {
    if (loading) return;
    if (!user)   return;

    const roles = (user.roles ?? []) as AdminRole[];
    if (roles.some(r => ADMIN_ROLES.includes(r))) {
      // Hard navigation — avoids Next.js router race with AdminGuard
      window.location.href = redirectTo;
    }
  }, [loading, user, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      // useEffect above triggers redirect once user is set in store
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Invalid email or password.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  // Spinner while: (a) hydrating session, or (b) already logged in and redirecting
  const isRedirecting =
    loading ||
    (!loading && !!user && (user.roles ?? []).some(r => ADMIN_ROLES.includes(r as AdminRole)));

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 border-cni-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-cni-blue mb-4">
            <span className="text-white font-headline font-bold text-xl">C</span>
          </div>
          <h1 className="font-ui font-bold text-gray-900 text-lg">CNI Admin Panel</h1>
          <p className="text-xs font-ui text-gray-500 mt-1">Sign in to manage CNI News Network</p>
        </div>

        {/* Unauthorized banner */}
        {searchParams.get('error') === 'unauthorized' && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-md text-xs font-ui text-cni-red">
            Your account does not have admin access.
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@cni.co.uk"
              required
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-md text-xs font-ui text-cni-red">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={busy}
              className="w-full justify-center"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] font-ui text-gray-400">
              Default: <span className="font-mono text-gray-600">admin@cni.co.uk</span>
              {' / '}
              <span className="font-mono text-gray-600">ChangeMe2025!</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs font-ui text-gray-400 mt-4">
          <a href="/" className="hover:text-cni-blue no-underline">← Return to CNI News</a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPageWrapper() { return <Suspense><AdminLoginPage /></Suspense>; }
