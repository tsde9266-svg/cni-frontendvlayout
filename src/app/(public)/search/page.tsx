'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '@/lib/api';
import ArticleCard from '@/components/article/ArticleCard';
import type { Article } from '@/types';

function SearchPage() {
  const searchParams = useSearchParams();
  const [q, setQ]    = useState(searchParams.get('q') ?? '');

  const { data, isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn:  () => articlesApi.search(q).then(r => r.data),
    enabled:  q.trim().length >= 2,
  });

  const articles: Article[] = data?.data ?? [];

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">

      {/* Header */}
      <div className="pb-2 border-b-[3px] border-cni-red mb-6">
        <h1 className="font-headline text-2xl font-bold text-gray-900">
          {q ? `Search results for "${q}"` : 'Search CNI News'}
        </h1>
      </div>

      {/* Search input */}
      <form
        onSubmit={e => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setQ(fd.get('q') as string ?? '');
        }}
        className="flex gap-2 mb-8"
      >
        <input name="q" defaultValue={q} placeholder="Search CNI News…"
          className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-cni-blue"
          style={{ fontFamily: 'var(--font-inter)' }} />
        <button type="submit" className="btn-primary text-sm px-6">Search</button>
      </form>

      {/* Loading skeleton */}
      {isFetching && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* No results */}
      {!isFetching && articles.length === 0 && q.length >= 2 && (
        <p className="text-gray-500 text-center py-12" style={{ fontFamily: 'var(--font-inter)' }}>
          No results found for &ldquo;{q}&rdquo;. Try different keywords.
        </p>
      )}

      {/* Results */}
      {!isFetching && articles.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'var(--font-inter)' }}>
            {data?.meta?.total ?? articles.length} results
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map(a => <ArticleCard key={a.id} article={a} variant="default" />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPageWrapper() { return <Suspense><SearchPage /></Suspense>; }
