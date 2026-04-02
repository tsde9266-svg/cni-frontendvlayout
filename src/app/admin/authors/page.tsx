'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, SearchInput, Toggle, Card,
  Button, StatCard, EmptyState,
} from '@/components/admin/ui/AdminUI';
import { NavIconSvg } from '@/components/admin/ui/Icons';
import api from '@/lib/api';

interface AuthorProfile {
  id:                number;
  user_id:           number;
  display_name:      string;
  email:             string;
  byline:            string | null;
  is_monetised:      boolean;
  can_self_publish:  boolean;
  default_rate_type: string;
  default_rate_amount: number | string | null;
  rate_currency:     string;
  article_count:     number;
  total_earnings:    number | string | null;
  is_active:         boolean;
  created_at:        string;
}

export default function AuthorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-authors', { search, page }],
    queryFn:  () => api.get('/api/v1/admin/authors', {
      params: { search: search || undefined, page, per_page: 20 },
    }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const toggleMonetise = useMutation({
    mutationFn: (id: number) => api.patch(`/api/v1/admin/authors/${id}/toggle-monetise`, {}),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-authors'] }),
  });

  const toggleSelfPublish = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) =>
      api.post(`/api/v1/admin/authors/${id}/set-self-publish`, { can_self_publish: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-authors'] }),
  });

  const authors: AuthorProfile[] = data?.data ?? [];

  return (
    <AdminShell breadcrumbs={[{ label: 'Authors' }]}>
      <PageHeader
        title="Author profiles"
        subtitle={`${data?.meta?.total ?? '—'} authors`}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total authors"    value={data?.meta?.total ?? '—'} color="blue" icon={<NavIconSvg name="authors" className="w-4 h-4"/>} />
        <StatCard label="Monetised"        value={authors.filter(a => a.is_monetised).length}     color="green" />
        <StatCard label="Can self-publish" value={authors.filter(a => a.can_self_publish).length}  color="amber" />
        <StatCard label="Pending payouts"  value="—"  color="blue" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search authors…" className="w-64" />
      </div>

      {/* Authors grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : authors.length === 0 ? (
        <EmptyState
          title="No authors found"
          icon={<NavIconSvg name="authors" className="w-8 h-8" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map(author => (
            <Card key={author.id} className="flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-cni-blue-light border-2 border-cni-blue/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-cni-blue font-ui font-bold text-sm">
                    {author.display_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-ui font-semibold text-gray-800 truncate">
                    {author.display_name}
                  </p>
                  <p className="text-[11px] font-ui text-gray-400 truncate">{author.email}</p>
                  {author.byline && (
                    <p className="text-[11px] font-ui text-gray-500 truncate italic mt-0.5">
                      {author.byline}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-center border-y border-gray-100 py-2">
                <div>
                  <p className="text-sm font-ui font-bold text-gray-800">{author.article_count}</p>
                  <p className="text-[10px] font-ui text-gray-400">Articles</p>
                </div>
                <div>
                  <p className="text-sm font-ui font-bold text-gray-800">
                    £{parseFloat(String(author.total_earnings ?? '0')).toFixed(2)}
                  </p>
                  <p className="text-[10px] font-ui text-gray-400">Earned</p>
                </div>
                <div>
                  <p className="text-sm font-ui font-bold text-gray-800">
                    £{parseFloat(author.default_rate_amount ?? '0').toFixed(2)}
                  </p>
                  <p className="text-[10px] font-ui text-gray-400">Rate</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-ui text-gray-600">Monetised</span>
                  <Toggle
                    checked={author.is_monetised}
                    onChange={() => toggleMonetise.mutate(author.id)}
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-ui text-gray-600">Self-publish</span>
                  <Toggle
                    checked={author.can_self_publish}
                    onChange={v => toggleSelfPublish.mutate({ id: author.id, val: v })}
                    size="sm"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>
            Previous
          </Button>
          <span className="text-xs font-ui text-gray-500 flex items-center px-3">
            Page {data.meta.current_page} of {data.meta.last_page}
          </span>
          <Button variant="secondary" size="sm" disabled={page === data.meta.last_page} onClick={() => setPage(p => p+1)}>
            Next
          </Button>
        </div>
      )}
    </AdminShell>
  );
}
