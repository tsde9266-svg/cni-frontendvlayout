'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader, Button, StatusBadge } from '@/components/admin/ui/AdminUI';
import ArticleForm from '@/components/admin/articles/ArticleForm';
import { adminArticlesApi } from '@/lib/adminApi';
import { EyeIcon } from '@/components/admin/ui/Icons';
import Link from 'next/link';

interface Props { params: { id: string } }

export default function EditArticlePage({ params }: Props) {
  const { id } = params;
  const articleId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-article', articleId],
    queryFn:  () => adminArticlesApi.show(articleId).then(r => r.data.data),
    enabled:  !isNaN(articleId),
  });

  if (isLoading) {
    return (
      <AdminShell breadcrumbs={[{ label: 'Articles', href: '/admin/articles' }, { label: 'Loading…' }]}>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />)}
        </div>
      </AdminShell>
    );
  }

  const title = data?.title ?? `Article #${articleId}`;

  return (
    <AdminShell
      breadcrumbs={[
        { label: 'Articles', href: '/admin/articles' },
        { label: title },
      ]}
      topActions={
        <div className="flex items-center gap-2">
          {data?.status && <StatusBadge status={data.status} />}
          {data?.slug && (
            <Link href={`/article/${data.slug}`} target="_blank">
              <Button variant="ghost" size="sm" icon={<EyeIcon className="w-3.5 h-3.5" />}>
                View live
              </Button>
            </Link>
          )}
        </div>
      }
    >
      <PageHeader
        title={title}
        subtitle={`Last updated ${data?.updated_at ? new Date(data.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}`}
      />
      <ArticleForm articleId={articleId} />
    </AdminShell>
  );
}
