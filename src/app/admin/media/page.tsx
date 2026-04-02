import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader, Card } from '@/components/admin/ui/AdminUI';

export const metadata = { title: 'Media Library' };

export default function MediaPage() {
  return (
    <AdminShell breadcrumbs={[{ label: 'Media' }]}>
      <PageHeader title="Media library" subtitle="Upload and manage images and files" />
      <Card>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cni-blue-light flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-cni-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path strokeLinecap="round" d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <h3 className="font-ui font-semibold text-gray-700 text-lg mb-2">Media library</h3>
          <p className="text-sm font-ui text-gray-400 max-w-sm">
            Full media management with upload, cropping and alt-text editing will be available in the next update.
          </p>
        </div>
      </Card>
    </AdminShell>
  );
}
