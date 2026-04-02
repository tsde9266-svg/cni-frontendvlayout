// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/home/HomeLiveWidget.tsx
// ─────────────────────────────────────────────────────────────────────────────
import Link from 'next/link';
import { liveApi } from '@/lib/api';
import type { LiveStream } from '@/types';

async function getLive(): Promise<LiveStream[]> {
  try {
    const res = await liveApi.streams();
    return res.data.data;
  } catch { return []; }
}

export default async function HomeLiveWidget() {
  const streams = await getLive();
  const live    = streams.filter(s => s.is_live);
  if (!live.length) return null;

  return (
    <div className="mt-6 bg-gray-900 text-white p-4 flex items-center gap-4 animate-slide-in">
      <span className="flex items-center gap-2 font-ui font-bold text-sm uppercase tracking-wider shrink-0">
        <span className="w-3 h-3 rounded-full bg-cni-red animate-pulse-red" />
        Live Now
      </span>
      <div className="flex-1 overflow-hidden">
        {live.map(s => (
          <Link
            key={s.id}
            href={`/live/${s.id}`}
            className="text-white hover:text-yellow-300 font-headline font-bold text-lg no-underline block truncate"
          >
            {s.title}
          </Link>
        ))}
      </div>
      <Link
        href="/live"
        className="btn-danger text-sm shrink-0 no-underline"
      >
        Watch Live
      </Link>
    </div>
  );
}
