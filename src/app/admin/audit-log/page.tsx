'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader, SearchInput, Card } from '@/components/admin/ui/AdminUI';
import DataTable from '@/components/admin/ui/DataTable';
import api from '@/lib/api';
import type { TableColumn } from '@/types/admin';

interface AuditEntry {
  id: number; action: string; target_type: string | null; target_id: number | null;
  actor_name: string; actor_email: string | null; after_state: Record<string, unknown> | null; created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  article_published: 'bg-green-100 text-green-800',
  article_rejected:  'bg-red-100 text-red-800',
  user_suspended:    'bg-red-100 text-red-800',
  role_assigned:     'bg-blue-100 text-blue-800',
  membership_canceled:'bg-amber-100 text-amber-800',
  live_stream_started:'bg-red-100 text-red-800',
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const params = { action: search||undefined, page, per_page: 30 };
  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', params],
    queryFn:  () => api.get('/api/v1/admin/audit-log', { params }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const entries: AuditEntry[] = data?.data ?? [];

  const columns: TableColumn<AuditEntry>[] = [
    {
      key: 'action', header: 'Action',
      render: row => (
        <span className={`text-[11px] font-ui font-semibold px-2 py-0.5 rounded ${ACTION_COLORS[row.action] ?? 'bg-gray-100 text-gray-700'}`}>
          {row.action.replace(/_/g, ' ')}
        </span>
      ),
      width: 'w-44',
    },
    {
      key: 'actor_name', header: 'Actor',
      render: row => (
        <div>
          <p className="text-xs font-ui font-medium text-gray-800">{row.actor_name}</p>
          {row.actor_email && <p className="text-[11px] font-ui text-gray-400">{row.actor_email}</p>}
        </div>
      ),
      width: 'w-40',
    },
    {
      key: 'target_type', header: 'Target',
      render: row => row.target_type ? (
        <span className="text-xs font-ui text-gray-600">
          {row.target_type} #{row.target_id}
        </span>
      ) : null,
      width: 'w-32',
    },
    {
      key: 'after_state', header: 'Details',
      render: row => row.after_state ? (
        <span className="text-[11px] font-mono text-gray-500 line-clamp-1">
          {JSON.stringify(row.after_state)}
        </span>
      ) : null,
    },
    {
      key: 'created_at', header: 'Time',
      render: row => (
        <span className="text-xs font-ui text-gray-400 whitespace-nowrap">
          {format(new Date(row.created_at), 'dd MMM HH:mm')}
        </span>
      ),
      width: 'w-28',
    },
  ];

  return (
    <AdminShell breadcrumbs={[{ label: 'Audit log' }]}>
      <PageHeader title="Audit log" subtitle="All admin actions across the platform" />
      <div className="mb-4">
        <SearchInput value={search} onChange={v=>{setSearch(v);setPage(1);}}
          placeholder="Filter by action (e.g. article_published)…" className="w-80"/>
      </div>
      <DataTable columns={columns} data={entries} loading={isLoading}
        pagination={data?.meta} onPageChange={setPage} emptyMessage="No audit entries." />
    </AdminShell>
  );
}
