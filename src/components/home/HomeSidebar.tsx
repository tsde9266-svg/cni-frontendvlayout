// Sticky Sidebar: Editor's Picks list + Newsletter Signup widget + Trending + Social Feed
// Matches wireframe "STICKY SIDEBAR WIDGETS" spec
import Link from 'next/link';
import { Suspense } from 'react';
import { serverFetchArticles } from '@/lib/api';
import type { Article } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import HomeSocialFeed from '@/components/home/HomeSocialFeed';

async function getEditorsPicks(): Promise<Article[]> {
  try {
    const res = await serverFetchArticles({ featured: true, sort: 'view_count', per_page: 6 });
    return res.data as Article[];
  } catch { return []; }
}

async function getTrending(): Promise<Article[]> {
  try {
    const res = await serverFetchArticles({ sort: 'view_count', per_page: 5 });
    return res.data as Article[];
  } catch { return []; }
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export default async function HomeSidebar() {
  const [editorsPicks, trending] = await Promise.all([getEditorsPicks(), getTrending()]);

  return (
    <div className="space-y-0">

      {/* Editor's Picks */}
      {editorsPicks.length > 0 && (
        <div className="border border-gray-200 bg-white mb-4">
          <div className="px-4 py-2.5 border-b-[3px] border-cni-red bg-gray-50">
            <h3 className="font-headline text-base font-bold text-gray-900">Editor&apos;s Picks</h3>
          </div>
          <ol className="divide-y divide-gray-100">
            {editorsPicks.slice(0, 5).map((article, i) => (
              <li key={article.id}>
                <Link href={`/article/${article.slug}`}
                  className="group no-underline flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <span className="font-headline text-2xl font-bold text-gray-200 leading-none w-5 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-2 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-gray-400 text-[10px] font-ui mt-0.5">{timeAgo(article.published_at)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Newsletter Signup Widget */}
      <div className="border border-gray-200 bg-white mb-4">
        <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
          <h3 className="font-headline text-base font-bold text-gray-900">Newsletter Signup</h3>
        </div>
        <div className="p-4">
          <p className="text-sm font-body text-gray-600 mb-3 leading-relaxed">
            Get the latest news delivered to your inbox. No spam, ever.
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full border border-gray-300 px-3 py-2 text-sm font-ui
                         focus:outline-none focus:border-cni-blue"
            />
            <button
              className="w-full bg-cni-blue text-white font-ui font-semibold text-sm py-2
                         hover:bg-cni-blue-dark transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="border border-gray-200 bg-white mb-4">
          <div className="px-4 py-2.5 border-b-[3px] border-cni-red bg-gray-50 flex items-center justify-between">
            <h3 className="font-headline text-base font-bold text-gray-900">Trending</h3>
            <svg className="w-4 h-4 text-cni-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <ol className="divide-y divide-gray-100">
            {trending.map((article, i) => (
              <li key={article.id}>
                <Link href={`/article/${article.slug}`}
                  className="group no-underline flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <span className="font-ui text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}.</span>
                  <span className="font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red line-clamp-2 leading-snug transition-colors flex-1">
                    {article.title}
                  </span>
                  <span className="w-8 h-0.5 bg-gray-200 shrink-0" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Social Feed */}
      <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse border border-gray-200" />}>
        <HomeSocialFeed />
      </Suspense>
    </div>
  );
}
