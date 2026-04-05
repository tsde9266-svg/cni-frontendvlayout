import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Category, Article, ApiPagination } from '@/types';
import ArticleCard from '@/components/article/ArticleCard';
import CategoryPagination from '@/components/ui/CategoryPagination';
import SidebarAdSlot from '@/components/layout/SidebarAdSlot';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface Props {
  params:      { slug: string };
  searchParams:{ lang?: string; page?: string };
}

async function getCategory(slug: string, lang: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API}/api/v1/categories/${encodeURIComponent(slug)}?lang=${lang}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()).data ?? null;
  } catch { return null; }
}

async function getArticles(slug: string, page: number): Promise<{ data: Article[]; meta: ApiPagination }> {
  const empty = { data: [], meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 } };
  try {
    const res = await fetch(
      `${API}/api/v1/articles?category=${encodeURIComponent(slug)}&page=${page}&per_page=12`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return empty;
    const json = await res.json();
    return { data: json.data ?? [], meta: json.meta ?? empty.meta };
  } catch { return empty; }
}

async function getTrending(slug: string): Promise<Article[]> {
  try {
    const res = await fetch(
      `${API}/api/v1/articles?category=${encodeURIComponent(slug)}&sort=view_count&per_page=5`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch { return []; }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const lang = searchParams.lang ?? 'en';
  const cat  = await getCategory(params.slug, lang);
  if (!cat) return { title: 'Category not found' };
  return { title: cat.name, description: cat.description ?? undefined };
}

export const revalidate = 120;

export default async function CategoryPage({ params, searchParams }: Props) {
  const lang     = searchParams.lang ?? 'en';
  const page     = parseInt(searchParams.page ?? '1', 10);

  const [category, { data: articles, meta }, trending] = await Promise.all([
    getCategory(params.slug, lang),
    getArticles(params.slug, page),
    getTrending(params.slug),
  ]);

  if (!category) notFound();

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">

      {/* Category header */}
      <div className="flex items-center justify-between pb-2 border-b-[3px] border-cni-red mb-6">
        <div>
          <h1 className="font-headline text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: 'var(--font-source-serif)' }}>
              {category.description}
            </p>
          )}
        </div>
        <span className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-inter)' }}>
          {meta.total} articles
        </span>
      </div>

      {/* ── 2-Column layout: articles + sidebar ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">

        {/* ── LEFT: Article grid ─────────────────────────────────────────── */}
        <main>
          {/* Sub-categories */}
          {category.children && category.children.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category.children.map(c => (
                <Link key={c.id} href={`/category/${c.slug}`}
                  className="badge-category no-underline transition-colors hover:bg-cni-blue hover:text-white">
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {articles.length === 0 ? (
            <p className="text-gray-500 py-12 text-center" style={{ fontFamily: 'var(--font-inter)' }}>
              No articles found in this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map(a => (
                <ArticleCard key={a.id} article={a} variant="default" />
              ))}
            </div>
          )}

          <CategoryPagination meta={meta} slug={params.slug} lang={lang} />
        </main>

        {/* ── RIGHT: Sidebar ─────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-[120px] space-y-4">

          {/* About this section */}
          {category.description && (
            <div className="border border-gray-200 bg-white">
              <div className="px-4 py-2.5 border-b-[3px] border-cni-red bg-gray-50">
                <h3 className="font-headline text-base font-bold text-gray-900">About</h3>
              </div>
              <p className="px-4 py-3 text-sm text-gray-600 leading-relaxed"
                style={{ fontFamily: 'var(--font-source-serif)' }}>
                {category.description}
              </p>
            </div>
          )}

          {/* Sub-categories list */}
          {category.children && category.children.length > 0 && (
            <div className="border border-gray-200 bg-white">
              <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500"
                  style={{ fontFamily: 'var(--font-inter)' }}>
                  In this section
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {category.children.map(c => (
                  <Link key={c.id} href={`/category/${c.slug}`}
                    className="flex items-center justify-between px-4 py-2.5 no-underline hover:bg-gray-50 transition-colors group">
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-cni-red transition-colors"
                      style={{ fontFamily: 'var(--font-inter)' }}>
                      {c.name}
                    </span>
                    <span className="text-gray-400 text-xs">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Trending in this category */}
          {trending.length > 0 && (
            <div className="border border-gray-200 bg-white">
              <div className="px-4 py-2.5 border-b-[3px] border-cni-red bg-gray-50 flex items-center justify-between">
                <h3 className="font-headline text-base font-bold text-gray-900">Most Read</h3>
                <svg className="w-4 h-4 text-cni-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <ol className="divide-y divide-gray-100">
                {trending.map((a, i) => (
                  <li key={a.id}>
                    <Link href={`/article/${a.slug}`}
                      className="group no-underline flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                      <span className="font-headline text-2xl font-bold text-gray-200 leading-none w-5 shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-headline text-sm font-bold text-gray-900 group-hover:text-cni-red line-clamp-2 leading-snug transition-colors flex-1">
                        {a.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 300×250 Ad Slot */}
          <SidebarAdSlot />

          {/* Newsletter mini-signup */}
          <div className="border border-gray-200 bg-white p-4">
            <h3 className="font-headline text-base font-bold text-gray-900 mb-1">
              Stay informed
            </h3>
            <p className="text-xs text-gray-500 mb-3" style={{ fontFamily: 'var(--font-inter)' }}>
              Get {category.name} stories delivered to your inbox.
            </p>
            <input type="email" placeholder="Your email"
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cni-blue mb-2"
              style={{ fontFamily: 'var(--font-inter)' }} />
            <button className="w-full bg-cni-blue text-white text-sm font-semibold py-2 hover:bg-cni-blue-dark transition-colors"
              style={{ fontFamily: 'var(--font-inter)' }}>
              Subscribe
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}
