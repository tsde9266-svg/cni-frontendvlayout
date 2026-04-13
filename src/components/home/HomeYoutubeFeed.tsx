// YouTube channel feed — public RSS feed, no API key, no quota, no DB storage
// Thumbnails served directly from img.youtube.com CDN (zero bandwidth cost)
// Set YOUTUBE_CHANNEL_ID in .env.local to enable this section

import Image from "next/image";

interface YTVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID ?? "";
const CHANNEL_HANDLE = process.env.YOUTUBE_CHANNEL_HANDLE ?? "@CNINewsNetwork";

function parseYouTubeRSS(xml: string): YTVideo[] {
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
  return entries.slice(0, 6).map((entry) => {
    const videoId =
      entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? "";
    const raw =
      entry.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const title = raw
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    const publishedAt =
      entry.match(/<published>(.*?)<\/published>/)?.[1] ?? "";
    return {
      id: videoId,
      title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      publishedAt,
    };
  });
}

async function getLatestVideos(): Promise<YTVideo[]> {
  if (!YOUTUBE_CHANNEL_ID) return [];
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,
      { next: { revalidate: 3600 } }, // 1-hour ISR cache — CDN serves this, not our server
    );
    if (!res.ok) return [];
    const xml = await res.text();
    return parseYouTubeRSS(xml);
  } catch {
    return [];
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default async function HomeYoutubeFeed() {
  const videos = await getLatestVideos();
  if (!videos.length) return null;

  const [featured, ...rest] = videos;

  return (
    <section className="my-6">
      {/* Section header */}
      <div
        className="flex items-center justify-between pb-2 border-b-[3px] mb-4"
        style={{ borderColor: "#FF0000" }}
      >
        <div className="flex items-center gap-3">
          <svg className="w-6 h-5 shrink-0" viewBox="0 0 24 17" fill="none">
            <path
              d="M23.495 2.656a3.016 3.016 0 0 0-2.122-2.136C19.505 0 12 0 12 0S4.495 0 2.627.52A3.016 3.016 0 0 0 .505 2.656 31.65 31.65 0 0 0 0 8.5a31.65 31.65 0 0 0 .505 5.844 3.016 3.016 0 0 0 2.122 2.136C4.495 17 12 17 12 17s7.505 0 9.373-.52a3.016 3.016 0 0 0 2.122-2.136A31.65 31.65 0 0 0 24 8.5a31.65 31.65 0 0 0-.505-5.844z"
              fill="#FF0000"
            />
            <path d="M9.545 12.068V4.932L15.818 8.5l-6.273 3.568z" fill="white" />
          </svg>
          <h2 className="font-headline text-xl font-bold text-gray-900">
            Latest Videos
          </h2>
        </div>
        <a
          href={`https://www.youtube.com/${CHANNEL_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 no-underline transition-colors bg-[#FF0000] hover:bg-[#cc0000]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Subscribe
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>

      {/* Grid: featured large left + 5 small right */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        {/* Featured video */}
        <a
          href={`https://www.youtube.com/watch?v=${featured.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group block no-underline"
        >
          <div className="relative aspect-video bg-gray-900 overflow-hidden">
            <Image
              src={featured.thumbnail}
              alt={featured.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 60vw"
              unoptimized // served from YouTube CDN directly — no Next.js processing cost
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="font-headline text-base font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors">
              {featured.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "var(--font-inter)" }}>
              {timeAgo(featured.publishedAt)}
            </p>
          </div>
        </a>

        {/* 5 smaller videos */}
        <div className="flex flex-col gap-3">
          {rest.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 no-underline"
            >
              <div className="relative w-32 aspect-video shrink-0 bg-gray-900 overflow-hidden">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="128px"
                  unoptimized // YouTube CDN thumbnail — no processing needed
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-red-600/90 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-headline text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors">
                  {video.title}
                </h4>
                <p className="text-[11px] text-gray-400 mt-1" style={{ fontFamily: "var(--font-inter)" }}>
                  {timeAgo(video.publishedAt)}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
