// HomeCategoryRow — BBC / Sky News inspired dense category section
// Layout: 1 large lead (left) + 2×2 image grid (right) + 2-article strip below
// Shows 7 articles total: lead, 4 visual cards, 2 compact strip articles
import Link from 'next/link';
import Image from 'next/image';
import { serverFetchArticles } from '@/lib/api';
import type { Article } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface Props { slug: string; label: string; labelUrdu?: string; }

async function getCategoryArticles(slug: string): Promise<Article[]> {
  try {
    const res = await serverFetchArticles({ category: slug, per_page: 7 });
    return res.data as Article[];
  } catch { return []; }
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

// Small image card used in the 2×2 grid
function GridCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className="group no-underline flex flex-col hover:bg-white transition-colors"
    >
      {/* 16:9 thumbnail */}
      <div className="relative w-full aspect-video bg-gray-200 overflow-hidden shrink-0">
        {article.featured_image?.url ? (
          <Image
            src={article.featured_image.url}
            alt={article.featured_image.alt ?? article.title ?? ''}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <span className="text-white/50 text-xs uppercase tracking-widest font-ui">No image</span>
          </div>
        )}
        {article.is_breaking && (
          <span className="absolute top-1.5 left-1.5 bg-cni-red text-white text-[9px] font-ui font-bold uppercase tracking-wider px-1.5 py-0.5">
            Breaking
          </span>
        )}
      </div>
      {/* Text */}
      <div className="p-2.5 flex-1 flex flex-col">
        {article.category?.name && (
          <span className="text-[9px] font-ui font-bold text-cni-blue uppercase tracking-wider mb-1">
            {article.category.name}
          </span>
        )}
        <h4 className="font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-3 flex-1 transition-colors">
          {article.title}
        </h4>
        <p className="text-[10px] font-ui text-gray-400 mt-1.5">{timeAgo(article.published_at)}</p>
      </div>
    </Link>
  );
}

// Compact strip article — no image, just title + time
function StripCard({ article, border }: { article: Article; border?: boolean }) {
  return (
    <Link
      href={`/article/${article.slug}`}
      className={`group no-underline flex items-start gap-3 py-3 px-4 hover:bg-white transition-colors ${border ? 'border-l border-gray-200' : ''}`}
    >
      <div className="w-1 h-full shrink-0 bg-cni-red self-stretch hidden sm:block" />
      <div className="flex-1 min-w-0">
        {article.category?.name && (
          <span className="text-[9px] font-ui font-bold text-cni-blue uppercase tracking-wider">
            {article.category.name}
          </span>
        )}
        <h4 className="font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-2 transition-colors mt-0.5">
          {article.title}
        </h4>
        <p className="text-[10px] font-ui text-gray-400 mt-1">{timeAgo(article.published_at)}</p>
      </div>
      {article.featured_image?.url && (
        <div className="relative w-16 h-12 shrink-0 overflow-hidden bg-gray-100 hidden sm:block">
          <Image
            src={article.featured_image.url}
            alt={article.featured_image.alt ?? ''}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="64px"
          />
        </div>
      )}
    </Link>
  );
}

export default async function HomeCategoryRow({ slug, label, labelUrdu }: Props) {
  const articles = await getCategoryArticles(slug);
  if (!articles.length) return null;

  const [lead, ...rest] = articles;
  const gridCards  = rest.slice(0, 4);
  const stripCards = rest.slice(4, 6);

  return (
    <section className="bg-gray-50 border border-gray-200 overflow-hidden">

      {/* ── Section header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          {/* Left accent bar */}
          <div className="w-1 h-6 bg-cni-red shrink-0" />
          <h2 className="font-headline text-lg font-bold text-gray-900 tracking-tight">{label}</h2>
          {labelUrdu && (
            <span className="font-headline text-sm text-gray-400 hidden sm:inline">{labelUrdu}</span>
          )}
        </div>
        <Link
          href={`/category/${slug}`}
          className="text-xs font-ui font-semibold text-cni-blue hover:text-cni-red no-underline uppercase tracking-wide flex items-center gap-1 transition-colors group"
        >
          See all <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
        </Link>
      </div>

      {/* ── Main grid: lead (left) + 2×2 cards (right) ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]">

        {/* Lead article — tall image with text overlay */}
        {lead && (
          <Link
            href={`/article/${lead.slug}`}
            className="group relative block no-underline overflow-hidden h-56 md:h-auto md:min-h-[340px] border-b md:border-b-0 md:border-r border-gray-200"
          >
            <div className="relative w-full h-full min-h-[340px] bg-gray-900">
              {lead.featured_image?.url ? (
                <Image
                  src={lead.featured_image.url}
                  alt={lead.featured_image.alt ?? lead.title ?? ''}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cni-blue to-cni-blue-dark" />
              )}
              {/* Deep gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {lead.is_breaking && (
                  <span className="bg-cni-red text-white text-[10px] font-ui font-bold uppercase tracking-wider px-2 py-0.5">
                    Breaking
                  </span>
                )}
                {lead.category?.name && (
                  <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-ui font-semibold uppercase tracking-wide px-2 py-0.5">
                    {lead.category.name}
                  </span>
                )}
              </div>

              {/* Text at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-headline text-xl md:text-2xl font-bold text-white leading-snug mb-2 group-hover:text-white/90 transition-colors">
                  {lead.title}
                </h3>
                {lead.summary && (
                  <p className="text-white/70 text-sm font-body line-clamp-2 mb-2 hidden md:block">
                    {lead.summary}
                  </p>
                )}
                <div className="flex items-center gap-2 text-white/55 text-[11px] font-ui">
                  {lead.author?.display_name && <span>{lead.author.display_name}</span>}
                  {lead.author?.display_name && <span>·</span>}
                  <span>{timeAgo(lead.published_at)}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* 2×2 card grid */}
        {gridCards.length > 0 && (
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-200">
            {gridCards.map(article => (
              <GridCard key={article.id} article={article} />
            ))}
            {/* Fill empty slots so grid is always 2×2 */}
            {Array.from({ length: Math.max(0, 4 - gridCards.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-100" />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom strip: 2 compact articles ────────────────────────────── */}
      {stripCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-gray-200 bg-white divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          {stripCards.map(article => (
            <StripCard key={article.id} article={article} />
          ))}
        </div>
      )}

    </section>
  );
}
