// Asymmetric Category Block — fixed 280px height, 3 columns
import Link from 'next/link';
import Image from 'next/image';
import { articlesApi } from '@/lib/api';
import type { Article } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface Props { slug: string; label: string; labelUrdu?: string; }

async function getCategoryArticles(slug: string): Promise<Article[]> {
  try {
    const res = await articlesApi.list({ category: slug, per_page: 5 });
    return res.data.data;
  } catch { return []; }
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '';
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export default async function HomeCategoryRow({ slug, label, labelUrdu }: Props) {
  const articles = await getCategoryArticles(slug);
  if (!articles.length) return null;

  const [lead, second, ...rest] = articles;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between pb-2 border-b-[3px] border-cni-red mb-3">
        <div className="flex items-center gap-3">
          <h2 className="font-headline text-xl font-bold text-gray-900">{label}</h2>
          {labelUrdu && (
            <span className="font-headline text-base text-gray-400">{labelUrdu}</span>
          )}
        </div>
        <Link href={`/category/${slug}`}
          className="text-xs font-semibold text-cni-blue hover:text-cni-red no-underline uppercase tracking-wide flex items-center gap-1 transition-colors"
          style={{ fontFamily: 'var(--font-inter)' }}>
          More <span>→</span>
        </Link>
      </div>

      {/* Grid — fixed height so the lead image never stretches too tall */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 md:h-[280px]">

        {/* Col 1: Lead image — fills full fixed height */}
        {lead && (
          <Link href={`/article/${lead.slug}`}
            className="group relative block no-underline overflow-hidden border-r border-gray-200 h-52 md:h-full">
            <div className="relative w-full h-full bg-gray-200">
              {lead.featured_image?.url ? (
                <Image
                  src={lead.featured_image.url}
                  alt={lead.featured_image.alt ?? lead.title ?? ''}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <span className="text-gray-400 text-xs uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-inter)' }}>No image</span>
                </div>
              )}
              {/* Dark gradient at bottom for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {lead.is_breaking && (
                <span className="absolute top-2 left-2 bg-cni-red text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  Breaking
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Col 2: Lead title + sub-card */}
        {lead && (
          <div className="flex flex-col border-r border-gray-200 h-full overflow-hidden">
            {/* Lead title — takes most of the height */}
            <Link href={`/article/${lead.slug}`}
              className="group no-underline flex flex-col p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ flex: '1 1 0', minHeight: 0 }}>
              {lead.category?.name && (
                <span className="text-[10px] font-semibold text-cni-blue uppercase tracking-wide mb-1"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  {lead.category.name}
                </span>
              )}
              <h3 className="font-headline text-base font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-3 transition-colors">
                {lead.title}
              </h3>
              <div className="text-[11px] text-gray-400 mt-auto pt-2 flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-inter)' }}>
                <span>{timeAgo(lead.published_at)}</span>
                {lead.author?.display_name && (
                  <><span>·</span><span>{lead.author.display_name}</span></>
                )}
              </div>
            </Link>

            {/* Second article — compact at bottom */}
            {second && (
              <Link href={`/article/${second.slug}`}
                className="group no-underline flex gap-2.5 p-3 hover:bg-gray-50 transition-colors shrink-0">
                {second.featured_image?.url && (
                  <div className="relative w-16 h-12 shrink-0 overflow-hidden bg-gray-100">
                    <Image
                      src={second.featured_image.url}
                      alt={second.featured_image.alt ?? ''}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {second.category?.name && (
                    <span className="text-[9px] font-semibold text-cni-blue uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-inter)' }}>
                      {second.category.name}
                    </span>
                  )}
                  <h4 className="font-headline text-xs font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-2 transition-colors">
                    {second.title}
                  </h4>
                  <p className="text-gray-400 text-[10px] mt-0.5"
                    style={{ fontFamily: 'var(--font-inter)' }}>
                    {timeAgo(second.published_at)}
                  </p>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Col 3: Two cards — each takes exactly half the fixed height */}
        <div className="flex flex-col divide-y divide-gray-200 h-full overflow-hidden">
          {rest.slice(0, 2).map(article => (
            <Link key={article.id} href={`/article/${article.slug}`}
              className="group no-underline flex gap-3 p-3 hover:bg-gray-50 transition-colors flex-1 overflow-hidden">
              {/* Thumbnail */}
              <div className="relative w-24 h-full shrink-0 overflow-hidden bg-gray-100" style={{ minHeight: 60, maxHeight: 90 }}>
                {article.featured_image?.url ? (
                  <Image
                    src={article.featured_image.url}
                    alt={article.featured_image.alt ?? article.title ?? ''}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="96px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                {article.category?.name && (
                  <span className="text-[10px] font-semibold text-cni-blue uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-inter)' }}>
                    {article.category.name}
                  </span>
                )}
                <h4 className="font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red leading-snug line-clamp-2 mt-0.5 transition-colors">
                  {article.title}
                </h4>
                <p className="text-gray-400 text-[11px] mt-1"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  {timeAgo(article.published_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
