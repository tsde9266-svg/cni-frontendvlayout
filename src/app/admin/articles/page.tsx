'use client';

import { Suspense } from 'react';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, StatusBadge, SearchInput,
  Select, ConfirmModal, Toggle, Card,
} from '@/components/admin/ui/AdminUI';
import DataTable from '@/components/admin/ui/DataTable';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, RefreshIcon } from '@/components/admin/ui/Icons';
import { adminArticlesApi } from '@/lib/adminApi';
import type { AdminArticle, TableColumn } from '@/types/admin';
import clsx from 'clsx';
// import { clsx } from 'clsx';

// ── Status tabs ────────────────────────────────────────────────────────────
const TABS = [
  { key: '',               label: 'All'      },
  { key: 'published',      label: 'Published'},
  { key: 'pending_review', label: 'Review',  badge: true },
  { key: 'draft',          label: 'Drafts'  },
  { key: 'scheduled',      label: 'Scheduled'},
  { key: 'archived',       label: 'Archived' },
];

const TYPES = ['news','opinion','interview','analysis','bulletin','sponsored'];

function ArticlesListPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const qc           = useQueryClient();

  // ── Filter state ──────────────────────────────────────────────────────
  const [status,   setStatus]   = useState(searchParams.get('status') ?? '');
  const [search,   setSearch]   = useState('');
  const [type,     setType]     = useState('');
  const [breaking, setBreaking] = useState(false);
  const [page,     setPage]     = useState(1);
  const [sort,     setSort]     = useState('created_at');
  const [order,    setOrder]    = useState<'asc'|'desc'>('desc');

  // ── Selection ─────────────────────────────────────────────────────────
  const [selected,    setSelected]    = useState<number[]>([]);
  const [bulkAction,  setBulkAction]  = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId,    setDeleteId]    = useState<number|null>(null);
  const [importing,   setImporting]   = useState(false);

  // ── Query ─────────────────────────────────────────────────────────────
  const params = {
    status:   status  || undefined,
    type:     type    || undefined,
    breaking: breaking || undefined,
    search:   search  || undefined,
    sort, order,
    page,
    per_page: 20,
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-articles', params],
    queryFn:  () => adminArticlesApi.list(params).then(r => r.data),
    placeholderData: prev => prev,
  });

  // ── Mutations ─────────────────────────────────────────────────────────
  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: number[]; action: string }) =>
      adminArticlesApi.bulk(ids, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-articles'] });
      setSelected([]);
      setConfirmOpen(false);
      setBulkAction('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminArticlesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-articles'] });
      setDeleteId(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => adminArticlesApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-articles'] }),
  });

  const handleImportRss = useCallback(async () => {
    setImporting(true);
    try {
      const res = await adminArticlesApi.importRss(4);
      alert(res.data.message);
      qc.invalidateQueries({ queryKey: ['admin-articles'] });
    } catch {
      alert('RSS import failed. Check server logs.');
    } finally {
      setImporting(false);
    }
  }, [qc]);

  const handleSort = useCallback((key: string) => {
    if (sort === key) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setOrder('desc'); }
    setPage(1);
  }, [sort]);

  // ── Table columns ─────────────────────────────────────────────────────
  const columns: TableColumn<AdminArticle>[] = [
    {
      key:    'title',
      header: 'Headline',
      render: row => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {row.is_breaking && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cni-red flex-shrink-0" title="Breaking" />
            )}
            <Link
              href={`/admin/articles/${row.id}/edit`}
              className="text-sm font-ui font-medium text-gray-800 hover:text-cni-blue truncate max-w-xs block no-underline"
              title={row.title ?? ''}
            >
              {row.title}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-ui text-gray-400 capitalize">{row.type}</span>
            {row.category_name && (
              <span className="text-[11px] font-ui text-gray-400">· {row.category_name}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key:    'status',
      header: 'Status',
      render: row => <StatusBadge status={row.status} />,
      width:  'w-32',
    },
    {
      key:    'author_name',
      header: 'Author',
      render: row => (
        <span className="text-xs font-ui text-gray-600">{row.author_name ?? '—'}</span>
      ),
      width: 'w-36',
    },
    {
      key:    'view_count',
      header: 'Views',
      render: row => (
        <span className="text-xs font-ui tabular-nums text-gray-600">
          {row.view_count.toLocaleString()}
        </span>
      ),
      sortable: true,
      width:    'w-24',
    },
    {
      key:    'created_at',
      header: 'Created',
      render: row => (
        <span className="text-xs font-ui text-gray-400" title={format(new Date(row.created_at), 'dd MMM yyyy HH:mm')}>
          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
        </span>
      ),
      sortable: true,
      width:    'w-32',
    },
    {
      key:    '_actions',
      header: '',
      width:  'w-28',
      render: row => (
        <div className="flex items-center gap-1 justify-end">
          {row.status === 'pending_review' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => publishMutation.mutate(row.id)}
              loading={publishMutation.isPending}
              className="text-[11px] px-2 py-1"
            >
              Approve
            </Button>
          )}
          <Link href={`/admin/articles/${row.id}/edit`} title="Edit">
            <button className="p-1.5 text-gray-400 hover:text-cni-blue hover:bg-gray-100 rounded transition-colors">
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </Link>
          <Link href={`/article/${row.slug}`} target="_blank" title="View live">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <EyeIcon className="w-3.5 h-3.5" />
            </button>
          </Link>
          <button
            className="p-1.5 text-gray-400 hover:text-cni-red hover:bg-red-50 rounded transition-colors"
            onClick={() => setDeleteId(row.id)}
            title="Delete"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const articles: AdminArticle[] = data?.data ?? [];
  const pagination = data?.meta;

  // Pending count for tab badge
  const pendingCount = status === 'pending_review' ? pagination?.total : undefined;

  return (
    <AdminShell
      breadcrumbs={[{ label: 'Articles' }]}
      topActions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshIcon className="w-3.5 h-3.5" />}
            onClick={handleImportRss}
            loading={importing}
          >
            Import from CNN
          </Button>
          <Link href="/admin/articles/new">
            <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}>
              New article
            </Button>
          </Link>
        </div>
      }
    >
      <PageHeader
        title="Articles"
        subtitle={`${pagination?.total ?? '—'} total articles`}
      />

      {/* ── Status tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 mb-4 border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1); setSelected([]); }}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-ui font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              status === tab.key
                ? 'border-cni-blue text-cni-blue'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            )}
          >
            {tab.label}
            {tab.badge && pendingCount != null && pendingCount > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Filters row ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput
          value={search}
          onChange={v => { setSearch(v); setPage(1); }}
          placeholder="Search headlines…"
          className="w-64"
        />
        <Select
          value={type}
          onChange={e => { setType(e.target.value); setPage(1); }}
          options={TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
          placeholder="All types"
          className="w-36 text-xs"
        />
        <Toggle
          checked={breaking}
          onChange={v => { setBreaking(v); setPage(1); }}
          label="Breaking only"
          size="sm"
        />
        <div className="flex-1" />
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 text-xs font-ui text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
        >
          <RefreshIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Bulk actions bar ───────────────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 bg-cni-blue-light border border-cni-blue/20 rounded-lg">
          <span className="text-sm font-ui font-medium text-cni-blue">
            {selected.length} selected
          </span>
          <div className="flex-1" />
          <Select
            value={bulkAction}
            onChange={e => setBulkAction(e.target.value)}
            options={[
              { value: 'publish',       label: 'Publish all'    },
              { value: 'unpublish',     label: 'Unpublish all'  },
              { value: 'archive',       label: 'Archive all'    },
              { value: 'set_breaking',  label: 'Mark breaking'  },
              { value: 'unset_breaking',label: 'Unmark breaking'},
              { value: 'delete',        label: 'Delete all'     },
            ]}
            placeholder="Apply action…"
            className="w-40 text-xs"
          />
          <Button
            variant={bulkAction === 'delete' ? 'danger' : 'primary'}
            size="sm"
            disabled={!bulkAction}
            onClick={() => bulkAction && setConfirmOpen(true)}
          >
            Apply
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            Cancel
          </Button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={articles}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        onSelectionChange={setSelected}
        selectedIds={selected}
        emptyMessage="No articles found. Try adjusting your filters."
        rowClassName={row =>
          row.status === 'pending_review' ? 'border-l-2 border-l-amber-400' : ''
        }
      />

      {/* ── Confirm bulk action ────────────────────────────────────────── */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => bulkMutation.mutate({ ids: selected, action: bulkAction })}
        loading={bulkMutation.isPending}
        title={`Apply bulk action`}
        message={`Are you sure you want to ${bulkAction.replace(/_/g,' ')} ${selected.length} article${selected.length !== 1 ? 's' : ''}? This cannot be undone.`}
        confirmLabel="Confirm"
        variant={bulkAction === 'delete' ? 'danger' : 'primary'}
      />

      {/* ── Confirm single delete ──────────────────────────────────────── */}
      <ConfirmModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete article"
        message="Are you sure you want to permanently delete this article? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminShell>
  );
}

export default function ArticlesListPageWrapper() { return <Suspense><ArticlesListPage /></Suspense>; }
