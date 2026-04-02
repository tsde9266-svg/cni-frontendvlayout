// Latest News feed — horizontal cards with image left, text right
// Used in the 2/3 main content column of the bottom section
import Link from 'next/link';
import Image from 'next/image';
import { articlesApi } from '@/lib/api';
import type { Article } from '@/types';
import { formatDistanceToNow } from 'date-fns';

async function getLatest(): Promise<Article[]> {
  try {
    const res = await articlesApi.list({ per_page: 8, sort: 'published_at' });
    return res.data.data;
  } catch { return []; }
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export default async function HomeLatestFeed() {
  const articles = await getLatest();
  if (!articles.length) return null;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between pb-2 border-b-[3px] border-cni-red mb-4">
        <h2 className="font-headline text-xl font-bold text-gray-900">Latest News</h2>
        <Link href="/articles"
          className="text-xs font-ui font-semibold text-cni-blue hover:text-cni-red no-underline uppercase tracking-wide flex items-center gap-1 transition-colors">
          All News <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Horizontal card list */}
      <div className="divide-y divide-gray-100">
        {articles.map(article => (
          <Link key={article.id} href={`/article/${article.slug}`}
            className="group no-underline flex gap-4 py-4 hover:bg-gray-50 transition-colors -mx-2 px-2">

            {/* Image */}
            {article.featured_image?.url && (
              <div className="relative w-28 h-20 shrink-0 overflow-hidden bg-gray-100">
                <Image
                  src={article.featured_image.url}
                  alt={article.featured_image.alt ?? ''}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="112px"
                />
              </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {article.is_breaking && (
                  <span className="bg-cni-red text-white text-[9px] font-ui font-bold uppercase tracking-widest px-1.5 py-0.5">
                    Breaking
                  </span>
                )}
                {article.category?.name && (
                  <span className="text-[10px] font-ui font-semibold text-cni-blue uppercase tracking-wide">
                    {article.category.name}
                  </span>
                )}
              </div>
              <h3 className="font-headline text-sm md:text-base font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-2 transition-colors">
                {article.title}
              </h3>
              {article.summary && (
                <p className="text-gray-500 text-xs font-body line-clamp-1 mt-1 hidden md:block">
                  {article.summary}
                </p>
              )}
              <div className="text-[11px] font-ui text-gray-400 mt-1.5 flex items-center gap-1.5">
                <span>{timeAgo(article.published_at)}</span>
                {article.author?.display_name && (
                  <>
                    <span>·</span>
                    <span>{article.author.display_name}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
