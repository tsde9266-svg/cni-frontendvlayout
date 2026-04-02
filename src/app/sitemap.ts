import { MetadataRoute } from 'next';
import { articlesApi, categoriesApi } from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cni.co.uk';

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ── Static pages ─────────────────────────────────────────────────────────
  const staticPages = ['', '/membership', '/live', '/events', '/about', '/contact'];
  staticPages.forEach(path => {
    entries.push({
      url:              `${BASE_URL}${path}`,
      lastModified:     new Date(),
      changeFrequency:  path === '' ? 'hourly' : 'weekly',
      priority:         path === '' ? 1.0 : 0.7,
    });
  });

  // ── Categories ────────────────────────────────────────────────────────────
  try {
    const catsRes = await categoriesApi.list('en');
    const cats    = catsRes.data.data ?? [];
    cats.forEach((cat: any) => {
      entries.push({
        url:             `${BASE_URL}/category/${cat.slug}`,
        lastModified:    new Date(),
        changeFrequency: 'hourly',
        priority:        0.8,
      });
    });
  } catch { /* skip if API unavailable */ }

  // ── Articles — fetch up to 500 most recent ────────────────────────────────
  try {
    const pages  = 5; // 5 pages × 100 per page = 500 articles
    const perPage = 100;

    for (let page = 1; page <= pages; page++) {
      const res      = await articlesApi.list({ per_page: perPage, page, sort: 'published_at' });
      const articles = res.data.data ?? [];

      if (!articles.length) break;

      articles.forEach((a: any) => {
        entries.push({
          url:             `${BASE_URL}/article/${a.slug}`,
          lastModified:    a.published_at ? new Date(a.published_at) : new Date(),
          changeFrequency: 'weekly',
          priority:        a.is_featured ? 0.9 : 0.6,
          // Alternate language URLs
          alternates: {
            languages: {
              en: `${BASE_URL}/article/${a.slug}?lang=en`,
              ur: `${BASE_URL}/article/${a.slug}?lang=ur`,
            },
          },
        });
      });

      // Stop if we're on the last page
      if (articles.length < perPage) break;
    }
  } catch { /* skip if API unavailable */ }

  return entries;
}
