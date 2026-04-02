import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { articlesApi } from '@/lib/api';
import type { Article } from '@/types';
import ArticleCard from '@/components/article/ArticleCard';
import ArticleComments from '@/components/article/ArticleComments';
import ArticleShareBar from '@/components/article/ArticleShareBar';
import SidebarAdSlot from '@/components/layout/SidebarAdSlot';

interface Props {
  params:      { slug: string };
  searchParams:{ lang?: string };
}

async function getArticle(slug: string, lang: string): Promise<Article | null> {
  try {
    const res = await articlesApi.show(slug, lang);
    return res.data.data;
  } catch { return null; }
}

async function getRelated(categorySlug: string, currentSlug: string): Promise<Article[]> {
  try {
    const res = await articlesApi.list({ category: categorySlug, per_page: 5 });
    return (res.data.data as Article[]).filter(a => a.slug !== currentSlug).slice(0, 4);
  } catch { return []; }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const lang    = searchParams.lang ?? 'en';
  const article = await getArticle(params.slug, lang);
  if (!article) return { title: 'Article not found' };
  return {
    title:       article.seo_title ?? article.title ?? '',
    description: article.seo_description ?? article.summary ?? '',
    openGraph: {
      title:       article.title ?? '',
      description: article.summary ?? '',
      images:      article.featured_image?.url ? [{ url: article.featured_image.url }] : [],
      type:        'article',
    },
  };
}

export const revalidate = 300;

export default async function ArticlePage({ params, searchParams }: Props) {
  const lang    = searchParams.lang ?? 'en';
  const article = await getArticle(params.slug, lang);
  if (!article) notFound();

  const isRtl   = ['ur', 'pa', 'mi'].includes(lang);
  const related = article.category
    ? await getRelated(article.category.slug, article.slug)
    : [];

  const publishedDate = article.published_at ? new Date(article.published_at) : null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-start">

        {/* ── Main article ─────────────────────────────────────────────── */}
        <article>
          {/* Breadcrumb */}
          {article.category && (
            <nav className="mb-4 text-sm text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
              <Link href="/" className="hover:text-cni-blue no-underline">Home</Link>
              <span className="mx-2 text-gray-300">/</span>
              <Link href={`/category/${article.category.slug}`}
                className="hover:text-cni-blue no-underline text-cni-blue font-semibold">
                {article.category.name}
              </Link>
            </nav>
          )}

          {/* Breaking badge */}
          {article.is_breaking && (
            <span className="badge-breaking inline-block mb-3">Breaking News</span>
          )}

          {/* Headline */}
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3"
            dir={isRtl ? 'rtl' : 'ltr'}>
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl text-gray-600 mb-4 leading-relaxed"
              style={{ fontFamily: 'var(--font-source-serif)' }}
              dir={isRtl ? 'rtl' : 'ltr'}>
              {article.subtitle}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 py-3 border-y border-gray-200 mb-6">
            {article.author?.avatar_url && (
              <Image src={article.author.avatar_url} alt={article.author.display_name}
                width={36} height={36} className="rounded-full" />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900"
                style={{ fontFamily: 'var(--font-inter)' }}>
                {article.author?.display_name}
              </p>
              {article.author?.byline && (
                <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
                  {article.author.byline}
                </p>
              )}
            </div>
            {publishedDate && (
              <div className="text-right text-xs text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
                <p>{format(publishedDate, 'd MMM yyyy')}</p>
                <p>{formatDistanceToNow(publishedDate, { addSuffix: true })}</p>
              </div>
            )}
          </div>

          {/* Featured image */}
          {article.featured_image?.url && (
            <figure className="mb-6 -mx-4 sm:mx-0">
              <div className="relative aspect-video">
                <Image src={article.featured_image.url}
                  alt={article.featured_image.alt ?? article.title ?? ''}
                  fill className="object-cover" priority />
              </div>
              {article.featured_image.alt && (
                <figcaption className="text-xs text-gray-500 mt-2 px-4 sm:px-0"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  {article.featured_image.alt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Language switcher */}
          {(article.all_translations?.length ?? 0) > 1 && (
            <div className="flex items-center gap-2 mb-4 bg-gray-50 px-3 py-2">
              <span className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>Read in:</span>
              {article.all_translations?.map(t => (
                <Link key={t.language_code}
                  href={`/article/${article.slug}?lang=${t.language_code}`}
                  className={`text-xs font-semibold px-2 py-0.5 no-underline transition-colors ${
                    lang === t.language_code
                      ? 'bg-cni-blue text-white'
                      : 'text-cni-blue hover:bg-cni-blue-light'
                  }`}
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  {t.language_code.toUpperCase()}
                </Link>
              ))}
            </div>
          )}

          {/* Article body */}
          <div className={isRtl ? 'article-body-rtl' : 'article-body'}
            dir={isRtl ? 'rtl' : 'ltr'}
            dangerouslySetInnerHTML={{ __html: article.body ?? '' }} />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
              {article.tags.map(tag => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 hover:bg-cni-blue-light hover:text-cni-blue no-underline transition-colors"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share bar */}
          <ArticleShareBar article={article} />

          {/* Author bio */}
          {article.author?.bio_short && (
            <div className="mt-8 p-4 bg-gray-50 border-l-4 border-cni-blue flex gap-4">
              {article.author.avatar_url && (
                <Image src={article.author.avatar_url} alt={article.author.display_name}
                  width={56} height={56} className="rounded-full shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm text-gray-900"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  {article.author.display_name}
                </p>
                {article.author.byline && (
                  <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'var(--font-inter)' }}>
                    {article.author.byline}
                  </p>
                )}
                <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-source-serif)' }}>
                  {article.author.bio_short}
                </p>
              </div>
            </div>
          )}

          {/* Comments */}
          {article.allow_comments && <ArticleComments articleId={article.id} />}
        </article>

        {/* ── Sticky sidebar ────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-[120px] space-y-6">

          {/* Related articles */}
          {related.length > 0 && (
            <div className="border border-gray-200">
              <div className="px-4 py-2.5 border-b-[3px] border-cni-red bg-gray-50">
                <h3 className="font-headline text-base font-bold text-gray-900">Related Articles</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {related.map(a => (
                  <div key={a.id} className="px-4">
                    <ArticleCard article={a} variant="compact" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back to category */}
          {article.category && (
            <div className="border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-2" style={{ fontFamily: 'var(--font-inter)' }}>
                More from
              </p>
              <Link href={`/category/${article.category.slug}`}
                className="font-headline text-lg font-bold text-cni-blue hover:text-cni-red no-underline transition-colors block">
                {article.category.name} →
              </Link>
            </div>
          )}

          {/* Ad slot — 300×250 */}
          <SidebarAdSlot />
        </aside>
      </div>
    </div>
  );
}
