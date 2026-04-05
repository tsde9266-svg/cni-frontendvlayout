'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader } from '@/components/admin/ui/AdminUI';
import AdForm from '@/components/admin/ads/AdForm';
import { adminAdsApi } from '@/lib/adminApi';

export default function EditAdPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ad', id],
    queryFn:  () => adminAdsApi.show(Number(id)).then(r => r.data.data),
  });

  return (
    <AdminShell>
      <PageHeader
        title="Edit Ad"
        subtitle={data?.title ?? 'Loading…'}
      />

      {isLoading ? (
        <div className="space-y-4 max-w-2xl">
          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />)}
        </div>
      ) : data ? (
        <AdForm initialData={data} />
      ) : (
        <p className="text-gray-500 font-ui">Ad not found.</p>
      )}
    </AdminShell>
  );
}
