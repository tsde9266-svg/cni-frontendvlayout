import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articlesApi } from '@/lib/api';
import type { Article } from '@/types';
import ArticleCard from '@/components/article/ArticleCard';

interface Props {
  params:      { slug: string };
  searchParams:{ lang?: string; page?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title:       `#${params.slug}`,
    description: `Articles tagged with #${params.slug} on CNI News Network`,
  };
}

export const revalidate = 120;

export default async function TagPage({ params, searchParams }: Props) {
  const page = parseInt(searchParams.page ?? '1', 10);

  let articles: Article[] = [];
  let total = 0;

  try {
    const res = await articlesApi.list({ tag: params.slug, page, per_page: 12 });
    articles  = res.data.data;
    total     = res.data.meta.total;
  } catch {
    notFound();
  }

  return (
    <div className="max-w-site mx-auto px-4 py-8">
      <div className="section-divider mb-6">
        <h1 className="font-headline text-2xl font-bold text-gray-900">
          #{params.slug}
        </h1>
        <p className="text-sm text-gray-500 font-ui mt-1">{total} articles</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500 font-ui py-12 text-center">No articles found for this tag.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(a => (
            <ArticleCard key={a.id} article={a} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}
