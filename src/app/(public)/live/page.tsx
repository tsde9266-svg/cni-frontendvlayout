import { Metadata } from 'next';
import { liveApi } from '@/lib/api';
import type { LiveStream } from '@/types';
import LiveStreamCard from '@/components/home/LiveStreamCard';

export const metadata: Metadata = {
  title: 'Live Streams',
  description: 'Watch CNI News live streams and scheduled broadcasts.',
};

export const revalidate = 30;

async function getStreams(): Promise<LiveStream[]> {
  try {
    const res = await liveApi.streams();
    return res.data.data;
  } catch { return []; }
}

export default async function LivePage() {
  const streams = await getStreams();
  const live      = streams.filter(s => s.is_live);
  const scheduled = streams.filter(s => !s.is_live);

  return (
    <div className="max-w-site mx-auto px-4 py-8">

      {/* Live now */}
      {live.length > 0 && (
        <section className="mb-10">
          <div className="section-divider flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cni-red animate-pulse-red" />
            <h2 className="font-headline text-2xl font-bold text-gray-900">Live Now</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {live.map(s => <LiveStreamCard key={s.id} stream={s} />)}
          </div>
        </section>
      )}

      {/* Scheduled */}
      {scheduled.length > 0 && (
        <section>
          <div className="section-divider">
            <h2 className="font-headline text-2xl font-bold text-gray-900">Upcoming Streams</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {scheduled.map(s => <LiveStreamCard key={s.id} stream={s} />)}
          </div>
        </section>
      )}

      {streams.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📡</p>
          <h2 className="font-headline text-xl font-bold text-gray-700 mb-2">No live streams at the moment</h2>
          <p className="text-gray-500 font-ui text-sm">Check back soon or follow us on social media for announcements.</p>
        </div>
      )}
    </div>
  );
}
