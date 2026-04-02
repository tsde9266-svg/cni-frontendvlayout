'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader, StatCard, SearchInput, Select } from '@/components/admin/ui/AdminUI';
import DataTable from '@/components/admin/ui/DataTable';
import { NavIconSvg } from '@/components/admin/ui/Icons';
import api from '@/lib/api';
import type { TableColumn } from '@/types/admin';
import clsx from 'clsx';
// import { clsx } from 'clsx';

interface Payment {
  id: number; display_name: string; email: string; amount: number;
  amount_paid: number; discount_amount: number; currency: string;
  status: string; gateway: string; card: string | null;
  receipt_url: string | null; paid_at: string | null; created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  succeeded: 'bg-green-100 text-green-800',
  pending:   'bg-amber-100 text-amber-800',
  failed:    'bg-red-100 text-red-800',
  refunded:  'bg-gray-100 text-gray-600',
};

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('succeeded');
  const [page,   setPage]   = useState(1);

  const params = { search: search||undefined, status: status||undefined, page, per_page: 20 };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', params],
    queryFn:  () => api.get('/api/v1/admin/payments', { params }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const payments: Payment[] = data?.data ?? [];
  const monthRevenue: number = data?.meta?.month_revenue ?? 0;

  const columns: TableColumn<Payment>[] = [
    {
      key: 'display_name', header: 'Customer',
      render: row => (
        <div>
          <p className="text-sm font-ui font-medium text-gray-800">{row.display_name}</p>
          <p className="text-[11px] font-ui text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'amount_paid', header: 'Amount',
      render: row => (
        <div>
          <span className="text-sm font-ui font-semibold text-gray-800">
            £{row.amount_paid.toFixed(2)}
          </span>
          {row.discount_amount > 0 && (
            <span className="text-[11px] font-ui text-green-600 ml-1.5">-£{row.discount_amount.toFixed(2)}</span>
          )}
        </div>
      ),
      width: 'w-28',
    },
    {
      key: 'status', header: 'Status',
      render: row => (
        <span className={clsx('text-[11px] font-ui font-semibold px-2 py-0.5 rounded-full uppercase', STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600')}>
          {row.status}
        </span>
      ),
      width: 'w-24',
    },
    {
      key: 'gateway', header: 'Method',
      render: row => (
        <span className="text-xs font-ui text-gray-600">
          {row.card ?? row.gateway}
        </span>
      ),
      width: 'w-36',
    },
    {
      key: 'paid_at', header: 'Date',
      render: row => (
        <span className="text-xs font-ui text-gray-500">
          {row.paid_at ? format(new Date(row.paid_at), 'dd MMM yyyy HH:mm') : '—'}
        </span>
      ),
      width: 'w-36',
    },
    {
      key: '_receipt', header: '',  width: 'w-20',
      render: row => row.receipt_url ? (
        <a href={row.receipt_url} target="_blank" rel="noreferrer"
          className="text-[11px] font-ui text-cni-blue hover:underline">
          Receipt
        </a>
      ) : null,
    },
  ];

  return (
    <AdminShell breadcrumbs={[{ label: 'Payments' }]}>
      <PageHeader title="Payments" subtitle="Transaction history" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Revenue this month" value={`£${monthRevenue.toFixed(2)}`}
          icon={<NavIconSvg name="payments" className="w-4 h-4"/>} color="green" />
        <StatCard label="Total transactions" value={data?.meta?.total ?? '—'} color="blue" />
        <StatCard label="Succeeded" value={status === 'succeeded' ? (data?.meta?.total ?? '—') : '—'} color="green" />
        <StatCard label="Failed" value="—" color="amber" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }}
          placeholder="Search by name, email or transaction ID…" className="w-80" />
        <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          options={[{value:'succeeded',label:'Succeeded'},{value:'pending',label:'Pending'},{value:'failed',label:'Failed'},{value:'refunded',label:'Refunded'}]}
          placeholder="All statuses" className="w-36 text-xs" />
      </div>

      <DataTable columns={columns} data={payments} loading={isLoading}
        pagination={data?.meta} onPageChange={setPage}
        emptyMessage="No payments found." />
    </AdminShell>
  );
}
