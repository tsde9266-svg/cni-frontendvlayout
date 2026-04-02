'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, SearchInput, Select, Button,
  StatusBadge, ConfirmModal, Card,
} from '@/components/admin/ui/AdminUI';
import DataTable from '@/components/admin/ui/DataTable';
import { adminCommentsApi } from '@/lib/adminApi';
import type { TableColumn } from '@/types/admin';
import clsx from 'clsx';
// import { clsx } from 'clsx';

interface AdminComment {
  id:            number;
  article_id:    number;
  article_title: string;
  article_slug:  string;
  author_name:   string;
  author_email:  string | null;
  content:       string;
  status:        string;
  spam_score:    number | null;
  created_at:    string;
}

const TABS = [
  { key: 'pending',  label: 'Pending',  color: 'text-amber-600' },
  { key: 'approved', label: 'Approved', color: 'text-green-600' },
  { key: 'rejected', label: 'Rejected', color: 'text-gray-500'  },
  { key: '',         label: 'All',      color: 'text-gray-600'  },
];

export default function CommentsPage() {
  const qc = useQueryClient();

  const [status,  setStatus]  = useState('pending');
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [selected,setSelected]= useState<number[]>([]);
  const [bulkAct, setBulkAct] = useState('');
  const [confirm, setConfirm] = useState(false);

  const params = { status: status || undefined, search: search || undefined, page, per_page: 25 };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments', params],
    queryFn:  () => adminCommentsApi.list(params).then(r => r.data),
    placeholderData: prev => prev,
    refetchInterval: 30_000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminCommentsApi.approve(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-comments'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminCommentsApi.reject(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-comments'] }),
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: number[]; action: string }) =>
      adminCommentsApi.bulkAction(ids, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-comments'] });
      setSelected([]);
      setConfirm(false);
      setBulkAct('');
    },
  });

  const comments: AdminComment[] = data?.data ?? [];

  const columns: TableColumn<AdminComment>[] = [
    {
      key:    'content',
      header: 'Comment',
      render: row => (
        <div className="max-w-md">
          <p className="text-sm font-ui text-gray-800 line-clamp-2">{row.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-ui font-medium text-gray-600">{row.author_name}</span>
            <span className="text-[11px] font-ui text-gray-400">·</span>
            <Link
              href={`/article/${row.article_slug}`}
              target="_blank"
              className="text-[11px] font-ui text-cni-blue hover:underline truncate max-w-[200px]"
            >
              {row.article_title}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key:    'status',
      header: 'Status',
      render: row => <StatusBadge status={row.status} />,
      width:  'w-24',
    },
    {
      key:    'created_at',
      header: 'Time',
      render: row => (
        <span className="text-xs font-ui text-gray-400">
          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
        </span>
      ),
      width: 'w-28',
    },
    {
      key:    '_actions',
      header: '',
      width:  'w-36',
      render: row => (
        <div className="flex items-center gap-1 justify-end">
          {row.status !== 'approved' && (
            <Button
              variant="secondary"
              size="sm"
              className="text-[11px] px-2 py-1 text-green-700 border-green-300 hover:bg-green-50"
              loading={approveMutation.isPending}
              onClick={() => approveMutation.mutate(row.id)}
            >
              Approve
            </Button>
          )}
          {row.status !== 'rejected' && (
            <Button
              variant="secondary"
              size="sm"
              className="text-[11px] px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
              loading={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(row.id)}
            >
              Reject
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = status === 'pending' ? data?.meta?.total : undefined;

  return (
    <AdminShell breadcrumbs={[{ label: 'Comments' }]}>
      <PageHeader
        title="Comments"
        subtitle={`${data?.meta?.total ?? '—'} ${status || 'total'} comments`}
      />

      {/* Status tabs */}
      <div className="flex items-center gap-0.5 mb-4 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1); setSelected([]); }}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-ui font-medium border-b-2 -mb-px transition-colors',
              status === tab.key
                ? 'border-cni-blue text-cni-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount != null && pendingCount > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + bulk actions */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput
          value={search}
          onChange={v => { setSearch(v); setPage(1); }}
          placeholder="Search comments…"
          className="w-64"
        />
        {selected.length > 0 && (
          <>
            <span className="text-xs font-ui text-gray-500">{selected.length} selected</span>
            <Select
              value={bulkAct}
              onChange={e => setBulkAct(e.target.value)}
              options={[
                { value: 'approve', label: 'Approve all' },
                { value: 'reject',  label: 'Reject all'  },
                { value: 'delete',  label: 'Delete all'  },
              ]}
              placeholder="Bulk action…"
              className="w-36 text-xs"
            />
            <Button
              variant={bulkAct === 'delete' ? 'danger' : 'primary'}
              size="sm"
              disabled={!bulkAct}
              onClick={() => bulkAct && setConfirm(true)}
            >
              Apply
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Cancel</Button>
          </>
        )}
      </div>

      <DataTable
        columns={columns}
        data={comments}
        loading={isLoading}
        pagination={data?.meta}
        onPageChange={setPage}
        onSelectionChange={setSelected}
        selectedIds={selected}
        emptyMessage="No comments found."
        rowClassName={row => row.status === 'pending' ? 'border-l-2 border-l-amber-400' : ''}
      />

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => bulkMutation.mutate({ ids: selected, action: bulkAct })}
        loading={bulkMutation.isPending}
        title={`${bulkAct} ${selected.length} comments`}
        message={`Are you sure you want to ${bulkAct} ${selected.length} comment${selected.length !== 1 ? 's' : ''}?`}
        confirmLabel={bulkAct.charAt(0).toUpperCase() + bulkAct.slice(1)}
        variant={bulkAct === 'delete' ? 'danger' : 'primary'}
      />
    </AdminShell>
  );
}
