// Hero Grid: 65% hero post left + 35% featured stories right
// Featured panel redesigned as a 2×2 card grid — larger images, BBC/Sky style
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

function FeaturedCard({ article, priority }: { article: Article; priority?: boolean }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group relative flex flex-col no-underline overflow-hidden bg-white hover:bg-gray-50 transition-colors border-gray-200"
    >
      {/* Image — 16:9, fills available width */}
      <div className="relative w-full aspect-video bg-gray-200 overflow-hidden shrink-0">
        {article.featured_image?.url ? (
          <Image
            src={article.featured_image.url}
            alt={article.featured_image.alt ?? article.title ?? ''}
            fill
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 18vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
        )}
        {article.is_breaking && (
          <span className="absolute top-1.5 left-1.5 bg-cni-red text-white text-[9px] font-ui font-bold uppercase tracking-wider px-1.5 py-0.5 z-10">
            Breaking
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 flex flex-col px-2.5 py-2">
        {article.category?.name && (
          <span className="text-[9px] font-ui font-bold text-cni-blue uppercase tracking-wider mb-0.5">
            {article.category.name}
          </span>
        )}
        <h3 className="font-headline text-xs font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-2 transition-colors flex-1">
          {article.title}
        </h3>
        <p className="text-[10px] font-ui text-gray-400 mt-1">{timeAgo(article.published_at)}</p>
      </div>
    </Link>
  );
}

export default async function HomeFeatured() {
  const articles = await getFeatured();
  if (!articles.length) {
    // API failed or returned nothing — show skeleton so the layout doesn't shift
    return (
      <section className="mb-0">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,13fr)_minmax(0,7fr)] gap-0 border border-gray-200 md:min-h-[520px]">
          <div className="bg-gray-200 animate-pulse h-64 md:h-full min-h-[380px]" />
          <div className="flex flex-col bg-gray-50">
            <div className="px-3 py-2.5 border-b border-gray-200 bg-white shrink-0">
              <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-2 flex-1 divide-x divide-y divide-gray-200">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse aspect-video" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const [hero, ...featured] = articles;
  const gridCards  = featured.slice(0, 4);
  const extraCards = featured.slice(4, 6); // shown in a strip below on mobile / hidden on desktop

  return (
    <section className="mb-0">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,13fr)_minmax(0,7fr)] gap-0 border border-gray-200 md:min-h-[520px]">

        {/* ── LEFT: Hero Post ─────────────────────────────────────────── */}
        {hero && (
          <Link
            href={`/article/${hero.slug}`}
            className="group relative block no-underline overflow-hidden h-64 md:h-full border-b md:border-b-0 md:border-r border-gray-200"
          >
            <div className="relative w-full h-full min-h-[380px] bg-gray-900">
              {hero.featured_image?.url ? (
                <Image
                  src={hero.featured_image.url}
                  alt={hero.featured_image.alt ?? hero.title ?? ''}
                  fill priority
                  className="object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 65vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cni-blue to-cni-blue-dark" />
              )}
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  {hero.is_breaking && (
                    <span className="bg-cni-red text-white text-[11px] font-ui font-bold uppercase tracking-widest px-2.5 py-1">
                      Breaking
                    </span>
                  )}
                  {hero.category?.name && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-ui font-semibold uppercase tracking-wide px-2.5 py-1">
                      {hero.category.name}
                    </span>
                  )}
                </div>
                <h1 className="font-headline text-2xl md:text-[2.1rem] font-bold text-white leading-tight mb-2">
                  {hero.title}
                </h1>
                {hero.summary && (
                  <p className="text-white/75 text-sm md:text-base line-clamp-2 hidden md:block font-body">
                    {hero.summary}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-white/60 text-xs font-ui">
                  {hero.author?.display_name && <span>{hero.author.display_name}</span>}
                  {hero.author?.display_name && hero.published_at && <span>·</span>}
                  {hero.published_at && <span>{timeAgo(hero.published_at)}</span>}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── RIGHT: Featured Stories — 2×2 card grid ─────────────────── */}
        <div className="flex flex-col bg-gray-50">

          {/* Header */}
          <div className="px-3 py-2.5 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-4 bg-cni-red" />
              <span className="text-[11px] font-ui font-bold uppercase tracking-widest text-gray-600">
                Featured Stories
              </span>
            </div>
          </div>

          {/* 2×2 grid */}
          <div className="grid grid-cols-2 flex-1 divide-x divide-y divide-gray-200">
            {gridCards.map((article, idx) => (
              <FeaturedCard key={article.id} article={article} priority={idx < 2} />
            ))}
            {/* Placeholders if fewer than 4 articles */}
            {Array.from({ length: Math.max(0, 4 - gridCards.length) }).map((_, i) => (
              <div key={`ph-${i}`} className="bg-gray-100" />
            ))}
          </div>
        </div>

      </div>

      {/* Extra articles below on mobile (hidden on md+) */}
      {extraCards.length > 0 && (
        <div className="md:hidden grid grid-cols-2 gap-0 border-l border-r border-b border-gray-200 divide-x divide-gray-200">
          {extraCards.map(article => (
            <FeaturedCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
