'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, Input, SearchInput,
  Card, ConfirmModal, Modal,
} from '@/components/admin/ui/AdminUI';
import { adminTagsApi } from '@/lib/adminApi';
import { PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ui/Icons';

interface Tag { id: number; slug: string; name: string; article_count: number; }

export default function TagsPage() {
  const qc = useQueryClient();
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState<'create' | 'edit' | null>(null);
  const [editing,  setEditing]  = useState<Tag | null>(null);
  const [name,     setName]     = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const params = { search: search || undefined, page, per_page: 50 };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tags', params],
    queryFn:  () => adminTagsApi.list(params).then(r => r.data),
    placeholderData: prev => prev,
  });

  const createMutation = useMutation({
    mutationFn: (n: string) => adminTagsApi.create({ name: n }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-tags'] }); setModal(null); setName(''); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, n }: { id: number; n: string }) => adminTagsApi.update(id, { name: n }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-tags'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminTagsApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-tags'] }); setDeleteId(null); },
  });

  const tags: Tag[] = data?.data ?? [];

  return (
    <AdminShell breadcrumbs={[{ label: 'Tags' }]}>
      <PageHeader
        title="Tags"
        subtitle={`${data?.meta?.total ?? tags.length} tags`}
        actions={
          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}
            onClick={() => { setName(''); setModal('create'); }}>
            New tag
          </Button>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search tags…" className="w-56" />
      </div>

      {/* Tags as pills grid */}
      <Card>
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({length:20}).map((_,i) => (
              <div key={i} className="h-7 w-20 bg-gray-100 animate-pulse rounded-full" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="text-sm font-ui text-gray-400 text-center py-8">No tags found.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="group flex items-center gap-1.5 bg-gray-100 hover:bg-cni-blue-light border border-transparent hover:border-cni-blue/30 rounded-full pl-3 pr-1 py-1 transition-all"
              >
                <span className="text-sm font-ui text-gray-700 group-hover:text-cni-blue">{tag.name}</span>
                <span className="text-[10px] font-ui text-gray-400 group-hover:text-cni-blue/70">({tag.article_count})</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditing(tag); setName(tag.name); setModal('edit'); }}
                    className="p-1 text-gray-400 hover:text-cni-blue rounded-full"
                  >
                    <EditIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeleteId(tag.id)}
                    className="p-1 text-gray-400 hover:text-cni-red rounded-full"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="secondary" size="sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>Previous</Button>
          <span className="text-xs font-ui text-gray-500 flex items-center px-3">
            {data.meta.current_page} / {data.meta.last_page}
          </span>
          <Button variant="secondary" size="sm" disabled={page===data.meta.last_page} onClick={() => setPage(p=>p+1)}>Next</Button>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'New tag' : `Edit: ${editing?.name}`}
        width="max-w-sm"
      >
        <div className="space-y-3">
          <Input
            label="Tag name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Lahore"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" size="sm"
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!name.trim()}
              onClick={() => {
                if (modal === 'create') createMutation.mutate(name.trim());
                else if (editing)       updateMutation.mutate({ id: editing.id, n: name.trim() });
              }}>
              {modal === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete tag"
        message="This tag will be removed from all articles. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminShell>
  );
}
