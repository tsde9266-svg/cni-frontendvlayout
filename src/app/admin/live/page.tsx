'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import {
  PageHeader, Button, Input, Select, Textarea,
  StatusBadge, Card, Modal, ConfirmModal,
} from '@/components/admin/ui/AdminUI';
import { adminLiveApi } from '@/lib/adminApi';
import { PlusIcon } from '@/components/admin/ui/Icons';
import clsx from 'clsx';
// import { clsx } from 'clsx';

interface Stream {
  id: number; title: string; description: string | null; status: string;
  primary_platform: string; platform_stream_id: string | null;
  scheduled_start_at: string | null; actual_start_at: string | null;
  actual_end_at: string | null; is_public: boolean; peak_viewers: number;
}

const PLATFORM_LABELS: Record<string, string> = { youtube: 'YouTube', facebook: 'Facebook', custom_rtmp: 'Custom RTMP' };
const EMPTY = { title: '', description: '', primary_platform: 'youtube', platform_stream_id: '', scheduled_start_at: '', is_public: true };

export default function LiveStreamsPage() {
  const qc = useQueryClient();
  const [modal,    setModal]    = useState(false);
  const [endId,    setEndId]    = useState<number|null>(null);
  const [form,     setForm]     = useState(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-live'],
    queryFn:  () => adminLiveApi.list().then(r => r.data),
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => adminLiveApi.create(d),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-live'] }); setModal(false); setForm(EMPTY); },
  });

  const goLiveMutation = useMutation({
    mutationFn: (id: number) => adminLiveApi.goLive(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-live'] }),
  });

  const endMutation = useMutation({
    mutationFn: (id: number) => adminLiveApi.end(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-live'] }); setEndId(null); },
  });

  const streams: Stream[] = data?.data ?? [];
  const live      = streams.filter(s => s.status === 'live');
  const scheduled = streams.filter(s => s.status === 'scheduled');
  const ended     = streams.filter(s => s.status === 'ended' || s.status === 'canceled');

  const StreamCard = ({ stream }: { stream: Stream }) => (
    <Card className={clsx('border-l-4', {
      'border-l-red-500 bg-red-50/30': stream.status === 'live',
      'border-l-blue-400':             stream.status === 'scheduled',
      'border-l-gray-300':             stream.status === 'ended' || stream.status === 'canceled',
    })}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={stream.status} />
            <span className="text-[11px] font-ui text-gray-500">{PLATFORM_LABELS[stream.primary_platform]}</span>
          </div>
          <p className="font-ui font-semibold text-gray-800 truncate">{stream.title}</p>
          {stream.description && <p className="text-xs font-ui text-gray-500 mt-0.5 line-clamp-2">{stream.description}</p>}
          <div className="flex items-center gap-4 mt-2">
            {stream.scheduled_start_at && (
              <span className="text-[11px] font-ui text-gray-400">
                Scheduled: {format(new Date(stream.scheduled_start_at), 'dd MMM yyyy HH:mm')}
              </span>
            )}
            {stream.status === 'live' && stream.actual_start_at && (
              <span className="text-[11px] font-ui text-red-600 font-medium">
                Live since {format(new Date(stream.actual_start_at), 'HH:mm')}
              </span>
            )}
            {stream.peak_viewers > 0 && (
              <span className="text-[11px] font-ui text-gray-400">Peak: {stream.peak_viewers.toLocaleString()} viewers</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {stream.status === 'scheduled' && (
            <Button variant="primary" size="sm" loading={goLiveMutation.isPending}
              onClick={() => goLiveMutation.mutate(stream.id)}
              className="bg-red-600 hover:bg-red-700 text-white">
              Go Live
            </Button>
          )}
          {stream.status === 'live' && (
            <Button variant="danger" size="sm" onClick={() => setEndId(stream.id)}>
              End Stream
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <AdminShell breadcrumbs={[{ label: 'Live streams' }]}>
      <PageHeader
        title="Live streams"
        actions={
          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5"/>}
            onClick={() => { setForm(EMPTY); setModal(true); }}>
            Schedule stream
          </Button>
        }
      />

      {live.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-ui font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
            Live now ({live.length})
          </h2>
          <div className="space-y-3">{live.map(s => <StreamCard key={s.id} stream={s}/>)}</div>
        </div>
      )}

      {scheduled.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-ui font-bold text-blue-600 uppercase tracking-widest mb-2">Scheduled ({scheduled.length})</h2>
          <div className="space-y-3">{scheduled.map(s => <StreamCard key={s.id} stream={s}/>)}</div>
        </div>
      )}

      {ended.length > 0 && (
        <div>
          <h2 className="text-xs font-ui font-bold text-gray-400 uppercase tracking-widest mb-2">Ended / Canceled</h2>
          <div className="space-y-3">{ended.map(s => <StreamCard key={s.id} stream={s}/>)}</div>
        </div>
      )}

      {!isLoading && streams.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm font-ui">No streams scheduled.</div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Schedule live stream">
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={e => setForm(f=>({...f, title: e.target.value}))} required />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f=>({...f, description: e.target.value}))} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Platform" value={form.primary_platform}
              onChange={e => setForm(f=>({...f, primary_platform: e.target.value}))}
              options={[{value:'youtube',label:'YouTube'},{value:'facebook',label:'Facebook'},{value:'custom_rtmp',label:'Custom RTMP'}]} />
            <Input label="Stream ID / Key" value={form.platform_stream_id}
              onChange={e => setForm(f=>({...f, platform_stream_id: e.target.value}))} placeholder="YouTube video ID" />
          </div>
          <Input label="Scheduled start" type="datetime-local" value={form.scheduled_start_at}
            onChange={e => setForm(f=>({...f, scheduled_start_at: e.target.value}))} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={createMutation.isPending}
              disabled={!form.title}
              onClick={() => createMutation.mutate(form)}>
              Schedule
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={endId !== null} onClose={() => setEndId(null)}
        onConfirm={() => endId && endMutation.mutate(endId)}
        loading={endMutation.isPending}
        title="End live stream" confirmLabel="End stream" variant="danger"
        message="Are you sure you want to end this live stream? This cannot be undone." />
    </AdminShell>
  );
}
