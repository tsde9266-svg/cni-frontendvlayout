'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, Input, Select, SearchInput,
  Card, Modal, ConfirmModal, Toggle,
} from '@/components/admin/ui/AdminUI';
import DataTable from '@/components/admin/ui/DataTable';
import { adminSeoApi } from '@/lib/adminApi';
import { PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ui/Icons';
import type { TableColumn } from '@/types/admin';

interface Redirect { id: number; old_path: string; new_path: string; http_code: number; hit_count: number; is_active: boolean; }
const EMPTY = { old_path: '', new_path: '', http_code: 301 };

export default function SeoRedirectsPage() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState<'create'|'edit'|null>(null);
  const [editing,  setEditing]  = useState<Redirect|null>(null);
  const [deleteId, setDeleteId] = useState<number|null>(null);
  const [form,     setForm]     = useState(EMPTY);

  const params = { search: search||undefined, page, per_page: 25 };
  const { data, isLoading } = useQuery({
    queryKey: ['admin-seo', params],
    queryFn:  () => adminSeoApi.list(params).then(r => r.data),
    placeholderData: prev => prev,
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => adminSeoApi.create(d),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-seo'] }); setModal(null); setForm(EMPTY); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: object }) => adminSeoApi.update(id, d),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-seo'] }); setModal(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminSeoApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-seo'] }); setDeleteId(null); },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) => adminSeoApi.update(id, { is_active: val }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-seo'] }),
  });

  const redirects: Redirect[] = data?.data ?? [];

  const columns: TableColumn<Redirect>[] = [
    { key: 'old_path', header: 'From (old URL)', render: row => <span className="text-xs font-mono text-gray-700">{row.old_path}</span> },
    { key: 'new_path', header: 'To (new URL)',   render: row => <span className="text-xs font-mono text-cni-blue">{row.new_path}</span> },
    { key: 'http_code', header: 'Type', render: row => <span className="text-xs font-ui font-semibold text-gray-600">{row.http_code}</span>, width: 'w-16' },
    { key: 'hit_count', header: 'Hits', render: row => <span className="text-xs font-ui tabular-nums text-gray-500">{row.hit_count.toLocaleString()}</span>, width: 'w-16', sortable: true },
    {
      key: 'is_active', header: 'Active', width: 'w-20',
      render: row => (
        <Toggle checked={row.is_active} size="sm"
          onChange={v => toggleActive.mutate({ id: row.id, val: v })} />
      ),
    },
    {
      key: '_actions', header: '', width: 'w-20',
      render: row => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => { setEditing(row); setForm({ old_path: row.old_path, new_path: row.new_path, http_code: row.http_code }); setModal('edit'); }}
            className="p-1.5 text-gray-400 hover:text-cni-blue hover:bg-gray-100 rounded">
            <EditIcon className="w-3.5 h-3.5"/>
          </button>
          <button onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-gray-400 hover:text-cni-red hover:bg-red-50 rounded">
            <TrashIcon className="w-3.5 h-3.5"/>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell breadcrumbs={[{ label: 'SEO redirects' }]}>
      <PageHeader
        title="SEO redirects"
        subtitle="WordPress migration URL mapping — preserves Google rankings"
        actions={
          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5"/>}
            onClick={() => { setForm(EMPTY); setEditing(null); setModal('create'); }}>
            Add redirect
          </Button>
        }
      />
      <div className="flex gap-2 mb-4">
        <SearchInput value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder="Search URLs…" className="w-80"/>
      </div>
      <DataTable columns={columns} data={redirects} loading={isLoading}
        pagination={data?.meta} onPageChange={setPage} emptyMessage="No redirects configured." />

      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add redirect' : 'Edit redirect'} width="max-w-xl">
        <div className="space-y-3">
          <Input label="From (old WordPress path)" value={form.old_path}
            onChange={e => setForm(f=>({...f, old_path: e.target.value}))}
            placeholder="/2024/01/my-old-post/" required hint="Include leading slash" />
          <Input label="To (new path)" value={form.new_path}
            onChange={e => setForm(f=>({...f, new_path: e.target.value}))}
            placeholder="/article/my-new-slug" required />
          <Select label="Redirect type" value={form.http_code}
            onChange={e => setForm(f=>({...f, http_code: Number(e.target.value)}))}
            options={[{value:301,label:'301 — Permanent (SEO-safe)'},{value:302,label:'302 — Temporary'}]} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" size="sm"
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!form.old_path || !form.new_path}
              onClick={() => {
                if (modal === 'create') createMutation.mutate(form);
                else if (editing)       updateMutation.mutate({ id: editing.id, d: form });
              }}>
              {modal === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete redirect" confirmLabel="Delete" variant="danger"
        message="This redirect will be deleted. Any Google links pointing to the old URL will break." />
    </AdminShell>
  );
}
