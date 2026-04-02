'use client';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import type { Article } from '@/types';
import clsx from 'clsx';
// import { clsx } from 'clsx';

interface Props {
  article:  Article;
  variant?: 'hero' | 'featured' | 'default' | 'compact' | 'horizontal' | 'list';
  dir?:     'ltr' | 'rtl';
  priority? : boolean;
}

export default function ArticleCard({ article, variant = 'default', dir = 'ltr', priority = false }: Props) {
  const isRtl = dir === 'rtl';
  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : '';
  const img = article.featured_image?.url ||  'https://images.pexels.com/photos/34442261/pexels-photo-34442261.jpeg';;
  const cat = article.category?.name;

  // ── Hero ──────────────────────────────────────────────────────────────
  if (variant === 'hero') {
    return (
      <Link href={`/article/${article.slug}`} className="group relative block no-underline overflow-hidden rounded-none" dir={dir}>
        <div className="relative h-[420px] md:h-[520px] w-full bg-gray-900">
          {img ? (
            <Image src={img} alt={article.featured_image?.alt ?? article.title ?? ''} fill
              className="object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-500"
              priority={priority} sizes="100vw" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cni-blue to-cni-blue-dark" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              {article.is_breaking && (
                <span className="bg-cni-red text-white text-[11px] font-ui font-bold uppercase tracking-widest px-2.5 py-1 animate-pulse-red">
                  Breaking
                </span>
              )}
              {cat && (
                <span className="bg-white/20 text-white text-[11px] font-ui font-semibold uppercase tracking-wide px-2.5 py-1 backdrop-blur-sm">
                  {cat}
                </span>
              )}
            </div>
            <h1 className={clsx(
              'font-headline text-2xl md:text-4xl font-bold text-white leading-tight mb-2 group-hover:text-gray-100 transition-colors',
              isRtl && 'text-right'
            )}>
              {article.title}
            </h1>
            {article.summary && (
              <p className={clsx('text-white/80 text-base font-body line-clamp-2 hidden md:block', isRtl && 'text-right')}>
                {article.summary}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3 text-white/60 text-xs font-ui">
              {article.author?.display_name && <span>{article.author.display_name}</span>}
              {article.author?.display_name && timeAgo && <span>·</span>}
              {timeAgo && <span>{timeAgo}</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Featured (medium card with overlay) ───────────────────────────────
  if (variant === 'featured') {
    return (
      <Link href={`/article/${article.slug}`} className="group relative block no-underline overflow-hidden" dir={dir}>
        <div className="relative h-56 md:h-72 bg-gray-800">
          {img ? (
            <Image src={img} alt={article.featured_image?.alt ?? article.title ?? ''} fill
              className="object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
              priority={priority} sizes="(max-width: 768px) 100vw, 50vw" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cni-blue to-cni-blue-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              {article.is_breaking && (
                <span className="bg-cni-red text-white text-[10px] font-ui font-bold uppercase tracking-wider px-2 py-0.5">Breaking</span>
              )}
              {cat && <span className="text-white/70 text-[10px] font-ui uppercase tracking-wide">{cat}</span>}
            </div>
            <h3 className={clsx(
              'font-headline text-base md:text-lg font-bold text-white leading-snug line-clamp-3 group-hover:text-gray-100',
              isRtl && 'text-right'
            )}>
              {article.title}
            </h3>
            <p className="text-white/60 text-xs font-ui mt-1.5">{timeAgo}</p>
          </div>
        </div>
      </Link>
    );
  }

  // ── Default (vertical card with image top) ────────────────────────────
  if (variant === 'default') {
    return (
      <Link href={`/article/${article.slug}`} className="group no-underline flex flex-col" dir={dir}>
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          {img ? (
            <Image src={img} alt={article.featured_image?.alt ?? article.title ?? ''} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cni-blue-light to-gray-100">
              <div className="w-10 h-10 border-l-4 border-cni-red" />
            </div>
          )}
          {article.is_breaking && (
            <span className="absolute top-2 left-2 bg-cni-red text-white text-[10px] font-ui font-bold uppercase tracking-wider px-1.5 py-0.5">
              Breaking
            </span>
          )}
        </div>
        <div className="flex-1 pt-3 pb-1">
          {cat && <span className="text-[10px] font-ui font-semibold text-cni-blue uppercase tracking-wide">{cat}</span>}
          <h3 className={clsx(
            'font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red leading-snug mt-1 line-clamp-3 transition-colors',
            isRtl && 'text-right'
          )}>
            {article.title}
          </h3>
          <p className="text-gray-400 text-[11px] font-ui mt-1.5">{timeAgo}</p>
        </div>
      </Link>
    );
  }

  // ── Compact (tiny list item) ──────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Link href={`/article/${article.slug}`} className="group no-underline flex gap-3 py-3 border-b border-gray-100 last:border-0" dir={dir}>
        {img && (
          <div className="relative w-20 h-16 shrink-0 overflow-hidden bg-gray-100">
            <Image src={img} alt={article.featured_image?.alt ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {article.is_breaking && <span className="text-[9px] bg-cni-red text-white font-ui font-bold uppercase tracking-widest px-1.5 py-0.5 mr-1">Breaking</span>}
          <h4 className={clsx('font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red line-clamp-2 leading-snug transition-colors', isRtl && 'text-right')}>
            {article.title}
          </h4>
          <p className="text-gray-400 text-[11px] font-ui mt-0.5">{timeAgo}</p>
        </div>
      </Link>
    );
  }

  // ── Horizontal ────────────────────────────────────────────────────────
  if (variant === 'horizontal') {
    return (
      <Link href={`/article/${article.slug}`} className="group no-underline flex gap-3 md:gap-4" dir={dir}>
        {img && (
          <div className="relative w-28 md:w-36 h-20 md:h-24 shrink-0 overflow-hidden bg-gray-100">
            <Image src={img} alt={article.featured_image?.alt ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="144px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {cat && <span className="text-[10px] font-ui font-semibold text-cni-blue uppercase tracking-wide">{cat}</span>}
          <h3 className={clsx('font-headline text-sm md:text-base font-bold text-gray-900 group-hover:text-cni-red mt-0.5 line-clamp-2 leading-snug transition-colors', isRtl && 'text-right')}>
            {article.title}
          </h3>
          <p className="text-gray-400 text-[11px] font-ui mt-1">{article.author?.display_name} · {timeAgo}</p>
        </div>
      </Link>
    );
  }

  // ── List (numbered/editorial) ─────────────────────────────────────────
  return (
    <Link href={`/article/${article.slug}`} className="group no-underline flex gap-3 py-2.5 border-b border-gray-100 last:border-0" dir={dir}>
      <div className="flex-1 min-w-0">
        {cat && <span className="text-[10px] font-ui font-semibold text-cni-blue uppercase tracking-wide">{cat}</span>}
        <h4 className={clsx('font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red line-clamp-2 leading-snug mt-0.5 transition-colors', isRtl && 'text-right')}>
          {article.title}
        </h4>
        <p className="text-gray-400 text-[11px] font-ui mt-0.5">{timeAgo}</p>
      </div>
      {img && (
        <div className="relative w-16 h-14 shrink-0 overflow-hidden bg-gray-100">
          <Image src={img} alt="" fill className="object-cover" sizes="64px" />
        </div>
      )}
    </Link>
  );
}
