'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, Input, Toggle, Card,
  ConfirmModal, Modal,
} from '@/components/admin/ui/AdminUI';
import { adminCategoriesApi } from '@/lib/adminApi';
import { PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ui/Icons';

interface Category {
  id: number; slug: string; name: string; description: string | null;
  position: number; is_featured: boolean; is_active: boolean;
  parent_id: number | null; article_count: number;
}

const EMPTY = { name: '', description: '', position: 99, is_featured: false };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [modal,     setModal]     = useState<'create' | 'edit' | null>(null);
  const [editing,   setEditing]   = useState<Category | null>(null);
  const [deleteId,  setDeleteId]  = useState<number | null>(null);
  const [form,      setForm]      = useState(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn:  () => adminCategoriesApi.list().then(r => r.data.data as Category[]),
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => adminCategoriesApi.create(d),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); setForm(EMPTY); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: object }) => adminCategoriesApi.update(id, d),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminCategoriesApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-categories'] }); setDeleteId(null); },
  });

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? '', position: cat.position, is_featured: cat.is_featured });
    setModal('edit');
  };

  const handleSave = () => {
    if (modal === 'create') createMutation.mutate(form);
    else if (editing)       updateMutation.mutate({ id: editing.id, d: form });
  };

  const cats = data ?? [];

  return (
    <AdminShell breadcrumbs={[{ label: 'Categories' }]}>
      <PageHeader
        title="Categories"
        subtitle={`${cats.length} categories`}
        actions={
          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}
            onClick={() => { setForm(EMPTY); setModal('create'); }}>
            New category
          </Button>
        }
      />

      <Card padding={false}>
        <table className="w-full text-sm font-ui">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['#','Name','Slug','Articles','Featured','Active',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({length:5}).map((_,i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({length:7}).map((_,j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3.5 bg-gray-100 rounded w-3/4"/></td>
                    ))}
                  </tr>
                ))
              : cats.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 w-10">{cat.position}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{cat.name}</p>
                      {cat.description && <p className="text-[11px] text-gray-400 truncate max-w-xs">{cat.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{cat.slug}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 tabular-nums">{cat.article_count}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-ui font-semibold ${cat.is_featured ? 'text-green-700' : 'text-gray-400'}`}>
                        {cat.is_featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-ui font-semibold ${cat.is_active ? 'text-green-700' : 'text-gray-400'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-cni-blue hover:bg-gray-100 rounded">
                          <EditIcon className="w-3.5 h-3.5"/>
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          disabled={cat.article_count > 0}
                          title={cat.article_count > 0 ? `${cat.article_count} articles use this` : 'Delete'}
                          className="p-1.5 text-gray-400 hover:text-cni-red hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <TrashIcon className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </Card>

      {/* Create / Edit modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'New category' : `Edit: ${editing?.name}`}
      >
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
          <Input label="Description (optional)" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          <Input label="Position" type="number" value={form.position} onChange={e => setForm(f => ({...f, position: Number(e.target.value)}))} hint="Lower = appears first" />
          <Toggle checked={form.is_featured} onChange={v => setForm(f => ({...f, is_featured: v}))} label="Featured on homepage" />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}>
              {modal === 'create' ? 'Create' : 'Save changes'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete category"
        message="This category will be permanently deleted. Articles must be reassigned first."
        confirmLabel="Delete"
        variant="danger"
      />
    </AdminShell>
  );
}
