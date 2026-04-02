'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Card, CardHeader, StatusBadge, RoleBadge,
  Button, Select, StatCard, Modal,
} from '@/components/admin/ui/AdminUI';
import { NavIconSvg } from '@/components/admin/ui/Icons';
import { adminUsersApi } from '@/lib/adminApi';

const ROLES = ['super_admin','admin','editor','journalist','moderator','member'];

interface Props { params: { id: string } }


export default function UserDetailPage({ params }: Props) {
    const { id } = params;          // ← no use()
    const userId = Number(id);
    const qc     = useQueryClient();

    const { data, isLoading } = useQuery({
      queryKey: ['admin-user', userId],
      queryFn:  () => adminUsersApi.show(userId).then(r => r.data.data),
      enabled:  !isNaN(userId),
    });

  const [roleModal, setRoleModal] = useState(false);
  const [newRole,   setNewRole]   = useState('');

  const assignMutation = useMutation({
    mutationFn: (role: string) => adminUsersApi.assignRole(userId, role),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['admin-user', userId] });
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setRoleModal(false);
      setNewRole('');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: () => adminUsersApi.suspend(userId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-user', userId] }),
  });

  const activateMutation = useMutation({
    mutationFn: () => adminUsersApi.activate(userId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-user', userId] }),
  });

  if (isLoading) {
    return (
      <AdminShell breadcrumbs={[{ label: 'Users', href: '/admin/users' }, { label: 'Loading…' }]}>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />)}
        </div>
      </AdminShell>
    );
  }

  if (!data) return null;

  return (
    <AdminShell
      breadcrumbs={[{ label: 'Users', href: '/admin/users' }, { label: data.display_name }]}
      topActions={
        data.status === 'active'
          ? <Button variant="danger" size="sm" loading={suspendMutation.isPending} onClick={() => suspendMutation.mutate()}>
              Suspend
            </Button>
          : <Button variant="primary" size="sm" loading={activateMutation.isPending} onClick={() => activateMutation.mutate()}>
              Activate
            </Button>
      }
    >
      <PageHeader title={data.display_name} subtitle={data.email} />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Status"
          value={data.status === 'active' ? 'Active' : 'Suspended'}
          color={data.status === 'active' ? 'green' : 'amber'}
        />
        <StatCard
          label="Articles written"
          value={data.article_count ?? 0}
          icon={<NavIconSvg name="articles" className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          label="Membership"
          value={data.membership?.name ?? 'Free'}
          color="blue"
        />
        <StatCard
          label="Member since"
          value={format(new Date(data.created_at), 'MMM yyyy')}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Profile */}
        <Card>
          <CardHeader title="Profile" />
          <div className="space-y-3">
            {([
              ['Name',      `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || '—'],
              ['Email',      data.email],
              ['Timezone',   data.timezone ?? '—'],
              ['Last login', data.last_login_at
                ? format(new Date(data.last_login_at), 'dd MMM yyyy HH:mm')
                : 'Never'],
              ['Joined',     format(new Date(data.created_at), 'dd MMM yyyy')],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex justify-between items-start gap-4">
                <span className="text-xs font-ui text-gray-500 shrink-0">{label}</span>
                <span className="text-xs font-ui text-gray-800 text-right">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Roles & Membership */}
        <Card>
          <CardHeader
            title="Roles"
            actions={
              <Button variant="secondary" size="sm" onClick={() => setRoleModal(true)}>
                + Assign
              </Button>
            }
          />
          {(data.roles ?? []).length === 0 ? (
            <p className="text-xs font-ui text-gray-400 mb-3">No roles assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {(data.roles as string[]).map(r => <RoleBadge key={r} role={r} />)}
            </div>
          )}

          {data.membership && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-[11px] font-ui font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Membership
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={data.membership.status} />
                <span className="text-xs font-ui text-gray-700 font-medium">
                  {data.membership.name}
                </span>
                {data.membership.end_date && (
                  <span className="text-xs font-ui text-gray-400">
                    expires {format(new Date(data.membership.end_date), 'dd MMM yyyy')}
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Assign role modal */}
      <Modal open={roleModal} onClose={() => setRoleModal(false)} title="Assign role">
        <div className="space-y-3">
          <p className="text-xs font-ui text-gray-500">
            Current: {(data.roles as string[]).join(', ') || 'none'}
          </p>
          <Select
            label="Role to assign"
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            options={ROLES.map(r => ({
              value: r,
              label: r.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase()),
            }))}
            placeholder="Select role…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRoleModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary" size="sm"
              disabled={!newRole}
              loading={assignMutation.isPending}
              onClick={() => newRole && assignMutation.mutate(newRole)}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
