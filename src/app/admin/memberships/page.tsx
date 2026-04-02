'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Card, CardHeader, StatCard, Button,
  StatusBadge, SearchInput, Select, ConfirmModal, Modal, Input, Textarea,
} from '@/components/admin/ui/AdminUI';
import DataTable from '@/components/admin/ui/DataTable';
import { NavIconSvg, PlusIcon } from '@/components/admin/ui/Icons';
import { adminMembershipsApi } from '@/lib/adminApi';
import type { TableColumn } from '@/types/admin';
import clsx from 'clsx';
// import { clsx } from 'clsx';

interface Plan {
  id: number; name: string; slug: string; description: string | null;
  price_amount: number; price_currency: string; billing_cycle: string;
  stripe_price_id: string | null; badge_label: string | null; badge_color: string | null;
  is_free_tier: boolean; features: Record<string, boolean>; active_count: number;
}
interface Member {
  id: number; display_name: string; email: string; plan_name: string;
  price_amount: number; billing_cycle: string; status: string;
  start_date: string; end_date: string | null; stripe_subscription_id: string | null; created_at: string;
}

const PLAN_COLORS: Record<string, string> = {
  free: 'border-gray-200 bg-gray-50',
  gold: 'border-yellow-300 bg-yellow-50',
  platinum: 'border-purple-300 bg-purple-50',
};

const EMPTY_PLAN = { name: '', description: '', price_amount: 0, billing_cycle: 'monthly', badge_label: '', badge_color: '' };

export default function MembershipsPage() {
  const qc = useQueryClient();
  const [tab,       setTab]       = useState<'plans'|'members'>('plans');
  const [search,    setSearch]    = useState('');
  const [statusF,   setStatusF]   = useState('active');
  const [page,      setPage]      = useState(1);
  const [cancelId,  setCancelId]  = useState<number | null>(null);
  const [planModal, setPlanModal] = useState<'create'|'edit'|null>(null);
  const [editPlan,  setEditPlan]  = useState<Plan | null>(null);
  const [planForm,  setPlanForm]  = useState(EMPTY_PLAN);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn:  () => adminMembershipsApi.plans().then(r => r.data.data as Plan[]),
  });

  const params = { search: search||undefined, status: statusF||undefined, page, per_page: 20 };
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['admin-members', params],
    queryFn:  () => adminMembershipsApi.members(params).then(r => r.data),
    placeholderData: prev => prev,
    enabled: tab === 'members',
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => adminMembershipsApi.cancelMembership(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-members'] }); setCancelId(null); },
  });

  const savePlanMutation = useMutation({
    mutationFn: (d: object) => planModal === 'create'
      ? adminMembershipsApi.updatePlan(0, d)   // store not in S1 api — use update endpoint
      : adminMembershipsApi.updatePlan(editPlan!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-plans'] }); setPlanModal(null); },
  });

  const members: Member[] = membersData?.data ?? [];

  const memberColumns: TableColumn<Member>[] = [
    {
      key: 'display_name', header: 'Member',
      render: row => (
        <div>
          <p className="text-sm font-ui font-medium text-gray-800">{row.display_name}</p>
          <p className="text-[11px] font-ui text-gray-400">{row.email}</p>
        </div>
      ),
    },
    { key: 'plan_name', header: 'Plan', render: row => <span className="text-xs font-ui font-medium text-gray-700">{row.plan_name}</span>, width: 'w-28' },
    { key: 'status', header: 'Status', render: row => <StatusBadge status={row.status} />, width: 'w-24' },
    {
      key: 'end_date', header: 'Renews / Expires',
      render: row => (
        <span className="text-xs font-ui text-gray-500">
          {row.end_date ? format(new Date(row.end_date), 'dd MMM yyyy') : '—'}
        </span>
      ),
      width: 'w-32',
    },
    {
      key: 'created_at', header: 'Joined',
      render: row => <span className="text-xs font-ui text-gray-400">{formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}</span>,
      width: 'w-28',
    },
    {
      key: '_actions', header: '', width: 'w-20',
      render: row => row.status === 'active' ? (
        <Button variant="ghost" size="sm" className="text-[11px] text-red-500 hover:bg-red-50"
          onClick={() => setCancelId(row.id)}>
          Cancel
        </Button>
      ) : null,
    },
  ];

  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    setPlanForm({ name: plan.name, description: plan.description ?? '', price_amount: plan.price_amount, billing_cycle: plan.billing_cycle, badge_label: plan.badge_label ?? '', badge_color: plan.badge_color ?? '' });
    setPlanModal('edit');
  };

  return (
    <AdminShell breadcrumbs={[{ label: 'Memberships' }]}>
      <PageHeader title="Memberships" subtitle="Plans, active members and subscription management" />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Active members" value={plans?.reduce((a, p) => a + p.active_count, 0) ?? '—'} color="green" icon={<NavIconSvg name="memberships" className="w-4 h-4"/>} />
        <StatCard label="Plans" value={plans?.length ?? '—'} color="blue" />
        <StatCard label="Free tier" value={plans?.find(p => p.is_free_tier)?.active_count ?? '—'} color="blue" />
        <StatCard label="Paid subscribers" value={plans?.filter(p => !p.is_free_tier).reduce((a,p) => a+p.active_count, 0) ?? '—'} color="amber" />
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-gray-200 mb-5">
        {(['plans','members'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('px-4 py-2.5 text-sm font-ui font-medium border-b-2 -mb-px capitalize transition-colors',
              tab === t ? 'border-cni-blue text-cni-blue' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <>
          <div className="flex justify-end mb-4">
            <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5"/>}
              onClick={() => { setPlanForm(EMPTY_PLAN); setEditPlan(null); setPlanModal('create'); }}>
              New plan
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plansLoading
              ? [1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"/>)
              : (plans ?? []).map(plan => (
                <Card key={plan.id} className={clsx('border-2', PLAN_COLORS[plan.slug] ?? 'border-gray-200 bg-white')}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-ui font-bold text-gray-900 text-base">{plan.name}</h3>
                        {plan.badge_label && (
                          <span className="text-[10px] font-ui font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: plan.badge_color ?? '#003087' }}>
                            {plan.badge_label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-ui text-gray-500 mt-0.5">{plan.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(plan)} className="text-xs">Edit</Button>
                  </div>
                  <p className="text-2xl font-ui font-bold text-gray-900 mb-1">
                    {plan.is_free_tier ? 'Free' : `£${plan.price_amount.toFixed(2)}`}
                    {!plan.is_free_tier && <span className="text-sm font-normal text-gray-400 ml-1">/{plan.billing_cycle}</span>}
                  </p>
                  <p className="text-xs font-ui text-gray-500 mb-3">{plan.active_count} active subscribers</p>
                  {plan.stripe_price_id && (
                    <p className="text-[11px] font-mono text-gray-400 truncate">{plan.stripe_price_id}</p>
                  )}
                </Card>
              ))
            }
          </div>
        </>
      )}

      {tab === 'members' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search members…" className="w-64" />
            <Select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}
              options={[{value:'active',label:'Active'},{value:'canceled',label:'Canceled'},{value:'expired',label:'Expired'},{value:'trialing',label:'Trialing'}]}
              placeholder="All statuses" className="w-36 text-xs" />
          </div>
          <DataTable
            columns={memberColumns} data={members} loading={membersLoading}
            pagination={membersData?.meta} onPageChange={setPage}
            emptyMessage="No members found." />
        </>
      )}

      {/* Plan modal */}
      <Modal open={!!planModal} onClose={() => setPlanModal(null)}
        title={planModal === 'create' ? 'New membership plan' : `Edit: ${editPlan?.name}`}>
        <div className="space-y-3">
          <Input label="Plan name" value={planForm.name} onChange={e => setPlanForm(f => ({...f, name: e.target.value}))} required />
          <Textarea label="Description" value={planForm.description} onChange={e => setPlanForm(f => ({...f, description: e.target.value}))} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (£)" type="number" value={planForm.price_amount} onChange={e => setPlanForm(f => ({...f, price_amount: Number(e.target.value)}))} />
            <Select label="Billing cycle" value={planForm.billing_cycle}
              onChange={e => setPlanForm(f => ({...f, billing_cycle: e.target.value}))}
              options={[{value:'monthly',label:'Monthly'},{value:'yearly',label:'Yearly'},{value:'lifetime',label:'Lifetime'}]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Badge label" value={planForm.badge_label} onChange={e => setPlanForm(f => ({...f, badge_label: e.target.value}))} placeholder="GOLD" />
            <Input label="Badge colour" type="color" value={planForm.badge_color || '#C9A84C'} onChange={e => setPlanForm(f => ({...f, badge_color: e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setPlanModal(null)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={savePlanMutation.isPending}
              onClick={() => savePlanMutation.mutate(planForm)}>
              {planModal === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={cancelId !== null} onClose={() => setCancelId(null)}
        onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
        loading={cancelMutation.isPending}
        title="Cancel membership" confirmLabel="Cancel membership" variant="danger"
        message="This will immediately cancel the member's subscription. They will lose access at end of billing period." />
    </AdminShell>
  );
}
