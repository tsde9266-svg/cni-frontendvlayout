// Hero Grid: 70% hero post left + 30% featured stories right
import Link from 'next/link';
import Image from 'next/image';
import { serverFetchArticles } from '@/lib/api';
import type { Article } from '@/types';
import { formatDistanceToNow } from 'date-fns';

async function getFeatured(): Promise<Article[]> {
  try {
    const res = await serverFetchArticles({ featured: true, per_page: 7 });
    return res.data as Article[];
  } catch { return []; }
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export default async function HomeFeatured() {
  const articles = await getFeatured();
  if (!articles.length) return null;

  const [hero, ...featured] = articles;
  const rightCards = featured.slice(0, 4);

  return (
    <section className="mb-0">
      {/* Outer wrapper — gap-4 gives breathing room between hero and sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-4 md:h-[500px]">

        {/* ── LEFT: Hero Post ─────────────────────────────────────────── */}
        {hero && (
          <Link
            href={`/article/${hero.slug}`}
            className="group relative block no-underline overflow-hidden h-64 md:h-full"
          >
            <div className="relative w-full h-full bg-gray-900">
              {hero.featured_image?.url ? (
                <Image
                  src={hero.featured_image.url}
                  alt={hero.featured_image.alt ?? hero.title ?? ''}
                  fill priority
                  className="object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 70vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cni-blue to-cni-blue-dark" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  {hero.is_breaking && (
                    <span className="bg-cni-red text-white text-[11px] font-bold uppercase tracking-widest px-2.5 py-1"
                      style={{ fontFamily: 'var(--font-inter)' }}>
                      Breaking
                    </span>
                  )}
                  {hero.category?.name && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1"
                      style={{ fontFamily: 'var(--font-inter)' }}>
                      {hero.category.name}
                    </span>
                  )}
                </div>
                <h1 className="font-headline text-2xl md:text-4xl font-bold text-white leading-tight mb-2">
                  {hero.title}
                </h1>
                {hero.summary && (
                  <p className="text-white/75 text-sm md:text-base line-clamp-2 hidden md:block"
                    style={{ fontFamily: 'var(--font-source-serif)' }}>
                    {hero.summary}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-white/60 text-xs"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  {hero.author?.display_name && <span>{hero.author.display_name}</span>}
                  {hero.author?.display_name && hero.published_at && <span>·</span>}
                  {hero.published_at && <span>{timeAgo(hero.published_at)}</span>}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── RIGHT: Featured Stories ──────────────────────────────────── */}
        <div className="flex flex-col h-full bg-white border border-gray-200 overflow-hidden">

          {/* Header label */}
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500"
              style={{ fontFamily: 'var(--font-inter)' }}>
              Featured Stories
            </span>
          </div>

          {/* Cards — flex-1 so they share height equally */}
          <div className="flex flex-col flex-1 divide-y divide-gray-200 overflow-hidden">
            {rightCards.map((article, idx) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group flex gap-3 p-3 no-underline hover:bg-gray-50 transition-colors flex-1 items-center overflow-hidden"
              >
                {/* Thumbnail — fixed square */}
                <div className="relative w-20 h-16 shrink-0 overflow-hidden bg-gray-100">
                  {article.featured_image?.url ? (
                    <Image
                      src={article.featured_image.url}
                      alt={article.featured_image.alt ?? article.title ?? ''}
                      fill
                      priority={idx === 0}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="80px"
                      unoptimized={false}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {/* Category + Breaking row */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {article.is_breaking && (
                      <span className="bg-cni-red text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 shrink-0"
                        style={{ fontFamily: 'var(--font-inter)' }}>
                        Breaking
                      </span>
                    )}
                    {article.category?.name && (
                      <span className="text-[10px] font-semibold text-cni-blue uppercase tracking-wide truncate"
                        style={{ fontFamily: 'var(--font-inter)' }}>
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  {/* Title */}
                  <h3 className="font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-2 transition-colors">
                    {article.title}
                  </h3>
                  {/* Time */}
                  <p className="text-gray-400 text-[11px] mt-1" style={{ fontFamily: 'var(--font-inter)' }}>
                    {timeAgo(article.published_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
