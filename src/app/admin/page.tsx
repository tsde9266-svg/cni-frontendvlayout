'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import AdminShell from '@/components/admin/layout/AdminShell';
import { Card, StatCard, PageHeader, Button } from '@/components/admin/ui/AdminUI';
import { adminDashboardApi, adminSocialPostsApi } from '@/lib/adminApi';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboardPage() {
  const { data: dash, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn:  () => adminDashboardApi.overview().then(r => r.data.data),
    staleTime: 60000,
  });

  const { data: socialStats } = useQuery({
    queryKey: ['social-stats'],
    queryFn:  () => adminSocialPostsApi.stats().then(r => r.data),
    staleTime: 30000,
  });

  return (
    <AdminShell>
      <PageHeader
        title="Dashboard"
        subtitle="CNI News Network — Overview"
      />

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Articles published"
          value={isLoading ? '…' : (dash?.articles?.published ?? 0)}
          trend={dash?.articles?.today > 0 ? `+${dash.articles.today} today` : undefined}
        />
        <StatCard
          label="Pending review"
          value={isLoading ? '…' : (dash?.articles?.pending_review ?? 0)}
          trend={dash?.articles?.pending_review > 0 ? 'Needs attention' : 'All clear'}
          trendDown={dash?.articles?.pending_review > 0}
        />
        <StatCard
          label="Members"
          value={isLoading ? '…' : (dash?.users?.total ?? 0)}
          trend={dash?.users?.new_this_week > 0 ? `+${dash.users.new_this_week} this week` : undefined}
        />
        <StatCard
          label="Comments"
          value={isLoading ? '…' : (dash?.comments?.pending ?? 0)}
          trend={dash?.comments?.pending > 0 ? 'Awaiting moderation' : 'All moderated'}
          trendDown={dash?.comments?.pending > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Recent articles ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-inter)' }}>
              Recent Articles
            </h2>
            <Link href="/admin/articles">
              <Button variant="ghost" size="sm">View all →</Button>
            </Link>
          </div>

          <Card className="divide-y divide-gray-100">
            {isLoading ? (
              [1,2,3,4,5].map(i => (
                <div key={i} className="p-3 flex gap-3 items-center">
                  <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))
            ) : (dash?.recent_articles ?? []).length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">No articles yet</p>
            ) : (
              (dash?.recent_articles ?? []).slice(0, 8).map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/articles/${a.id}/edit`}
                      className="text-sm font-medium text-gray-900 hover:text-cni-blue line-clamp-1 no-underline"
                      style={{ fontFamily: 'var(--font-inter)' }}>
                      {a.title ?? `Article #${a.id}`}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'var(--font-inter)' }}>
                      {a.category} · {a.published_at
                        ? formatDistanceToNow(new Date(a.published_at), { addSuffix: true })
                        : 'Draft'}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    a.status === 'published'      ? 'bg-green-100 text-green-700' :
                    a.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                    a.status === 'scheduled'      ? 'bg-blue-100 text-blue-700'   :
                    'bg-gray-100 text-gray-500'
                  }`} style={{ fontFamily: 'var(--font-inter)' }}>
                    {a.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* ── Right column ──────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Social Hub widget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-inter)' }}>
                Social Hub
              </h2>
              <Link href="/admin/social">
                <Button variant="ghost" size="sm">Manage →</Button>
              </Link>
            </div>
            <Card className="p-4 space-y-3">
              {[
                { label: 'Published',  value: socialStats?.counts?.published  ?? 0, color: 'text-green-600'  },
                { label: 'Queued',     value: socialStats?.counts?.queued     ?? 0, color: 'text-blue-600'   },
                { label: 'Failed',     value: socialStats?.counts?.failed     ?? 0, color: 'text-red-600'    },
                { label: 'Scheduled',  value: socialStats?.counts?.scheduled  ?? 0, color: 'text-purple-600' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-inter)' }}>
                    {s.label}
                  </span>
                  <span className={`text-sm font-bold ${s.color}`} style={{ fontFamily: 'var(--font-inter)' }}>
                    {s.value}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <Link href="/admin/social">
                  <Button variant="primary" size="sm" className="w-full justify-center">
                    + New Social Post
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2"
              style={{ fontFamily: 'var(--font-inter)' }}>
              Quick Links
            </h2>
            <Card className="divide-y divide-gray-100">
              {[
                { label: '+ New Article',     href: '/admin/articles/new'   },
                { label: 'Pending Review',    href: '/admin/articles?status=pending_review' },
                { label: 'Comments',          href: '/admin/comments'        },
                { label: 'Media Library',     href: '/admin/media'           },
                { label: 'Users',             href: '/admin/users'           },
                { label: 'Settings',          href: '/admin/settings'        },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:text-cni-blue hover:bg-gray-50 transition-colors no-underline"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  {link.label}
                </Link>
              ))}
            </Card>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}
