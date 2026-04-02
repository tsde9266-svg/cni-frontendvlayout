// 'use client';

// import { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { format } from 'date-fns';
// import AdminShell from '@/components/admin/layout/AdminShell';
// import {
//   PageHeader, Button, Input, Select, Textarea,
//   StatusBadge, Card, Modal, ConfirmModal, SearchInput,
// } from '@/components/admin/ui/AdminUI';
// import { adminEventsApi } from '@/lib/adminApi';
// import { PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ui/Icons';
// import type { TableColumn } from '@/types/admin';
// import DataTable from '@/components/admin/ui/DataTable';

// interface Event {
//   id: number; title: string; description: string | null; location_name: string | null;
//   city: string | null; country: string; starts_at: string; ends_at: string | null;
//   status: string; is_public: boolean; ticket_price: number; max_capacity: number | null;
// }

// const EMPTY = { title: '', description: '', location_name: '', city: '', country: 'GB', starts_at: '', ends_at: '', status: 'draft', ticket_price: 0, max_capacity: '' };

// export default function EventsPage() {
//   const qc = useQueryClient();
//   const [search,   setSearch]   = useState('');
//   const [statusF,  setStatusF]  = useState('');
//   const [page,     setPage]     = useState(1);
//   const [modal,    setModal]    = useState<'create'|'edit'|null>(null);
//   const [editing,  setEditing]  = useState<Event|null>(null);
//   const [deleteId, setDeleteId] = useState<number|null>(null);
//   const [form,     setForm]     = useState<typeof EMPTY>(EMPTY);

//   const params = { search: search||undefined, status: statusF||undefined, page, per_page: 20 };
//   // In Node.js
//   const bcrypt = require('bcrypt');
//   const storedHash = '$2y$12$LXyYaPERSNTaUmKeiI2lnOlp/M1CMeg29VKUCbwXlna2sx7jc3w2m';

//   bcrypt.compare('guessedpassword', storedHash, (err, result) => {
//     console.log(result);  // true = match, false = no match
//   });

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin-events', params],
//     queryFn:  () => adminEventsApi.list(params).then(r => r.data),
//     placeholderData: prev => prev,
//   });

//   const createMutation = useMutation({
//     mutationFn: (d: object) => adminEventsApi.create(d),
//     onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setModal(null); setForm(EMPTY); },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, d }: { id: number; d: object }) => adminEventsApi.update(id, d),
//     onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setModal(null); },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: number) => adminEventsApi.delete(id),
//     onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setDeleteId(null); },
//   });

//   const openEdit = (e: Event) => {
//     setEditing(e);
//     setForm({ title: e.title, description: e.description??'', location_name: e.location_name??'',
//       city: e.city??'', country: e.country, starts_at: e.starts_at?.slice(0,16)??'',
//       ends_at: e.ends_at?.slice(0,16)??'', status: e.status,
//       ticket_price: e.ticket_price, max_capacity: String(e.max_capacity??'') });
//     setModal('edit');
//   };

//   const events: Event[] = data?.data ?? [];

//   const columns: TableColumn<Event>[] = [
//     {
//       key: 'title', header: 'Event',
//       render: row => (
//         <div>
//           <p className="text-sm font-ui font-medium text-gray-800">{row.title}</p>
//           <p className="text-[11px] font-ui text-gray-400">
//             {[row.location_name, row.city].filter(Boolean).join(', ')}
//           </p>
//         </div>
//       ),
//     },
//     { key: 'status', header: 'Status', render: row => <StatusBadge status={row.status} />, width: 'w-24' },
//     {
//       key: 'starts_at', header: 'Date',
//       render: row => <span className="text-xs font-ui text-gray-600">{format(new Date(row.starts_at), 'dd MMM yyyy')}</span>,
//       width: 'w-28',
//     },
//     {
//       key: 'ticket_price', header: 'Ticket',
//       render: row => <span className="text-xs font-ui text-gray-600">{row.ticket_price > 0 ? `£${row.ticket_price}` : 'Free'}</span>,
//       width: 'w-20',
//     },
//     {
//       key: '_actions', header: '', width: 'w-20',
//       render: row => (
//         <div className="flex items-center gap-1 justify-end">
//           <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-cni-blue hover:bg-gray-100 rounded"><EditIcon className="w-3.5 h-3.5"/></button>
//           <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-gray-400 hover:text-cni-red hover:bg-red-50 rounded"><TrashIcon className="w-3.5 h-3.5"/></button>
//         </div>
//       ),
//     },
//   ];

//   const EventForm = () => (
//     <div className="space-y-3">
//       <Input label="Title" value={form.title} onChange={e => setForm(f=>({...f, title: e.target.value}))} required />
//       <Textarea label="Description" value={form.description} onChange={e => setForm(f=>({...f, description: e.target.value}))} rows={2} />
//       <div className="grid grid-cols-2 gap-3">
//         <Input label="Venue" value={form.location_name} onChange={e => setForm(f=>({...f, location_name: e.target.value}))} />
//         <Input label="City" value={form.city} onChange={e => setForm(f=>({...f, city: e.target.value}))} />
//       </div>
//       <div className="grid grid-cols-2 gap-3">
//         <Input label="Starts" type="datetime-local" value={form.starts_at} onChange={e => setForm(f=>({...f, starts_at: e.target.value}))} required />
//         <Input label="Ends" type="datetime-local" value={form.ends_at} onChange={e => setForm(f=>({...f, ends_at: e.target.value}))} />
//       </div>
//       <div className="grid grid-cols-2 gap-3">
//         <Select label="Status" value={form.status} onChange={e => setForm(f=>({...f, status: e.target.value}))}
//           options={[{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'canceled',label:'Canceled'}]} />
//         <Input label="Ticket price (£, 0=free)" type="number" value={form.ticket_price}
//           onChange={e => setForm(f=>({...f, ticket_price: Number(e.target.value)}))} />
//       </div>
//       <Input label="Max capacity (blank=unlimited)" type="number" value={form.max_capacity}
//         onChange={e => setForm(f=>({...f, max_capacity: e.target.value}))} />
//       <div className="flex justify-end gap-2 pt-1">
//         <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
//         <Button variant="primary" size="sm"
//           loading={createMutation.isPending || updateMutation.isPending}
//           disabled={!form.title || !form.starts_at}
//           onClick={() => {
//             const payload = {...form, max_capacity: form.max_capacity || undefined};
//             if (modal === 'create') createMutation.mutate(payload);
//             else if (editing)       updateMutation.mutate({ id: editing.id, d: payload });
//           }}>
//           {modal === 'create' ? 'Create' : 'Save'}
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <AdminShell breadcrumbs={[{ label: 'Events' }]}>
//       <PageHeader
//         title="Events"
//         subtitle={`${data?.meta?.total ?? '—'} events`}
//         actions={
//           <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5"/>}
//             onClick={() => { setForm(EMPTY); setEditing(null); setModal('create'); }}>
//             New event
//           </Button>
//         }
//       />
//       <div className="flex flex-wrap gap-2 mb-4">
//         <SearchInput value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder="Search events…" className="w-64"/>
//         <Select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}}
//           options={[{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'canceled',label:'Canceled'},{value:'completed',label:'Completed'}]}
//           placeholder="All statuses" className="w-36 text-xs"/>
//       </div>
//       <DataTable columns={columns} data={events} loading={isLoading}
//         pagination={data?.meta} onPageChange={setPage} emptyMessage="No events found." />
//       <Modal open={!!modal} onClose={() => setModal(null)} title={modal==='create' ? 'New event' : `Edit: ${editing?.title}`} width="max-w-xl">
//         <EventForm />
//       </Modal>
//       <ConfirmModal open={deleteId !== null} onClose={() => setDeleteId(null)}
//         onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
//         loading={deleteMutation.isPending} title="Delete event" confirmLabel="Delete" variant="danger"
//         message="This event will be permanently deleted." />
//     </AdminShell>
//   );
// }






'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, Input, Select, Textarea,
  StatusBadge, Card, Modal, ConfirmModal, SearchInput,
} from '@/components/admin/ui/AdminUI';
import { adminEventsApi } from '@/lib/adminApi';
import { PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ui/Icons';
import type { TableColumn } from '@/types/admin';
import DataTable from '@/components/admin/ui/DataTable';

interface Event {
  id: number; title: string; description: string | null; location_name: string | null;
  city: string | null; country: string; starts_at: string; ends_at: string | null;
  status: string; is_public: boolean; ticket_price: number; max_capacity: number | null;
}

const EMPTY = { title: '', description: '', location_name: '', city: '', country: 'GB', starts_at: '', ends_at: '', status: 'draft', ticket_price: 0, max_capacity: '' };

export default function EventsPage() {
  const qc = useQueryClient();
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('');
  const [page,       setPage]       = useState(1);
  const [modal,      setModal]      = useState<'create'|'edit'|null>(null);
  const [editing,    setEditing]    = useState<Event|null>(null);
  const [deleteId,   setDeleteId]   = useState<number|null>(null);
  const [form,       setForm]       = useState<typeof EMPTY>(EMPTY);

  const params = { search: search||undefined, status: statusF||undefined, page, per_page: 20 };

  // ✅ REMOVED: bcrypt code - this was breaking client-side rendering

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', params],
    queryFn:  () => adminEventsApi.list(params).then(r => r.data),
    placeholderData: prev => prev,
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => adminEventsApi.create(d),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setModal(null); setForm(EMPTY); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: number; d: object }) => adminEventsApi.update(id, d),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminEventsApi.delete(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setDeleteId(null); },
  });

  const openEdit = (e: Event) => {
    setEditing(e);
    setForm({ 
      title: e.title, 
      description: e.description??'', 
      location_name: e.location_name??'',
      city: e.city??'', 
      country: e.country, 
      starts_at: e.starts_at?.slice(0,16)??'',
      ends_at: e.ends_at?.slice(0,16)??'', 
      status: e.status,
      ticket_price: e.ticket_price, 
      max_capacity: String(e.max_capacity??'') 
    });
    setModal('edit');
  };

  const events: Event[] = data?.data ?? [];

  const columns: TableColumn<Event>[] = [
    {
      key: 'title', header: 'Event',
      render: row => (
        <div>
          <p className="text-sm font-ui font-medium text-gray-800">{row.title}</p>
          <p className="text-[11px] font-ui text-gray-400">
            {[row.location_name, row.city].filter(Boolean).join(', ')}
          </p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: row => <StatusBadge status={row.status} />, width: 'w-24' },
    {
      key: 'starts_at', header: 'Date',
      render: row => <span className="text-xs font-ui text-gray-600">{format(new Date(row.starts_at), 'dd MMM yyyy')}</span>,
      width: 'w-28',
    },
    {
      key: 'ticket_price', header: 'Ticket',
      render: row => <span className="text-xs font-ui text-gray-600">{row.ticket_price > 0 ? `£${row.ticket_price}` : 'Free'}</span>,
      width: 'w-20',
    },
    {
      key: '_actions', header: '', width: 'w-20',
      render: row => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-cni-blue hover:bg-gray-100 rounded"><EditIcon className="w-3.5 h-3.5"/></button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 text-gray-400 hover:text-cni-red hover:bg-red-50 rounded"><TrashIcon className="w-3.5 h-3.5"/></button>
        </div>
      ),
    },
  ];

  const EventForm = () => (
    <div className="space-y-3">
      <Input label="Title" value={form.title} onChange={e => setForm(f=>({...f, title: e.target.value}))} required />
      <Textarea label="Description" value={form.description} onChange={e => setForm(f=>({...f, description: e.target.value}))} rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Venue" value={form.location_name} onChange={e => setForm(f=>({...f, location_name: e.target.value}))} />
        <Input label="City" value={form.city} onChange={e => setForm(f=>({...f, city: e.target.value}))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Starts" type="datetime-local" value={form.starts_at} onChange={e => setForm(f=>({...f, starts_at: e.target.value}))} required />
        <Input label="Ends" type="datetime-local" value={form.ends_at} onChange={e => setForm(f=>({...f, ends_at: e.target.value}))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Status" value={form.status} onChange={e => setForm(f=>({...f, status: e.target.value}))}
          options={[{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'canceled',label:'Canceled'}]} />
        <Input label="Ticket price (£, 0=free)" type="number" value={form.ticket_price}
          onChange={e => setForm(f=>({...f, ticket_price: Number(e.target.value)}))} />
      </div>
      <Input label="Max capacity (blank=unlimited)" type="number" value={form.max_capacity}
        onChange={e => setForm(f=>({...f, max_capacity: e.target.value}))} />
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={() => setModal(null)}>Cancel</Button>
        <Button variant="primary" size="sm"
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={!form.title || !form.starts_at}
          onClick={() => {
            const payload = {...form, max_capacity: form.max_capacity || undefined};
            if (modal === 'create') createMutation.mutate(payload);
            else if (editing)       updateMutation.mutate({ id: editing.id, d: payload });
          }}>
          {modal === 'create' ? 'Create' : 'Save'}
        </Button>
      </div>
    </div>
  );

  return (
    <AdminShell breadcrumbs={[{ label: 'Events' }]}>
      <PageHeader
        title="Events"
        subtitle={`${data?.meta?.total ?? '—'} events`}
        actions={
          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5"/>}
            onClick={() => { setForm(EMPTY); setEditing(null); setModal('create'); }}>
            New event
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <SearchInput value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder="Search events…" className="w-64"/>
        <Select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}}
          options={[{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'canceled',label:'Canceled'},{value:'completed',label:'Completed'}]}
          placeholder="All statuses" className="w-36 text-xs"/>
      </div>
      <DataTable columns={columns} data={events} loading={isLoading}
        pagination={data?.meta} onPageChange={setPage} emptyMessage="No events found." />
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal==='create' ? 'New event' : `Edit: ${editing?.title}`} width="max-w-xl">
        <EventForm />
      </Modal>
      <ConfirmModal open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending} title="Delete event" confirmLabel="Delete" variant="danger"
        message="This event will be permanently deleted." />
    </AdminShell>
  );
}
