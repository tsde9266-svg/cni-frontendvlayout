'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuthStore } from '@/hooks/useAuthStore';
import { membershipApi, articlesApi } from '@/lib/api';
import type { Article } from '@/types';
import ArticleCard from '@/components/article/ArticleCard';

export default function AccountPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuthStore();

  // Redirect if not logged in
  useEffect(() => {
    if (user === null && typeof window !== 'undefined') {
      router.push('/login?redirect=/account');
    }
  }, [user, router]);

  const justSubscribed = searchParams.get('subscribed') === '1';

  const { data: membershipData } = useQuery({
    queryKey: ['my-membership'],
    queryFn:  () => membershipApi.myMembership().then(r => r.data.data),
    enabled:  !!user,
  });

  const { data: myArticlesData } = useQuery({
    queryKey: ['my-articles'],
    queryFn:  () => articlesApi.list({ author_id: user?.id, per_page: 6 }).then(r => r.data),
    enabled:  !!user,
  });

  const myArticles: Article[] = myArticlesData?.data ?? [];

  if (!user) {
    return <div className="max-w-[1280px] mx-auto px-4 py-16 text-center">
      <div className="h-8 w-48 bg-gray-200 animate-pulse mx-auto" />
    </div>;
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">

      {/* Success banner */}
      {justSubscribed && (
        <div className="bg-green-50 border border-green-400 text-green-800 font-ui text-sm px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-bold">Subscription activated!</p>
            <p>Welcome to {membershipData?.plan ?? 'CNI News'}. Your benefits are now active.</p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="section-divider mb-8">
        <h1 className="font-headline text-3xl font-bold text-gray-900">My Account</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* ── Left: main content ──────────────────────────────────────── */}
        <div className="space-y-8">

          {/* Profile card */}
          <section className="bg-white border border-gray-200 p-6">
            <h2 className="font-ui font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Profile</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-cni-blue flex items-center justify-center text-white font-headline text-xl font-bold">
                {user.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-ui font-bold text-gray-900 text-lg">{user.display_name}</p>
                <p className="text-sm font-ui text-gray-500">{user.email}</p>
                {membershipData?.badge && (
                  <span
                    className="inline-block text-xs font-ui font-bold px-2 py-0.5 mt-1"
                    style={{ backgroundColor: membershipData.badge_color ?? '#003087', color: 'white' }}
                  >
                    {membershipData.badge}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* My articles (shown if user has written any) */}
          {myArticles.length > 0 && (
            <section>
              <div className="section-divider mb-4 flex items-center justify-between">
                <h2 className="font-headline text-xl font-bold text-gray-900">My Articles</h2>
                <Link href="/write" className="text-xs font-ui font-semibold text-cni-blue hover:text-cni-red no-underline">
                  Write New +
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myArticles.map(a => (
                  <ArticleCard key={a.id} article={a} variant="horizontal" />
                ))}
              </div>
            </section>
          )}

          {/* Quick links */}
          <section className="bg-white border border-gray-200 p-6">
            <h2 className="font-ui font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Browse Pakistan',  href: '/category/pakistan' },
                { label: 'Browse Kashmir',   href: '/category/kashmir' },
                { label: 'Live Streams',     href: '/live' },
                { label: 'Upcoming Events',  href: '/events' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-gray-200 px-4 py-3 text-sm font-ui font-semibold
                             text-gray-700 hover:border-cni-blue hover:text-cni-blue
                             transition-colors no-underline text-center"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right: sidebar ──────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Membership status */}
          <section className="border-2 border-cni-blue p-6">
            <h2 className="font-ui font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Membership</h2>

            {membershipData ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-sm font-ui font-bold px-3 py-1"
                    style={{ backgroundColor: membershipData.badge_color ?? '#003087', color: 'white' }}
                  >
                    {membershipData.badge ?? membershipData.plan}
                  </span>
                  <span className={`text-xs font-ui font-semibold uppercase ${
                    membershipData.status === 'active' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {membershipData.status}
                  </span>
                </div>

                {membershipData.end_date && (
                  <p className="text-xs font-ui text-gray-500 mb-4">
                    {membershipData.status === 'active' ? 'Renews' : 'Expires'}{' '}
                    {format(new Date(membershipData.end_date), 'd MMM yyyy')}
                  </p>
                )}

                <div className="space-y-1 mb-4">
                  {Object.entries(membershipData.features ?? {})
                    .filter(([, v]) => v === true)
                    .map(([k]) => (
                      <p key={k} className="text-xs font-ui text-gray-700 flex items-center gap-1">
                        <span className="text-green-500">✓</span>
                        {k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    ))}
                </div>

                {membershipData.is_free ? (
                  <Link href="/membership" className="btn-primary block text-center text-sm no-underline">
                    Upgrade Plan
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/membership" className="flex-1 text-center text-xs font-ui py-2 border border-gray-300 hover:border-cni-blue text-gray-600 hover:text-cni-blue no-underline transition-colors">
                      Change Plan
                    </Link>
                    <Link href="/account/cancel" className="flex-1 text-center text-xs font-ui py-2 border border-gray-300 hover:border-red-400 text-gray-600 hover:text-red-600 no-underline transition-colors">
                      Cancel
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-ui text-gray-600 mb-4">You don&apos;t have an active membership.</p>
                <Link href="/membership" className="btn-primary block text-center text-sm no-underline">
                  View Plans
                </Link>
              </div>
            )}
          </section>

          {/* Account actions */}
          <section className="bg-white border border-gray-200 p-6">
            <h2 className="font-ui font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">Account</h2>
            <div className="space-y-2">
              <Link href="/account/settings" className="block text-sm font-ui text-gray-700 hover:text-cni-blue no-underline py-1.5 border-b border-gray-100">
                Account Settings →
              </Link>
              <Link href="/account/notifications" className="block text-sm font-ui text-gray-700 hover:text-cni-blue no-underline py-1.5 border-b border-gray-100">
                Notification Preferences →
              </Link>
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="block w-full text-left text-sm font-ui text-cni-red hover:text-cni-red-dark py-1.5"
              >
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
