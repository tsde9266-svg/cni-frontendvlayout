'use client';

import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader } from '@/components/admin/ui/AdminUI';
import AdForm from '@/components/admin/ads/AdForm';

export default function NewAdPage() {
  return (
    <AdminShell>
      <PageHeader
        title="New Display Ad"
        subtitle="Upload an image or video, set the placement and campaign timeline."
      />
      <AdForm />
    </AdminShell>
  );
}
