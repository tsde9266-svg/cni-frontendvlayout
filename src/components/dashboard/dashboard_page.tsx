'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  StatCard, PageHeader, Card, CardHeader,
  StatusBadge, Button, EmptyState,
} from '@/components/admin/ui/AdminUI';
import { NavIconSvg, PlusIcon, RefreshIcon, EyeIcon } from '@/components/admin/ui/Icons';
import api from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface DashboardData {
  stats: {
    articles_total:      number;
    articles_pending:    number;
    articles_today:      number;
    articles_scheduled:  number;
    users_total:         number;
    members_active:      number;
    comments_pending:    number;
    views_today:         number;
    views_this_week:     number;
    revenue_this_month:  number;
    live_streams_active: number;
  };
  recent_articles: RecentArticle[];
  pending_queue:   PendingArticle[];
  top_articles:    TopArticle[];
  activity_by_day: { date: string; label: string; count: number }[];
}

interface RecentArticle {
  id: number; slug: string; title: string; status: string;
  type: string; is_breaking: boolean; is_featured: boolean;
  view_count: number; published_at: string | null;
  updated_at: string; author_name: string | null; category_name: string | null;
}

interface PendingArticle {
  id: number; slug: string; title: string;
  author_name: string | null; word_count: number; created_at: string;
}

interface TopArticle {
  id: number; slug: string; title: string;
  view_count: number; is_breaking: boolean;
}

// ── Dashboard page ─────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery<DashboardData>({
    queryKey:        ['admin-dashboard'],
    queryFn:         () => api.get('/api/v1/admin/dashboard').then(r => r.data),
    refetchInterval: 60_000, // auto-refresh every 60 s
    staleTime:       30_000,
  });

  const stats   = data?.stats;
  const lastUpdated = dataUpdatedAt
    ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })
    : null;

  return (
    <AdminShell
      breadcrumbs={[{ label: 'Dashboard' }]}
      topActions={
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs font-ui text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
          {lastUpdated ? `Updated ${lastUpdated}` : 'Refresh'}
        </button>
      }
    >
      <PageHeader
        title="Dashboard"
        subtitle="CNI News Network overview"
        actions={
          <Link href="/admin/articles/new">
            <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}>
              New article
            </Button>
          </Link>
        }
      />

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total articles"
          value={isLoading ? '—' : (stats?.articles_total ?? 0).toLocaleString()}
          icon={<NavIconSvg name="articles" className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          label="Pending review"
          value={isLoading ? '—' : stats?.articles_pending ?? 0}
          change={stats?.articles_pending ? 'Needs attention' : undefined}
          changeType={stats?.articles_pending ? 'down' : 'neutral'}
          icon={<NavIconSvg name="articles" className="w-4 h-4" />}
          color="amber"
        />
        <StatCard
          label="Published today"
          value={isLoading ? '—' : stats?.articles_today ?? 0}
          icon={<NavIconSvg name="articles" className="w-4 h-4" />}
          color="green"
        />
        <StatCard
          label="Views this week"
          value={isLoading ? '—' : (stats?.views_this_week ?? 0).toLocaleString()}
          icon={<NavIconSvg name="dashboard" className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          label="Active members"
          value={isLoading ? '—' : (stats?.members_active ?? 0).toLocaleString()}
          icon={<NavIconSvg name="memberships" className="w-4 h-4" />}
          color="green"
        />
        <StatCard
          label="Total users"
          value={isLoading ? '—' : (stats?.users_total ?? 0).toLocaleString()}
          icon={<NavIconSvg name="users" className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          label="Comments pending"
          value={isLoading ? '—' : stats?.comments_pending ?? 0}
          change={stats?.comments_pending ? 'Needs moderation' : undefined}
          changeType={stats?.comments_pending ? 'down' : 'neutral'}
          icon={<NavIconSvg name="comments" className="w-4 h-4" />}
          color="amber"
        />
        <StatCard
          label="Revenue this month"
          value={isLoading ? '—' : `£${(stats?.revenue_this_month ?? 0).toFixed(2)}`}
          icon={<NavIconSvg name="payments" className="w-4 h-4" />}
          color="green"
        />
      </div>

      {/* ── Activity bar chart + Live stream status ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <ActivityChart data={data?.activity_by_day} loading={isLoading} />
        </div>
        <QuickActions stats={stats} loading={isLoading} />
      </div>

      {/* ── Pending queue + Top articles ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <PendingQueue items={data?.pending_queue} loading={isLoading} />
        <TopArticles  items={data?.top_articles}  loading={isLoading} />
      </div>

      {/* ── Recent articles ──────────────────────────────────────────────── */}
      <RecentArticles items={data?.recent_articles} loading={isLoading} />
    </AdminShell>
  );
}

// ── Activity bar chart ─────────────────────────────────────────────────────
function ActivityChart({
  data, loading,
}: { data?: { date: string; label: string; count: number }[]; loading: boolean }) {
  const max = data ? Math.max(...data.map(d => d.count), 1) : 1;

  return (
    <Card>
      <CardHeader title="Articles published" subtitle="Last 7 days" />
      {loading ? (
        <div className="flex items-end gap-2 h-28">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 bg-gray-100 animate-pulse rounded-sm" style={{ height: `${30 + i * 8}%` }} />
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-2 h-28">
          {(data ?? []).map(day => {
            const pct = max > 0 ? (day.count / max) * 100 : 0;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-ui text-gray-500">{day.count > 0 ? day.count : ''}</span>
                <div
                  className="w-full bg-cni-blue rounded-sm transition-all duration-500 min-h-[3px]"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                  title={`${day.date}: ${day.count} articles`}
                />
                <span className="text-[10px] font-ui text-gray-400">{day.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ── Quick actions sidebar ──────────────────────────────────────────────────
function QuickActions({
  stats, loading,
}: { stats?: DashboardData['stats']; loading: boolean }) {
  const actions = [
    { label: 'Write article',     href: '/admin/articles/new',              icon: 'articles',    color: 'text-cni-blue' },
    { label: 'Moderate comments', href: '/admin/comments?status=pending',   icon: 'comments',    color: 'text-amber-600', badge: stats?.comments_pending },
    { label: 'Review articles',   href: '/admin/articles?status=pending_review', icon: 'articles', color: 'text-amber-600', badge: stats?.articles_pending },
    { label: 'Manage members',    href: '/admin/memberships',               icon: 'memberships', color: 'text-green-700' },
    { label: 'Live streams',      href: '/admin/live',                      icon: 'live',        color: stats?.live_streams_active ? 'text-cni-red' : 'text-gray-500', badge: stats?.live_streams_active },
    { label: 'SEO redirects',     href: '/admin/seo-redirects',             icon: 'seo',         color: 'text-gray-500' },
  ];

  return (
    <Card>
      <CardHeader title="Quick actions" />
      <div className="space-y-1">
        {actions.map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors no-underline group"
          >
            <NavIconSvg name={a.icon as Parameters<typeof NavIconSvg>[0]['name']} className={`w-4 h-4 ${a.color}`} />
            <span className="flex-1 text-sm font-ui text-gray-700 group-hover:text-cni-blue">{a.label}</span>
            {a.badge != null && a.badge > 0 && !loading && (
              <span className="text-[10px] font-ui font-bold bg-cni-red text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {a.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}

// ── Pending review queue ───────────────────────────────────────────────────
function PendingQueue({ items, loading }: { items?: PendingArticle[]; loading: boolean }) {
  return (
    <Card padding={false}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-ui font-semibold text-gray-900 text-sm">Needs review</h3>
          <p className="text-xs font-ui text-gray-500 mt-0.5">Articles awaiting editor approval</p>
        </div>
        <Link href="/admin/articles?status=pending_review">
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </div>

      {loading ? (
        <div className="px-5 pb-4 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />)}
        </div>
      ) : !items?.length ? (
        <EmptyState
          title="All clear"
          description="No articles waiting for review."
          icon={<NavIconSvg name="articles" className="w-8 h-8" />}
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map(article => (
            <div key={article.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-ui font-medium text-gray-800 truncate" title={article.title}>
                  {article.title}
                </p>
                <p className="text-xs font-ui text-gray-400 mt-0.5">
                  {article.author_name ?? 'Unknown'} · {article.word_count} words ·{' '}
                  {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                </p>
              </div>
              <Link
                href={`/admin/articles/${article.id}/edit`}
                className="flex-shrink-0 text-xs font-ui font-medium text-cni-blue hover:text-cni-blue-dark no-underline"
              >
                Review →
              </Link>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Top articles ───────────────────────────────────────────────────────────
function TopArticles({ items, loading }: { items?: TopArticle[]; loading: boolean }) {
  const maxViews = items ? Math.max(...items.map(a => a.view_count), 1) : 1;
  return (
    <Card padding={false}>
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-ui font-semibold text-gray-900 text-sm">Top articles this week</h3>
        <p className="text-xs font-ui text-gray-500 mt-0.5">By view count</p>
      </div>

      {loading ? (
        <div className="px-5 pb-4 space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />)}
        </div>
      ) : !items?.length ? (
        <EmptyState title="No data yet" icon={<NavIconSvg name="dashboard" className="w-8 h-8" />} />
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((article, idx) => (
            <div key={article.id} className="px-5 py-3 flex items-center gap-3">
              <span className="text-xs font-ui font-bold text-gray-300 w-4 flex-shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-ui font-medium text-gray-800 truncate" title={article.title}>
                  {article.is_breaking && <span className="text-cni-red mr-1">●</span>}
                  {article.title}
                </p>
                <div className="mt-1 h-1 bg-gray-100 rounded-full">
                  <div
                    className="h-1 bg-cni-blue rounded-full transition-all duration-700"
                    style={{ width: `${(article.view_count / maxViews) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-ui font-semibold text-gray-500 flex-shrink-0">
                {article.view_count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Recent articles table ──────────────────────────────────────────────────
function RecentArticles({ items, loading }: { items?: RecentArticle[]; loading: boolean }) {
  return (
    <Card padding={false}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-ui font-semibold text-gray-900 text-sm">Recent articles</h3>
          <p className="text-xs font-ui text-gray-500 mt-0.5">Last 10 updated</p>
        </div>
        <Link href="/admin/articles">
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-ui min-w-[640px]">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50">
              {['Headline', 'Status', 'Author', 'Category', 'Views', 'Updated'].map(h => (
                <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
              <th className="px-5 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-3.5 bg-gray-100 rounded w-4/5" />
                      </td>
                    ))}
                  </tr>
                ))
              : (items ?? []).map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="flex items-center gap-2">
                        {a.is_breaking && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cni-red flex-shrink-0" title="Breaking" />
                        )}
                        <span className="text-sm font-ui font-medium text-gray-800 truncate" title={a.title}>
                          {a.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-ui text-gray-400 capitalize">{a.type}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{a.author_name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">{a.category_name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 tabular-nums">
                      {a.view_count.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(a.updated_at), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="text-gray-400 hover:text-cni-blue transition-colors"
                        title="Edit"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </Card>
  );
}
