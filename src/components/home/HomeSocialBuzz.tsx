/**
 * HomeSocialBuzz — mixed Facebook + YouTube feed strip
 * Placed directly below the hero grid for high social visibility.
 * Shows up to 6 items in a responsive card grid.
 */

import Link from "next/link";
import { SocialFeedThumbnail } from "./SocialFeedThumbnail";
import { formatDistanceToNow } from "date-fns";

interface FeedItem {
  id: number;
  platform: string;
  content_type: string;
  title: string | null;
  caption: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  permalink: string | null;
  posted_at: string | null;
  views_count: number | null;
  likes_count: number | null;
}

async function getSocialBuzzItems(): Promise<FeedItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${apiUrl}/api/v1/social-feed`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: FeedItem[] = data.data ?? [];
    return items
      .filter((i) => i.platform === "facebook" || i.platform === "youtube")
      .slice(0, 6);
  } catch {
    return [];
  }
}

function FacebookIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  if (platform === "facebook") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5"
        style={{
          fontFamily: "var(--font-inter)",
          backgroundColor: "#1877F2",
          color: "#fff",
        }}
      >
        <FacebookIcon /> Facebook
      </span>
    );
  }
  if (platform === "youtube") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5"
        style={{
          fontFamily: "var(--font-inter)",
          backgroundColor: "#FF0000",
          color: "#fff",
        }}
      >
        <YouTubeIcon /> YouTube
      </span>
    );
  }
  return null;
}

function PlayOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
        <svg
          className="w-3.5 h-3.5 text-white ml-0.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

export default async function HomeSocialBuzz() {
  const items = await getSocialBuzzItems();
  if (!items.length) return null;

  return (
    <section className="my-4">
      {/* Section header */}
      <div
        className="flex items-center justify-between pb-2 mb-4 border-b-[3px]"
        style={{ borderColor: "#1877F2" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <FacebookIcon />
            <YouTubeIcon />
          </div>
          <h2 className="font-headline text-xl font-bold text-gray-900">
            Social Buzz
          </h2>
        </div>
        {/* <Link
          href="/social-feeds"
          className="text-[12px] font-bold no-underline transition-colors"
          style={{ fontFamily: 'var(--font-inter)', color: '#012169' }}
          onMouseEnter={undefined}
        >
          View All →
        </Link> */}
        <Link
          href="/social-feeds"
          className="text-[12px] font-bold no-underline transition-colors hover:text-red-600"
          style={{ fontFamily: "var(--font-inter)", color: "#012169" }}
        >
          View All →
        </Link>
      </div>

      {/* Card grid — 2 cols mobile / 3 cols md / 6 cols lg */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item) => {
          const thumb = item.thumbnail_url ?? item.media_url;
          const text = item.title ?? item.caption ?? "";
          const isYT = item.platform === "youtube";

          return (
            <a
              key={item.id}
              href={item.permalink ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group block no-underline"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden mb-2">
                {thumb ? (
                  <>
                    <SocialFeedThumbnail src={thumb} />
                    {isYT && <PlayOverlay />}
                  </>
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: isYT ? "#FF0000" : "#1877F2" }}
                  >
                    {isYT ? <YouTubeIcon /> : <FacebookIcon />}
                  </div>
                )}
              </div>

              {/* Platform badge */}
              <div className="mb-1">
                <PlatformBadge platform={item.platform} />
              </div>

              {/* Caption */}
              {text && (
                <p className="text-xs font-body text-gray-800 line-clamp-2 leading-snug group-hover:text-cni-red transition-colors">
                  {text}
                </p>
              )}

              {/* Time */}
              {item.posted_at && (
                <p
                  className="text-[10px] text-gray-400 mt-0.5"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {formatDistanceToNow(new Date(item.posted_at), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
