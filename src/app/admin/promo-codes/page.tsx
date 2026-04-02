'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, Input, Select, Card,
  ConfirmModal, Modal, Toggle,
} from '@/components/admin/ui/AdminUI';
import DataTable from '@/components/admin/ui/DataTable';
import { PlusIcon, TrashIcon } from '@/components/admin/ui/Icons';
import { adminMembershipsApi } from '@/lib/adminApi';
import type { TableColumn } from '@/types/admin';

interface PromoCode {
  id: number; code: string; description: string | null; discount_type: string;
  discount_value: number; max_uses: number | null; uses_count: number;
  valid_from: string | null; valid_until: string | null; is_active: boolean; created_at: string;
}

const EMPTY = { code: '', description: '', discount_type: 'percentage', discount_value: 10, max_uses: '', valid_from: '', valid_until: '' };

export default function PromoCodesPage() {
  const qc = useQueryClient();
  const [page,     setPage]     = useState(1);
  const [modal,    setModal]    = useState(false);
  const [deleteId, setDeleteId] = useState<number|null>(null);
  const [form,     setForm]     = useState<typeof EMPTY>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-promos', { page }],
    queryFn:  () => adminMembershipsApi.promoCodes({ page, per_page: 20 }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => adminMembershipsApi.createPromo(d),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-promos'] }); setModal(false); setForm(EMPTY); },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => adminMembershipsApi.deactivatePromo(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-promos'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminMembershipsApi.deletePromo(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-promos'] }); setDeleteId(null); },
  });

  const codes: PromoCode[] = data?.data ?? [];

  const columns: TableColumn<PromoCode>[] = [
    {
      key: 'code', header: 'Code',
      render: row => (
        <div>
          <span className="font-mono text-sm font-bold text-gray-800">{row.code}</span>
          {row.description && <p className="text-[11px] font-ui text-gray-400 mt-0.5">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'discount_value', header: 'Discount',
      render: row => (
        <span className="text-sm font-ui font-semibold text-gray-800">
          {row.discount_type === 'percentage' ? `${row.discount_value}%` : `£${row.discount_value}`}
        </span>
      ),
      width: 'w-24',
    },
    {
      key: 'uses_count', header: 'Uses',
      render: row => (
        <span className="text-xs font-ui text-gray-600 tabular-nums">
          {row.uses_count}{row.max_uses != null ? ` / ${row.max_uses}` : ''}
        </span>
      ),
      width: 'w-20',
    },
    {
      key: 'valid_until', header: 'Expires',
      render: row => (
        <span className="text-xs font-ui text-gray-500">
          {row.valid_until ? format(new Date(row.valid_until), 'dd MMM yyyy') : 'No expiry'}
        </span>
      ),
      width: 'w-28',
    },
    {
      key: 'is_active', header: 'Active',
      render: row => (
        <span className={`text-xs font-ui font-semibold ${row.is_active ? 'text-green-700' : 'text-gray-400'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      width: 'w-20',
    },
    {
      key: '_actions', header: '', width: 'w-32',
      render: row => (
        <div className="flex items-center gap-1 justify-end">
          {row.is_active && (
            <Button variant="ghost" size="sm" className="text-[11px] text-amber-600"
              onClick={() => deactivateMutation.mutate(row.id)}>
              Deactivate
            </Button>
          )}
          <button onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-gray-400 hover:text-cni-red hover:bg-red-50 rounded">
            <TrashIcon className="w-3.5 h-3.5"/>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell breadcrumbs={[{ label: 'Promo codes' }]}>
      <PageHeader
        title="Promo codes"
        subtitle={`${data?.meta?.total ?? '—'} codes`}
        actions={
          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5"/>}
            onClick={() => { setForm(EMPTY); setModal(true); }}>
            New code
          </Button>
        }
      />

      <DataTable columns={columns} data={codes} loading={isLoading}
        pagination={data?.meta} onPageChange={setPage} emptyMessage="No promo codes found." />

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New promo code">
        <div className="space-y-3">
          <Input label="Code" value={form.code} onChange={e => setForm(f=>({...f, code: e.target.value.toUpperCase()}))}
            placeholder="RAMADAN25" required hint="Uppercase, no spaces" />
          <Input label="Description (internal)" value={form.description}
            onChange={e => setForm(f=>({...f, description: e.target.value}))} placeholder="Ramadan 2025 campaign" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Discount type" value={form.discount_type}
              onChange={e => setForm(f=>({...f, discount_type: e.target.value}))}
              options={[{value:'percentage',label:'Percentage %'},{value:'fixed_amount',label:'Fixed amount £'}]} />
            <Input label="Value" type="number" value={form.discount_value}
              onChange={e => setForm(f=>({...f, discount_value: Number(e.target.value)}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Max uses (blank = unlimited)" type="number" value={form.max_uses}
              onChange={e => setForm(f=>({...f, max_uses: e.target.value}))} />
            <Input label="Valid until" type="date" value={form.valid_until}
              onChange={e => setForm(f=>({...f, valid_until: e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={createMutation.isPending}
              disabled={!form.code || !form.discount_value}
              onClick={() => createMutation.mutate({...form, max_uses: form.max_uses || undefined})}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete promo code" confirmLabel="Delete" variant="danger"
        message="This promo code will be permanently deleted." />
    </AdminShell>
  );
}
