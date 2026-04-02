/**
 * /social-feeds — Dedicated Social Feeds page
 * Shows all ingested Facebook + YouTube posts in a filterable grid.
 * Platform filter via URL search param: ?platform=all|facebook|youtube
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { SocialFeedThumbnail } from '@/components/home/SocialFeedThumbnail';
import { formatDistanceToNow } from 'date-fns';

export const metadata: Metadata = {
  title: 'Social Feeds — CNI News Network',
  description: 'Latest posts from CNI News Network on Facebook and YouTube.',
};

export const revalidate = 1800;

interface FeedItem {
  id:            number;
  platform:      string;
  content_type:  string;
  title:         string | null;
  caption:       string | null;
  thumbnail_url: string | null;
  media_url:     string | null;
  permalink:     string | null;
  posted_at:     string | null;
  views_count:   number | null;
  likes_count:   number | null;
}

async function getAllSocialItems(): Promise<FeedItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  try {
    const res = await fetch(`${apiUrl}/api/v1/social-feed`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: FeedItem[] = data.data ?? [];
    return items.filter(i => i.platform === 'facebook' || i.platform === 'youtube');
  } catch {
    return [];
  }
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function YouTubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

type Platform = 'all' | 'facebook' | 'youtube';

export default async function SocialFeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const params  = await searchParams;
  const active  = (params.platform ?? 'all') as Platform;
  const allItems = await getAllSocialItems();

  const items = active === 'all'
    ? allItems
    : allItems.filter(i => i.platform === active);

  const counts = {
    all:      allItems.length,
    facebook: allItems.filter(i => i.platform === 'facebook').length,
    youtube:  allItems.filter(i => i.platform === 'youtube').length,
  };

  const tabs: { key: Platform; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'all',      label: 'All',      icon: null,               color: '#012169' },
    { key: 'facebook', label: 'Facebook', icon: <FacebookIcon />,   color: '#1877F2' },
    { key: 'youtube',  label: 'YouTube',  icon: <YouTubeIcon />,    color: '#FF0000' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="border-b-[3px] border-cni-blue pb-3 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <FacebookIcon size={22} />
          <YouTubeIcon size={22} />
          <h1 className="font-headline text-3xl font-bold text-gray-900">Social Feeds</h1>
        </div>
        <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
          Latest posts from CNI News Network across social platforms.
        </p>
      </div>

      {/* ── Platform Filter Tabs ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tabs.map(tab => {
          const isActive = active === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.key === 'all' ? '/social-feeds' : `/social-feeds?platform=${tab.key}`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold no-underline border-2 transition-all"
              style={{
                fontFamily:      'var(--font-inter)',
                borderColor:     isActive ? tab.color : '#E5E7EB',
                backgroundColor: isActive ? tab.color : 'transparent',
                color:           isActive ? '#ffffff' : '#374151',
              }}
            >
              {tab.icon}
              {tab.label}
              <span
                className="ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                  color:           isActive ? '#fff' : '#6B7280',
                }}
              >
                {counts[tab.key]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Feed Grid ────────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4 text-gray-400">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
          </svg>
          <p className="text-base font-ui">No social posts found yet.</p>
          <p className="text-sm text-center max-w-sm">
            Follow CNI News Network on Facebook and YouTube to see content here once it&apos;s ingested.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => {
            const thumb  = item.thumbnail_url ?? item.media_url;
            const text   = item.title ?? item.caption ?? '';
            const isFB   = item.platform === 'facebook';
            const isYT   = item.platform === 'youtube';
            const accent = isFB ? '#1877F2' : '#FF0000';

            return (
              <a
                key={item.id}
                href={item.permalink ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group block no-underline border border-gray-200 hover:border-gray-400 bg-white transition-all hover:shadow-md overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {thumb ? (
                    <SocialFeedThumbnail src={thumb} />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: accent }}>
                      {isFB ? <FacebookIcon size={32} /> : <YouTubeIcon size={32} />}
                    </div>
                  )}
                  {/* YouTube play overlay */}
                  {isYT && thumb && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* Platform corner badge */}
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5"
                    style={{ backgroundColor: accent }}>
                    {isFB ? <FacebookIcon size={10} /> : <YouTubeIcon size={10} />}
                    <span className="text-white text-[9px] font-bold uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-inter)' }}>
                      {item.platform}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-3">
                  {/* Content type chip */}
                  {item.content_type && item.content_type !== 'post' && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-1"
                      style={{ fontFamily: 'var(--font-inter)' }}>
                      {item.content_type}
                    </span>
                  )}

                  {/* Title / Caption */}
                  {text && (
                    <p className="text-sm font-body text-gray-900 line-clamp-3 leading-snug group-hover:text-cni-red transition-colors">
                      {text}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-inter)' }}>
                      {item.posted_at
                        ? formatDistanceToNow(new Date(item.posted_at), { addSuffix: true })
                        : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.likes_count != null && item.likes_count > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400"
                          style={{ fontFamily: 'var(--font-inter)' }}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 1 1 3 0v6a1.5 1.5 0 0 1-3 0v-6ZM6 10.333v5.43a2 2 0 0 0 1.106 1.79l.05.025A4 4 0 0 0 8.943 18h5.416a2 2 0 0 0 1.962-1.608l1.2-6A2 2 0 0 0 15.56 8H12V4a2 2 0 0 0-2-2 1 1 0 0 0-1 1v.667a4 4 0 0 1-.8 2.4L6.8 7.933a4 4 0 0 0-.8 2.4Z"/>
                          </svg>
                          {item.likes_count.toLocaleString()}
                        </span>
                      )}
                      {item.views_count != null && item.views_count > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400"
                          style={{ fontFamily: 'var(--font-inter)' }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                          </svg>
                          {item.views_count.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* ── Follow CTA ──────────────────────────────────────────────── */}
      <div className="mt-12 py-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="https://www.facebook.com/CNINewsNetwork"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 no-underline border-2 border-gray-200 hover:border-[#1877F2] group transition-all"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1877F2' }}>
            <FacebookIcon size={24} />
          </div>
          <div>
            <p className="font-headline text-base font-bold text-gray-900 group-hover:text-[#1877F2] transition-colors">
              Follow on Facebook
            </p>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
              @CNINewsNetwork
            </p>
          </div>
          <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-[#1877F2] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
          </svg>
        </a>
        <a
          href="https://www.youtube.com/@CNINewsNetwork"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 no-underline border-2 border-gray-200 hover:border-[#FF0000] group transition-all"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#FF0000' }}>
            <YouTubeIcon size={24} />
          </div>
          <div>
            <p className="font-headline text-base font-bold text-gray-900 group-hover:text-[#FF0000] transition-colors">
              Subscribe on YouTube
            </p>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
              @CNINewsNetwork
            </p>
          </div>
          <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-[#FF0000] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
          </svg>
        </a>
      </div>

    </div>
  );
}
