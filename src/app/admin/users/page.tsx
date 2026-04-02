'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, SearchInput, Select,
  StatusBadge, RoleBadge, ConfirmModal, Card, Modal,
} from '@/components/admin/ui/AdminUI';
import DataTable from '@/components/admin/ui/DataTable';
import { EditIcon, EyeIcon } from '@/components/admin/ui/Icons';
import { adminUsersApi } from '@/lib/adminApi';
import type { AdminUser, TableColumn } from '@/types/admin';
import clsx from 'clsx';
// import { clsx } from 'clsx';

const ROLES = ['super_admin','admin','editor','journalist','moderator','member'];

export default function UsersListPage() {
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role,   setRole]   = useState('');
  const [page,   setPage]   = useState(1);

  const [suspendId, setSuspendId] = useState<number | null>(null);
  const [activateId,setActivateId]= useState<number | null>(null);
  const [roleModal, setRoleModal] = useState<AdminUser | null>(null);
  const [newRole,   setNewRole]   = useState('');

  const params = { search: search||undefined, status: status||undefined, role: role||undefined, page, per_page: 20 };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', params],
    queryFn:  () => adminUsersApi.list(params).then(r => r.data),
    placeholderData: prev => prev,
  });

  const suspendMutation = useMutation({
    mutationFn: (id: number) => adminUsersApi.suspend(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setSuspendId(null); },
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => adminUsersApi.activate(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setActivateId(null); },
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminUsersApi.assignRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setRoleModal(null);
      setNewRole('');
    },
  });

  const users: AdminUser[] = data?.data ?? [];

  const columns: TableColumn<AdminUser>[] = [
    {
      key:    'display_name',
      header: 'User',
      render: row => (
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cni-blue-light border border-cni-blue/30 flex items-center justify-center flex-shrink-0">
              <span className="text-cni-blue font-ui font-bold text-[11px]">
                {row.display_name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div>
              <p className="text-sm font-ui font-medium text-gray-800">{row.display_name}</p>
              <p className="text-[11px] font-ui text-gray-400">{row.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key:    'roles',
      header: 'Role',
      render: row => (
        <div className="flex flex-wrap gap-1">
          {(row.roles ?? []).map(r => <RoleBadge key={r} role={r} />)}
          {(!row.roles || row.roles.length === 0) && (
            <span className="text-[11px] font-ui text-gray-400">No role</span>
          )}
        </div>
      ),
      width: 'w-40',
    },
    {
      key:    'status',
      header: 'Status',
      render: row => <StatusBadge status={row.status} />,
      width:  'w-24',
    },
    {
      key:    'membership_plan',
      header: 'Membership',
      render: row => (
        <span className="text-xs font-ui text-gray-500">
          {row.membership_plan ?? 'Free'}
        </span>
      ),
      width: 'w-28',
    },
    {
      key:    'created_at',
      header: 'Joined',
      render: row => (
        <span className="text-xs font-ui text-gray-400"
          title={format(new Date(row.created_at), 'dd MMM yyyy')}>
          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
        </span>
      ),
      sortable: true,
      width:    'w-28',
    },
    {
      key:    'last_login_at',
      header: 'Last login',
      render: row => (
        <span className="text-xs font-ui text-gray-400">
          {row.last_login_at
            ? formatDistanceToNow(new Date(row.last_login_at), { addSuffix: true })
            : 'Never'}
        </span>
      ),
      width: 'w-28',
    },
    {
      key:    '_actions',
      header: '',
      width:  'w-32',
      render: row => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setRoleModal(row)}
            className="text-[11px] font-ui px-2 py-1 border border-gray-300 rounded text-gray-600 hover:border-cni-blue hover:text-cni-blue transition-colors"
            title="Assign role"
          >
            Role
          </button>
          {row.status === 'active' ? (
            <button
              onClick={() => setSuspendId(row.id)}
              className="text-[11px] font-ui px-2 py-1 border border-gray-300 rounded text-gray-600 hover:border-cni-red hover:text-cni-red transition-colors"
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={() => setActivateId(row.id)}
              className="text-[11px] font-ui px-2 py-1 border border-gray-300 rounded text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              Activate
            </button>
          )}
          <Link href={`/admin/users/${row.id}`}>
            <button className="p-1.5 text-gray-400 hover:text-cni-blue hover:bg-gray-100 rounded" title="View">
              <EyeIcon className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AdminShell breadcrumbs={[{ label: 'Users' }]}>
      <PageHeader
        title="Users"
        subtitle={`${data?.meta?.total ?? '—'} total users`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name or email…" className="w-64" />
        <Select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          options={[{value:'active',label:'Active'},{value:'suspended',label:'Suspended'}]}
          placeholder="All statuses"
          className="w-36 text-xs"
        />
        <Select
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          options={ROLES.map(r => ({ value: r, label: r.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase()) }))}
          placeholder="All roles"
          className="w-36 text-xs"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        pagination={data?.meta}
        onPageChange={setPage}
        emptyMessage="No users found."
      />

      {/* Assign role modal */}
      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title={`Assign role — ${roleModal?.display_name}`}>
        <div className="space-y-3">
          <p className="text-xs font-ui text-gray-500">
            Current roles: {(roleModal?.roles ?? []).join(', ') || 'none'}
          </p>
          <Select
            label="New role"
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            options={ROLES.map(r => ({ value: r, label: r.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase()) }))}
            placeholder="Select role…"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setRoleModal(null)}>Cancel</Button>
            <Button
              variant="primary" size="sm"
              disabled={!newRole}
              loading={assignRoleMutation.isPending}
              onClick={() => roleModal && newRole && assignRoleMutation.mutate({ id: roleModal.id, role: newRole })}
            >
              Assign role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend confirm */}
      <ConfirmModal
        open={suspendId !== null}
        onClose={() => setSuspendId(null)}
        onConfirm={() => suspendId && suspendMutation.mutate(suspendId)}
        loading={suspendMutation.isPending}
        title="Suspend user"
        message="This user will be suspended and all active sessions revoked. They will not be able to log in until reactivated."
        confirmLabel="Suspend"
        variant="danger"
      />

      {/* Activate confirm */}
      <ConfirmModal
        open={activateId !== null}
        onClose={() => setActivateId(null)}
        onConfirm={() => activateId && activateMutation.mutate(activateId)}
        loading={activateMutation.isPending}
        title="Activate user"
        message="This user's account will be reactivated and they will be able to log in again."
        confirmLabel="Activate"
        variant="primary"
      />
    </AdminShell>
  );
}
