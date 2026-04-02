import { Suspense } from 'react';
import { Metadata } from 'next';
import HomeFeatured      from '@/components/home/HomeFeatured';
import HomeSocialBuzz    from '@/components/home/HomeSocialBuzz';
import HomeYoutubeFeed   from '@/components/home/HomeYoutubeFeed';
import HomeCategoryRow   from '@/components/home/HomeCategoryRow';
import HomeLatestFeed    from '@/components/home/HomeLatestFeed';
import HomeSidebar       from '@/components/home/HomeSidebar';

export const metadata: Metadata = {
  title: 'CNI News Network — Your Voice, Your News',
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-0">

      {/* ── 1. HERO GRID 70/30 ───────────────────────────────────────── */}
      <div className="py-4">
        <Suspense fallback={<div className="h-[480px] bg-gray-100 animate-pulse" />}>
          <HomeFeatured />
        </Suspense>
      </div>

      {/* ── 2. SOCIAL BUZZ — mixed Facebook + YouTube strip ──────────── */}
      <Suspense fallback={<div className="h-40 bg-gray-100 animate-pulse my-4" />}>
        <HomeSocialBuzz />
      </Suspense>

      {/* ── 3. YOUTUBE FEED — high visibility, right below hero ──────── */}
      <Suspense fallback={<div className="h-56 bg-gray-100 animate-pulse my-6" />}>
        <HomeYoutubeFeed />
      </Suspense>

      {/* ── 4. CATEGORY SECTIONS ─────────────────────────────────────── */}
      <div className="space-y-8 py-4">
        {[
          { slug: 'politics', label: 'Politics' },
          { slug: 'pakistan', label: 'Pakistan' },
          { slug: 'kashmir',  label: 'Kashmir'  },
          { slug: 'world',    label: 'World'    },
        ].map(cat => (
          <Suspense key={cat.slug} fallback={<div className="h-56 bg-gray-100 animate-pulse" />}>
            <HomeCategoryRow slug={cat.slug} label={cat.label} />
          </Suspense>
        ))}
      </div>

      {/* ── 5. LATEST NEWS + STICKY SIDEBAR ──────────────────────────── */}
      <div className="py-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <main>
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
            <HomeLatestFeed />
          </Suspense>
        </main>
        <aside className="lg:sticky lg:top-[120px]">
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
            <HomeSidebar />
          </Suspense>
        </aside>
      </div>

    </div>
  );
}
