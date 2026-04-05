'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader, Button, ConfirmModal } from '@/components/admin/ui/AdminUI';
import { PlusIcon, EditIcon, TrashIcon, RefreshIcon } from '@/components/admin/ui/Icons';
import { adminAdsApi } from '@/lib/adminApi';

interface DisplayAd {
  id:            number;
  title:         string;
  image_url:     string;
  media_type:    string;
  video_url:     string | null;
  click_url:     string;
  alt_text:      string | null;
  placement:     string;
  is_active:     boolean;
  display_order: number;
  starts_at:     string | null;
  ends_at:       string | null;
  created_at:    string;
}

const PLACEMENT_LABELS: Record<string, string> = {
  all:         'All',
  leaderboard: 'Leaderboard',
  sidebar:     'Sidebar',
  'in-feed':   'In-feed',
};

function fmtDate(s: string | null) {
  if (!s) return '—';
  try { return format(parseISO(s), 'd MMM yyyy HH:mm'); } catch { return s; }
}

export default function AdsPage() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn:  () => adminAdsApi.list().then(r => (r.data.data ?? []) as DisplayAd[]),
  });

  const toggleMut = useMutation({
    mutationFn: (id: number) => adminAdsApi.toggle(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-ads'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminAdsApi.delete(id),
    onSuccess:  () => { setDeleteId(null); qc.invalidateQueries({ queryKey: ['admin-ads'] }); },
  });

  const ads = data ?? [];

  return (
    <AdminShell>
      <PageHeader
        title="Display Ads"
        subtitle={`${ads.length} ad${ads.length !== 1 ? 's' : ''} configured`}
        actions={
          <Link href="/admin/ads/new">
            <Button variant="primary" icon={<PlusIcon />}>New Ad</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 font-ui mb-4">No ads yet.</p>
          <Link href="/admin/ads/new">
            <Button variant="primary" icon={<PlusIcon />}>Create your first ad</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide w-16">Preview</th>
                <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide">Placement</th>
                <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide">Timeline</th>
                <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide w-20">Active</th>
                <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-gray-500 uppercase tracking-wide w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ads.map(ad => (
                <tr key={ad.id} className="hover:bg-gray-50 transition-colors">

                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    <div className="w-14 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                      {ad.media_type === 'video' && ad.video_url ? (
                        <video src={ad.video_url} className="w-full h-full object-cover" muted />
                      ) : ad.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.image_url} alt={ad.alt_text ?? ad.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-300 text-xs">No img</span>
                      )}
                    </div>
                  </td>

                  {/* Title + click URL */}
                  <td className="px-4 py-3">
                    <p className="font-ui font-semibold text-gray-900 text-sm">{ad.title}</p>
                    {ad.click_url && ad.click_url !== '#' && (
                      <a href={ad.click_url} target="_blank" rel="noopener noreferrer"
                         className="text-[11px] text-cni-blue hover:underline truncate block max-w-[220px]">
                        {ad.click_url}
                      </a>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5">Order: {ad.display_order}</p>
                  </td>

                  {/* Placement */}
                  <td className="px-4 py-3">
                    <span className="inline-block text-[10px] font-ui font-semibold uppercase tracking-wide
                                     bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {PLACEMENT_LABELS[ad.placement] ?? ad.placement}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{ad.media_type}</p>
                  </td>

                  {/* Timeline */}
                  <td className="px-4 py-3 text-[11px] text-gray-500 font-ui">
                    {ad.starts_at || ad.ends_at ? (
                      <>
                        <span>{fmtDate(ad.starts_at)}</span>
                        <span className="mx-1 text-gray-300">→</span>
                        <span>{fmtDate(ad.ends_at)}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Always active</span>
                    )}
                  </td>

                  {/* Active toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMut.mutate(ad.id)}
                      disabled={toggleMut.isPending}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${ad.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform ${ad.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/ads/${ad.id}/edit`}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-cni-blue transition-colors"
                            title="Edit">
                        <EditIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(ad.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-cni-red transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Delete ad?"
        message="This ad will be permanently removed and will stop showing on the site."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMut.isPending}
        onConfirm={() => deleteId !== null && deleteMut.mutate(deleteId)}
        onClose={() => setDeleteId(null)}
      />
    </AdminShell>
  );
}
