import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader } from '@/components/admin/ui/AdminUI';
import ArticleForm from '@/components/admin/articles/ArticleForm';

export const metadata = { title: 'New Article' };

export default function NewArticlePage() {
  return (
    <AdminShell breadcrumbs={[{ label: 'Articles', href: '/admin/articles' }, { label: 'New article' }]}>
      <PageHeader title="New article" subtitle="Create and publish a new article" />
      <ArticleForm />
    </AdminShell>
  );
}
